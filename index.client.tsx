import type { PluginClientContext } from "@getpaseo/plugin/client";
import { syncHistoryRpc } from "./shared/sync.js";

export default function contribute(client: PluginClientContext) {
  client.addSlashCommand({
    name: "antigravity-sync",
    description: "Check Antigravity Pro status and history replay engine",
    argumentHint: "",
    context: "agent",
    async onSubmit({ agent, rpc }) {
      const res = await rpc(syncHistoryRpc, { agentId: agent.id });
      console.log("[AntigravityPlus]", res.message);
    },
  });

  return () => {};
}
