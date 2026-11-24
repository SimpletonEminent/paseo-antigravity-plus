import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import type {
  ProviderEvent,
  ProviderToolCallDetail,
} from "@getpaseo/plugin/server/provider";

interface ReplayOptions {
  conversationId: string;
  sessionId: string;
  emit(event: ProviderEvent): void;
}

export function getTranscriptPath(conversationId: string): string {
  const home = process.env.USERPROFILE || process.env.HOME || "";
  return path.join(
    home,
    ".gemini",
    "antigravity-cli",
    "brain",
    conversationId,
    ".system_generated",
    "logs",
    "transcript.jsonl",
  );
}

export async function replayConversationHistory(options: ReplayOptions): Promise<number> {
  const { conversationId, sessionId, emit } = options;
  const transcriptPath = getTranscriptPath(conversationId);
  if (!fs.existsSync(transcriptPath)) return 0;

  const fileStream = fs.createReadStream(transcriptPath, { encoding: "utf8" });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let currentTurnId: string | null = null;
  let eventCount = 0;
  const pendingTools: Array<{
    name: string;
    args: Record<string, unknown>;
    stepIndex: number;
    subIndex: number;
    callId: string;
  }> = [];

  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      const entry = JSON.parse(line);
      const stepIndex = typeof entry.step_index === "number" ? entry.step_index : eventCount;

      if (entry.type === "USER_INPUT") {
        if (currentTurnId) {
          emit({
            type: "session.turn",
            sessionId,
            turnId: currentTurnId,
            state: "completed",
          });
          currentTurnId = null;
        }

        currentTurnId = `turn-${stepIndex}`;
        emit({
          type: "session.turn",
          sessionId,
          turnId: currentTurnId,
          state: "started",
        });

        const raw = entry.content || "";
        const match = raw.match(/<USER_REQUEST>([\s\S]*?)<\/USER_REQUEST>/);
        const text = match ? match[1].trim() : raw;

        emit({
          type: "timeline.item",
          sessionId,
          item: {
            type: "user_message",
            id: `user-${stepIndex}`,
            clientMessageId: `user-${stepIndex}`,
            text,
          },
        });
        eventCount++;
      } else if (entry.type === "PLANNER_RESPONSE") {
        if (entry.thinking) {
          emit({
            type: "timeline.item",
            sessionId,
            item: {
              type: "reasoning",
              id: `reasoning-${stepIndex}`,
              text: entry.thinking,
            },
          });
          eventCount++;
        }

        if (Array.isArray(entry.tool_calls) && entry.tool_calls.length > 0) {
          for (let i = 0; i < entry.tool_calls.length; i++) {
            const tc = entry.tool_calls[i];
            const callId = `tool-${stepIndex}-${i}`;
            const toolRecord = {
              name: tc.name || "Tool",
              args: (tc.args || {}) as Record<string, unknown>,
              stepIndex,
              subIndex: i,
              callId,
            };
            pendingTools.push(toolRecord);
            emit({
              type: "timeline.item",
              sessionId,
              item: {
                type: "tool_call",
                id: callId,
                callId,
                name: toolRecord.name,
                detail: buildHistoricalToolDetail(toolRecord.name, toolRecord.args),
                status: "completed",
                error: null,
              },
            });
            eventCount++;
          }
        }

        if (entry.content) {
          emit({
            type: "timeline.item",
            sessionId,
            item: {
              type: "assistant_message",
              id: `asst-${stepIndex}`,
              messageId: `asst-${stepIndex}`,
              text: entry.content,
            },
          });
          eventCount++;
        }
      } else if (entry.type === "GENERIC") {
        const tool = pendingTools.shift();
        if (tool && entry.content) {
          emit({
            type: "timeline.item",
            sessionId,
            item: {
              type: "tool_call",
              id: tool.callId,
              callId: tool.callId,
              name: tool.name,
              detail: buildHistoricalToolDetail(tool.name, tool.args, entry.content),
              status: "completed",
              error: null,
            },
          });
        }
      }
    } catch {
      // Ignore JSON parse errors
    }
  }

  if (currentTurnId) {
    emit({
      type: "session.turn",
      sessionId,
      turnId: currentTurnId,
      state: "completed",
    });
  }

  return eventCount;
}

function buildHistoricalToolDetail(
  name: string,
  args: Record<string, unknown>,
  output?: string,
): ProviderToolCallDetail {
  const path = (args.Path || args.AbsolutePath || args.TargetFile) as string | undefined;
  if (name === "run_command" && typeof args.CommandLine === "string") {
    return { type: "shell", command: args.CommandLine, output };
  }
  if ((name === "read_file" || name === "view_file") && typeof path === "string") {
    return { type: "read", filePath: path, content: output };
  }
  if (name === "write_file" || name === "write_to_file") {
    return { type: "write", filePath: path || "" };
  }
  if (
    name === "edit_file" ||
    name === "replace_file_content" ||
    name === "multi_replace_file_content"
  ) {
    return { type: "edit", filePath: path || "" };
  }
  return { type: "plain_text", label: name, text: output || JSON.stringify(args) };
}
