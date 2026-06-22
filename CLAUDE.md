# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running Servers / Docker

Always run Docker and other long-running commands in detached/background mode:
- Docker Compose: `docker compose up -d` (never `docker compose up` without `-d`)
- Docker: `docker run -d ...`
- For Bash tool calls: use `run_in_background: true`

This prevents Claude Code from hanging while waiting for a blocking process.
