import { system, world } from "@minecraft/server";
import { ChatCommandBuilder, CommandArgumentString, CommandResponse } from "chat-command";

interface ChatCommandParams extends Record<string, CommandArgumentString> {
  player: CommandArgumentString
};

export async function execute(response: CommandResponse<ChatCommandParams>) {
  const { player: playerName } = response.params;
  const { sender } = response;
  const { x, y, z } = sender.location;

  const player = world.getAllPlayers().find(player => player.name === playerName);
  if (!player) sender.sendMessage(`§cPlayer "${playerName}" not found.`);
  else system.run(() => {
    player.teleport({ x, y, z }, { dimension: sender.dimension });
    sender.sendMessage(`Teleported player "${playerName}" to ${x.toFixed()} ${y.toFixed()} ${z.toFixed()}.`);
  });
};

export const data = new ChatCommandBuilder<ChatCommandParams>()
  .withName("!tphere")
  .withDescription("Teleport a player to current player position.")
  .withPermission(true)
  .withArgument("player", {
    type: "string",
    optional: false,
  });
