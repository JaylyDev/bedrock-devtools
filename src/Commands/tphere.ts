import { system, world } from "@minecraft/server";
import { ChatCommandBuilder, CommandArgumentString, CommandResponse } from "./handler";

export async function execute(response: CommandResponse<Record<string, CommandArgumentString>>) {
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

export const data = new ChatCommandBuilder<{ player: CommandArgumentString }>()
  .withName("!tphere")
  .withDescription("Teleport a player to current player position.")
  .withPermission(true)
  .withArgument("player", {
    type: "string",
    optional: false,
  });
