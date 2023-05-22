import { system, GameMode, Player, MinecraftEffectTypes, Entity, Vector3, Vector2 } from "@minecraft/server";
import { getGamemode } from "get-gamemode";
import { Vector } from "@minecraft/server";
import { ActionFormBuilder, MessageFormBuilder, ModalFormBuilder } from "ui-wrapper";

export const CameraOffset: Vector3 = {
  x: 0,
  y: 0.5,
  z: 0
};
/**
 * This function can't be called in read-only mode.
 * @internal
 */
export function stopSpectating (player: Player) {
  let location: Vector3 | undefined;
  let rotation: Vector2 | undefined;    
  const gameMode = player.previousGameMode;

  if (!player.spectateTarget) throw new Error("Input player does not have spectate target.");
  else if (player.spectateTarget.isValid()) {
    location = Vector.subtract(player.spectateTarget.location, CameraOffset);
    rotation = player.spectateTarget.getRotation();
  }
  else {
    location = player.spectateTarget.lastLocation ?? player.location; // spectate target has despawned. Using spectate entity last location recorded
    rotation = player.getRotation();
  };

  player.spectateTarget = undefined;
  player.previousGameMode = undefined;
  
  if (gameMode !== GameMode.spectator) player.runCommand("gamemode " + gameMode);
  player.removeEffect(MinecraftEffectTypes.invisibility);
  player.runCommand("inputpermission set @s camera enabled");
  player.runCommand("inputpermission set @s movement enabled");
  player.runCommandAsync("camera @s clear");
  player.teleport(location, { rotation: rotation });
}

export function onPlayerSpectateEntityAcquired(source: Player, entity?: Entity) {
  // No spectate target
  if (!entity && !source.spectateTarget) {
    source.sendMessage(`${source.name} is not spectating anyone`);
    return;
  }
  // Run !spectate again to clear the spectate target
  else if (!!source.spectateTarget) {
    source.sendMessage(`${source.name} is no longer spectating`);
    system.run(() => stopSpectating(source));
    return;
  }
  else if (entity?.isValid()) {
    // Set spectate target
    source.previousGameMode = getGamemode(source);
    source.spectateTarget = entity;
    if (entity instanceof Player) source.sendMessage(`${source.name} is now spectating ${entity.name}`);
    else source.sendMessage(`${source.name} is now spectating ${entity?.typeId}`);
  }
  else source.sendMessage(`§cUnable to spectate target entity (despawned).`);
};

export async function forceShow<Form extends MessageFormBuilder | ModalFormBuilder | ActionFormBuilder>(player: Player, form: Form, timeout = Infinity) {
  const startTick = system.currentTick;
  while ((system.currentTick - startTick) < timeout) {
      const response = await (form.show(player) as ReturnType<Form["show"]>);
      if (!response.canceled) {
          return response;
      }
  };
  throw new Error(`Timed out after ${timeout} ticks`);
};
