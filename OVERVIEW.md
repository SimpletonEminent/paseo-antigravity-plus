# Antigravity Pro

Antigravity Pro adds support for Google Antigravity with full conversation history restoration and proxy support.

## How it works

When resuming an existing Antigravity session, the standard Antigravity CLI does not stream previous turns through standard output. Antigravity Pro bridges this gap by reading the conversation transcript from the local Antigravity brain store and replaying previous turns into the Paseo timeline upon session opening.

All historical messages, tool calls, and assistant replies remain visible across restarts, workspace switches, and daemon reloads.

## Setup

Ensure the Antigravity CLI (`agy`) is installed and authenticated on the daemon machine:

1. Install `agy` and ensure it is available on your PATH.
2. Run `agy` once in your terminal to sign in with your Google account.
3. Select Antigravity Pro from the provider list in Paseo.

If your network requires a proxy, Antigravity Pro automatically detects and applies HTTP_PROXY, HTTPS_PROXY, and NODE_USE_ENV_PROXY settings.

## Capabilities

Antigravity Pro provides the full Antigravity toolset:
- Model selection including Gemini 3.8 Flash, Gemini 3.8 Pro, and other available models.
- Execution with full permissions to run commands, edit files, and invoke subagents.
- Complete conversation replay on resume so historical turns are never lost.
