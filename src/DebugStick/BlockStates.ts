import { Block, Player } from "@minecraft/server";

interface BlockState {
  state: string;
  stateValue: string | boolean | number;
  validStates: string[];
};

export const getBlockState = (block: Block, player: Player): BlockState | undefined => {
  // When player clicks on a block, show block property in action bar i.e 'selected "age": 0'
  const blockStates = block.permutation.getAllStates();
  const statesKeys = Object.keys(blockStates);

  if (statesKeys.length > 0) {
    let stateIndex: number;

    if (typeof player.stateIndex !== "number" || player.blockType !== block.typeId) stateIndex = 0;
    else stateIndex = player.stateIndex;

    if (stateIndex >= statesKeys.length) stateIndex = 0;
    if (stateIndex < 0) stateIndex = statesKeys.length - 1;

    const state = statesKeys[stateIndex];
    const stateValue = blockStates[state];
    const validStates = Object.keys(blockStates);
    return { state, stateValue, validStates };
  }
}