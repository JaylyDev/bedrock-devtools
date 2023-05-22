import { Block, Player, system, world } from "@minecraft/server";
import { getBlockState } from "./BlockStates";
import { BlockStates } from "@minecraft/server";
import { MsPerTick, playerCanUseDebugStick, hasCooldown, setCooldown, errorText } from "../util";
import { DebugStick } from "./itemStack";

function changeBlockState(block: Block, state: string, value: string | number | boolean, player: Player) {
  const validStates = BlockStates.get(state).validValues;
  const currentIndex = validStates.findIndex(v => v === value);
  let setIndex: number = currentIndex;
  
  // If player is sneaking, decrement index and set state. Otherwise increment index and set state.
  if (player.isSneaking) {
    if (currentIndex === 0) setIndex = validStates.length - 1;
    else setIndex--;
  }
  else {
    if (currentIndex === validStates.length - 1) setIndex = 0;
    else setIndex++;
  };

  return block.permutation.withState(state, validStates[setIndex]);
};

// Using itemUseOn event to listen for the stick being used on a block
world.beforeEvents.itemUseOn.subscribe((event) => {
  const { block, itemStack, source } = event;
  if (itemStack.typeId !== DebugStick || !(source instanceof Player) || hasCooldown(source)) return;
  if (!playerCanUseDebugStick(source)) {
    system.run(() => source.onScreenDisplay.setActionBar(errorText));
    return;
  };
  
  const blockState = getBlockState(block, source);
  
  if (!!blockState) {
    const state = blockState.state;
    const value = blockState.stateValue;
    event.cancel = true;

    const permutation = changeBlockState(block, state, value, source);
    
    system.run(() => {
      block.setPermutation(permutation);
      source.onScreenDisplay.setActionBar(`set "${state}" to ${permutation.getState(state)}`);
      setCooldown(source, MsPerTick * 5);
    });
  }
  else {
    system.run(() => source.onScreenDisplay.setActionBar(`${block.typeId} has no properties`));
  };
});