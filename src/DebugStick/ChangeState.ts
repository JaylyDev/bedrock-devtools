import { Block, Player, world } from "@minecraft/server";
import { getBlockState } from "./BlockStates";
import { BlockProperties } from "@minecraft/server";
import { MsPerTick, playerCanUseDebugStick, hasCooldown, setCooldown, errorText } from "../PlayerData";
import { DebugStick } from "./DebugStick";

function changeBlockState(block: Block, state: string, value: string | number | boolean, player: Player) {
  const validStates = BlockProperties.get(state).validValues;
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

  return block.permutation.withProperty(state, validStates[setIndex]);
};

// Using itemUseOn event to listen for the stick being used on a block
world.events.beforeItemUseOn.subscribe((event) => {
  const { item, source } = event;
  if (item.typeId !== DebugStick || !(source instanceof Player) || hasCooldown(source)) return;
  if (!playerCanUseDebugStick(source)) {
    source.onScreenDisplay.setActionBar(errorText);
    return;
  };
  
  const block = source.dimension.getBlock(event.getBlockLocation());
  const blockState = getBlockState(block, source);
  
  if (!!blockState) {
    const state = blockState.state;
    const value = blockState.stateValue;
    event.cancel = true;

    const permutation = changeBlockState(block, state, value, source);
    
    block.setPermutation(permutation);
    source.onScreenDisplay.setActionBar(`set "${state}" to ${permutation.getProperty(state)}`);
    setCooldown(source, MsPerTick * 5);
  }
  else {
    source.onScreenDisplay.setActionBar(`${block.typeId} has no properties`);
  };
});