import { ItemTypes } from "@minecraft/server";

/**
 * Identifier of the item. Do not change.
 */
export const DebugStick = "jayly:debug_stick";
/**
 * @beta
 */
export const DebugStickItem = ItemTypes.get(DebugStick);
/**
 * Decides whether the item is only usable in creative mode.
 */
export const UseDebugStickInCreativeOnly = true;
