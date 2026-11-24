# Paseo Plugin: Antigravity Pro

A Paseo plugin providing Google Antigravity (`agy`) integration with full conversation history replay and built-in proxy support.

## Features

- **Full Conversation History Replay**: Automatically parses and re-streams past turns (user messages, reasoning, tool executions, outputs, and model answers) from `~/.gemini/antigravity-cli/brain/<conversationId>` whenever an agent session is reopened.
- **Proxy Aware**: Automatically respects and passes `HTTP_PROXY`, `HTTPS_PROXY`, and `NODE_USE_ENV_PROXY` (defaulting to local `http://127.0.0.1:7890` if detected) so Antigravity CLI connects reliably.
- **Seamless Antigravity CLI Integration**: Full access mode with `agy --dangerously-skip-permissions` for unattended agent runs.
- **Client Slash Command**: Includes `/antigravity-sync` to verify plugin connectivity and session sync state.

## Installation

### In Paseo Desktop UI

1. Open **Settings** (设置) -> **Plugins** (插件).
2. Click **Install from source** (从来源安装).
3. In the input box, enter:
   ```text
   github:SimpletonEminent/paseo-antigravity-plus
   ```
4. Click **Install** (安装).

### Via Paseo CLI

```bash
paseo plugin install github:SimpletonEminent/paseo-antigravity-plus
```

Or install from local source directory:

```bash
paseo plugin install D:\000_AIuse\paseo-antigravity-plus
```

## Requirements

- Paseo >= 0.10.0
- Antigravity CLI (`agy`) installed and authenticated on your machine

## License

MIT
