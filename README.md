<h1 align="center">
  <a href="https://panache.so">
    Panache
  </a>
</h1>

<p align="center">
  <strong>Email once. Echo forever.</strong>
</p>

<p align="center">
  <a href="./LICENSE.md">License</a>
</p>

## Introduction

Panache is a newsletter platform, designed for creators.

It can be regarded as an open-source alternative to Substack/Beehiiv.

## Getting started

### Requirements

- NodeJS & NPM
- Git

### Installation

1. Clone the repository:

```bash
git clone https://github.com/panachetechnologies/panache
```

2. Change directory:

```bash
cd panache
```

3. Install dependencies:

```bash
npm install
```

4. Set up environment variables:

```bash
cp .env.example .env
```

5. Run migration:

```bash
node ace migration:run
```

6. Start development server:

```bash
npm run dev
```
