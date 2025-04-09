import { args, BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { z } from 'zod'
import { GladiaClient, Utterance } from 'gladia'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import { createAnthropic } from '@ai-sdk/anthropic'
import { generateObject, generateText } from 'ai'
import env from '#start/env'
import Transcription from '#models/transcription'
import KeyMoment from '#models/key-moment'

const keyMomentSchema = z.object({
  keyMoments: z.array(
    z.object({
      start: z.number(),
      end: z.number(),
      description: z.string(),
    })
  ),
})

const DESCRIPTION_EXAMPLE = `Palmer Luckey explains why science fiction is a great place to look for ideas

"One of the things that I've realized in my career is that nothing I ever come up with will be new. I've literally never come up with an idea that a science fiction author has not come up with before."

Palmer continues:

"It makes sense. There's a lot of [science fiction authors]. They've been around for a long time. And they don't have to make things. And they don't have to wait for the right moment. I started Oculus at just the right moment for it to succeed. But a science fiction author doesn't have to wait for something to be possible to think about it and to write about it and for people to be excited about the idea. And so every time I've come up with something, I've been able to find -- usually many, sometimes one --  science fiction pieces addressing literally exactly that idea by some guy who just thought about it like 50 years ago."

He gives a few examples:

"Some of the stuff that I'm building today, for example, in the AR/VR space around augmenting the vision of soldiers -- these are ideas that are from 1959 Starship Troopers novels. These are old ideas that have only recently become technologically feasible. The idea of autonomous fighter jets, that's been around for about 100 years... people have been thinking about this since computers were programmed with punchcards."

So if you're having a hard time thinking of startup ideas, try reading science fiction.

Video source: @ShawnRyan762 (2025)`

export default class GenerateExtracts extends BaseCommand {
  static commandName = 'generate:extracts'
  static description = 'Extract key moments from podcast transcription'

  @args.string({
    description: 'The YouTube video ID',
  })
  declare youtubeVideoId: string

  static options: CommandOptions = {
    startApp: true,
  }

  private readonly tmpDir = './tmp'
  private readonly execAsync = promisify(exec)

  private async ensureTmpDirectory() {
    try {
      await fs.access(this.tmpDir)
    } catch {
      await fs.mkdir(this.tmpDir)
    }
  }

  private getVideoPath(id: string): string {
    return `${this.tmpDir}/${id}.mp4`
  }

  private async downloadVideo(id: string): Promise<string> {
    await this.ensureTmpDirectory()

    const outputTemplate = `${this.tmpDir}/%(id)s.%(ext)s`
    const command = `yt-dlp -o "${outputTemplate}" ${id}`

    this.logger.info('Downloading video...')
    await this.execAsync(command)

    return this.getVideoPath(id)
  }

  private async getOrDownloadVideo(id: string): Promise<string> {
    const videoPath = this.getVideoPath(id)
    try {
      await fs.access(videoPath)
      this.logger.info('Video already exists, skipping download')
      return videoPath
    } catch {
      return this.downloadVideo(id)
    }
  }

  private async generateExtractVideo(
    inputPath: string,
    start: number,
    end: number,
    outputPath: string
  ): Promise<void> {
    const duration = end - start

    // More robust ffmpeg command with proper seeking and error handling
    const command = `ffmpeg -y \
      -ss ${start} \
      -i "${inputPath}" \
      -t ${duration} \
      -c:v libx264 \
      -preset medium \
      -c:a aac \
      -avoid_negative_ts make_zero \
      -fflags +genpts \
      "${outputPath}"`

    this.logger.info(`Generating extract from ${start}s to ${end}s...`)

    try {
      const { stdout, stderr } = await this.execAsync(command)

      // Check if output file exists and has content
      const stats = await fs.stat(outputPath)
      if (stats.size === 0) {
        throw new Error('Generated video file is empty')
      }

      if (stderr) {
        this.logger.warning(`ffmpeg warnings: ${stderr}`)
      }

      this.logger.success(`Successfully generated extract: ${outputPath}`)
    } catch (error) {
      this.logger.error(`Failed to generate extract: ${error}`)
      // Clean up failed output file if it exists
      try {
        await fs.unlink(outputPath)
      } catch (cleanupError) {
        this.logger.warning(`Failed to clean up output file: ${cleanupError}`)
      }
      throw new Error(`Failed to generate video extract: ${error}`)
    }
  }

  private async getKeyMoments(utterances: Utterance[]): Promise<{
    keyMoments: {
      start: number
      end: number
      description: string
    }[]
  }> {
    const anthropic = createAnthropic({
      apiKey: env.get('ANTHROPIC_API_KEY')!,
    })

    // Calculate total duration from utterances
    const totalDuration = utterances.reduce((max, u) => Math.max(max, u.end), 0)

    const relevantTranscriptionData = utterances.map((u) => ({
      text: u.text,
      start: u.start,
      end: u.end,
    }))

    // First, get the LLM's analysis and suggestions
    const { text: analysis } = await generateText({
      model: anthropic('claude-3-5-sonnet-latest'),
      maxRetries: 10,
      tools: {
        checkDuration: {
          description: 'Check if the duration of the key moment is around 3 minutes',
          parameters: z.object({
            duration: z.number(),
          }),
          execute: async ({ duration }) => {
            if (duration < 180 - 45 || duration > 180 + 45) {
              return {
                error: `Invalid duration: ${duration}s. Must be between 135 and 225 seconds.`,
              }
            }
            return { duration }
          },
        },
      },
      prompt: `You are an expert podcast analyst. Analyze the following podcast transcript and identify the best key moments.

      IMPORTANT RULES:
      1. Each key moment MUST be around 3 minutes long (180 seconds ± 45 seconds)
      2. Start and end times MUST align with actual speech segments
      3. Start time MUST be at the beginning of a sentence
      4. End time MUST be at the end of a sentence
      5. Total video duration: ${Math.round(totalDuration)} seconds
      6. SKIP ANY MOMENTS THAT ARE ABOUT THE HOST/PRESENTER/INTERVIEWER
      7. Focus ONLY on the guest's most interesting, emotional, or important moments

      For each key moment, analyze:
      1. The start time (in seconds) - MUST be at the start of a sentence
      2. The end time (in seconds) - MUST be at the end of a sentence
      3. A clear description of what happens in this moment

      Make sure:
      - Timestamps are accurate and align with actual speech segments
      - Descriptions are concise but informative
      - Each moment captures a complete thought or discussion
      - Moments don't overlap
      - Moments are chronologically ordered
      - Each moment is approximately 3 minutes long (180 seconds)

      Skip moments that:
      - Are about the host/presenter/interviewer
      - Are not particularly interesting, emotional, or important to the overall narrative
      - Are just introductions, transitions, or technical setup
      - Are significantly shorter or longer than 3 minutes

      I only want UP TO 3 key moments (could be less, but not more).

      Here is an example of the point 3. clear descriptions of the key moments: ${DESCRIPTION_EXAMPLE}.

      You should write the description like the example above.

      Even including the transcription if it's relevant to the key moments.

      Podcast transcript:
      ${JSON.stringify(relevantTranscriptionData)}

      If the transcript is in french, write the descriptions in french.
      If the transcript is in english, write the descriptions in english.

      Analyze the transcript and suggest the best key moments, focusing ONLY on the guest's content and ensuring each moment is approximately 3 minutes long.`,
    })

    // Then, get the LLM to format its analysis into the required structure
    const { object } = await generateObject({
      model: anthropic('claude-3-5-sonnet-20240620'),
      schema: keyMomentSchema,
      prompt: `Based on the following analysis of a podcast transcript, format the key moments into the required structure.

      Analysis:
      ${analysis}

      Format this into an object with a 'keyMoments' array containing:
      - start: number (in seconds)
      - end: number (in seconds)
      - description: string

        Here is an example of the point 3. clear descriptions of the key moments: ${DESCRIPTION_EXAMPLE}.

      You should write the description like the example above.

      Even including the transcription if it's relevant to the key moments.

      Make sure the timestamps are accurate and the descriptions are clear.`,
    })

    // Validate and adjust key moments
    const validatedKeyMoments = object.keyMoments.map((moment) => {
      // Find closest utterance boundaries with more precise matching
      const startUtterance = utterances.find((u) => Math.abs(u.start - moment.start) < 0.5)
      const endUtterance = utterances.find((u) => Math.abs(u.end - moment.end) < 0.5)

      if (!startUtterance || !endUtterance) {
        this.logger.warning(
          `Could not find exact utterance boundaries for moment: ${moment.start}s - ${moment.end}s`
        )
      }

      const validatedStart = startUtterance?.start ?? moment.start
      const validatedEnd = endUtterance?.end ?? moment.end
      const duration = validatedEnd - validatedStart

      // Log validation details
      this.logger.info(`Validating moment: ${moment.start}s - ${moment.end}s (${duration}s)`)

      return {
        ...moment,
        start: validatedStart,
        end: validatedEnd,
      }
    })

    // Sort moments chronologically and ensure no overlaps
    validatedKeyMoments.sort((a, b) => a.start - b.start)

    // Check for overlaps
    for (let i = 1; i < validatedKeyMoments.length; i++) {
      if (validatedKeyMoments[i].start < validatedKeyMoments[i - 1].end) {
        this.logger.warning(
          `Overlapping moments detected: ${validatedKeyMoments[i - 1].start}s-${validatedKeyMoments[i - 1].end}s and ${validatedKeyMoments[i].start}s-${validatedKeyMoments[i].end}s`
        )
      }
    }

    // Log final validation results
    validatedKeyMoments.forEach((moment, index) => {
      const duration = moment.end - moment.start
      this.logger.info(`Key moment ${index + 1}: ${duration}s (${moment.start}s - ${moment.end}s)`)
    })

    return { keyMoments: validatedKeyMoments }
  }

  private async generateExtractVideos(
    videoPath: string,
    keyMoments: {
      start: number
      end: number
      description: string
    }[],
    videoId: string
  ): Promise<void> {
    for (const moment of keyMoments) {
      const extractPath = `${this.tmpDir}/${videoId}_${moment.start}-${moment.end}.mp4`
      await this.generateExtractVideo(videoPath, moment.start, moment.end, extractPath)
      this.logger.success(`Generated extract: ${extractPath}`)
    }
  }

  /**
   * Get transcription from database or download it from Gladia.
   * If it already exists in the database, return it.
   * If it doesn't exist, download it from Gladia, save it to the database and return it.
   * @param videoId
   */
  private async getUtterances(videoId: string): Promise<Utterance[]> {
    const transcription = await Transcription.findBy('youtubeVideoId', videoId)
    if (transcription) {
      return transcription.utterances
    }

    const client = new GladiaClient({
      apiKey: env.get('GLADIA_API_KEY') || 'your-api-key',
      diarization: true,
    })

    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`
    const result = await client.transcribeVideo(youtubeUrl, {}, { maxRetries: 1000 })
    await Transcription.create({
      youtubeVideoId: videoId,
      utterances: result.result?.transcription?.utterances || [],
    })

    return result.result?.transcription?.utterances || []
  }

  private async saveKeyMoments(
    keyMoments: {
      start: number
      end: number
      description: string
    }[],
    videoId: string
  ): Promise<void> {
    for (const moment of keyMoments) {
      const extractPath = `${this.tmpDir}/${videoId}_${moment.start}-${moment.end}.mp4`
      await KeyMoment.create({
        youtubeVideoId: videoId,
        start: moment.start,
        end: moment.end,
        description: moment.description,
        videoPath: extractPath,
      })
    }
  }

  async run() {
    try {
      // 1. Get or download video
      const videoPath = await this.getOrDownloadVideo(this.youtubeVideoId)
      this.logger.success(`Video ready at: ${videoPath}`)

      // 2. Get transcription
      const utterances = await this.getUtterances(this.youtubeVideoId)

      // 3. Process transcription and get key moments
      const { keyMoments } = await this.getKeyMoments(utterances)

      // 4. Save key moments to database and generate videos
      await this.saveKeyMoments(keyMoments, this.youtubeVideoId)
      await this.generateExtractVideos(videoPath, keyMoments, this.youtubeVideoId)

      this.logger.success('Key moments saved and videos generated successfully')
    } catch (error) {
      this.logger.error('Failed to process video')
      console.error(error)
      throw error
    }
  }
}
