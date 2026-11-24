import { defineRpc } from "@getpaseo/plugin";
import { z } from "zod";

export const syncHistoryRpc = defineRpc({
  name: "antigravity.sync_history",
  input: z.object({
    agentId: z.string(),
  }),
  output: z.object({
    success: z.boolean(),
    message: z.string(),
  }),
});
