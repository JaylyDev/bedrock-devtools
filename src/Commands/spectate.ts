import { ChatCommandBuilder, CommandArgumentData, CommandResponse } from "chat-command";
import { onPlayerSpectateEntityAcquired } from "../DebugCompass/spectate";

interface ChatCommandParams extends Record<string, CommandArgumentData> {};

export async function execute(response: CommandResponse<ChatCommandParams>) {
  const { sender } = response;
  onPlayerSpectateEntityAcquired(sender);
};

export const data = new ChatCommandBuilder<ChatCommandParams>()
  .withName("!spectate")
  .withDescription("Stops spectating.")
  .withPermission(true);
