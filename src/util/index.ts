import { Entity, GameMode, MinecraftDimensionTypes, Player, TicksPerSecond, world } from "@minecraft/server"
import { UseDebugStickInCreativeOnly } from "../DebugStick/itemStack";
import { getGamemode } from "get-gamemode";

declare module "@minecraft/server" {
  interface Entity {
    /**
     * Returns false if the entity has died or been despawned for some other reason.
     */
    isValid(): boolean;
    lastLocation?: Vector3;
  }
  interface Player {
    // Debug stick data
    cooldown?: number;
    stateIndex?: number;
    blockType?: string;
    // Spectate data
    previousGameMode?: GameMode;
    spectateTarget?: Entity;
  }
};

Entity.prototype.isValid = function isValid () {
  return world.getDimension(MinecraftDimensionTypes.overworld)
              .getEntities()
              .findIndex(entity => entity === this) > -1;
};

/**
 * Set cooldown for player
 * @param player 
 * @param time ms
 */
export function setCooldown(player: Player, time: number) {
  player.cooldown = Date.now() + time;
};

/**
 * Check if player has cooldown
 * @param player 
 * @returns Whether player has cooldown
 */
export function hasCooldown(player: Player) {
  if (typeof player.cooldown !== "number") return false;
  return player.cooldown > Date.now();
} 

/**
 * How many ms per tick.
 */
export const MsPerTick: number = 1000 / TicksPerSecond;

export function playerCanUseDebugStick(player: Player) {
  if (UseDebugStickInCreativeOnly) return getGamemode(player) === GameMode.creative;
  else true;
}
  
export const errorText = `§dDebug Stick §rcan only be used in ${GameMode.creative} mode`;