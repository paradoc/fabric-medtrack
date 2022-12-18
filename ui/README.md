# MedTrack UI

## The UI will consist of 3 main routes:
- /dispatcher
  - Creates dipatch orders for patients to use
  - Should *ideally* be accessible only from certain IP addresses (e.g. internal pharmacy networks), but we will apply a faux authentication mechanism for the time being
- /collector
  - Main interface that patients will use to send updates
  - PWA-enabled route
- /watcher
  - A publicly-accessible interface where anyone can check visualized data

All routes are PWA-enabled and should be able to have offline access when applicable. Specifically, this enables patients with weak or no internet connectivity to use the application seamlessly. 

## Mockups

https://www.figma.com/file/05shuQCk9Z9AMOAM4fdQeG/IS295?node-id=0%3A1

## Technology Stack

### Vite
  - Frontend tooling; enables PWA
### React
  - Main frontend library for development
### Typescript
  - For built-in static typing
### pnpm
  - Modern and fast package manager

## Installation

```bash
pnpm install
```

### Usage

*NOTE: Running a local instance will require you to configure SSL for localhost: https://github.com/FiloSottile/mkcert*

Place the keys under `.src/keys` (See `vite.config.ts`: `server.https` for the filenames)

```bash
pnpm run start
```