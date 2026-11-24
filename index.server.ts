import type { PluginServerContext } from "@getpaseo/plugin/server";
import { createAntigravityPlusProvider } from "./server/provider.js";
import { syncHistoryRpc } from "./shared/sync.js";

export default function contribute(server: PluginServerContext) {
  server.registerProvider(createAntigravityPlusProvider());

  server.handle(syncHistoryRpc, async ({ agentId }) => {
    return {
      success: true,
      message: `Antigravity Pro provider is active. Sessions resumed with Antigravity Pro automatically replay full conversation history.`,
    };
  });

  return () => {};
}
