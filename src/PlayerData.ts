import { GameMode, Player, TicksPerSecond } from "@minecraft/server"
import { UseDebugStickInCreativeOnly } from "./DebugStick/DebugStick";
import { getGamemode } from "./get-gamemode";

declare module "@minecraft/server" {
  interface Player {
    cooldown?: number;
    stateIndex?: number;
    blockType?: string;
  }
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