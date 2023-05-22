import { EntityInventoryComponent, Player, world } from "@minecraft/server";
import { getBlockState } from "./BlockStates";
import { DebugStick } from "./DebugStick";
import { errorText, playerCanUseDebugStick } from "../PlayerData";

// Using entityHit to listen for the stick being hit on a block
world.events.entityHit.subscribe((event) => {
  const { entity, hitBlock } = event;
  if (!(entity instanceof Player) || !hitBlock) return;
  const inventory = entity.getComponent(EntityInventoryComponent.componentId) as EntityInventoryComponent;
  const selectedItem = inventory.container.getItem(entity.selectedSlot);

  if (selectedItem?.typeId !== DebugStick) return;
  else if (!playerCanUseDebugStick(entity)) {
    entity.onScreenDisplay.setActionBar(errorText);
    return;
  };

  const blockState = getBlockState(hitBlock, entity);
  
  if (!!blockState) {
    const { validStates } = blockState;
    // Check if player instance has block type stored as cache, and validate if the block type is same as player hitting.
    // If so get player.stateIndex, and display selected state and value
    if (entity.blockType === hitBlock.typeId && typeof entity.stateIndex === "number") {
      // Change state index, if entity.stateIndex over the validStates length, reset to 0, or if player is sneaking check if stateIndex is below 0, if so set to validStates.length - 1.
      if (entity.isSneaking) {
        if (entity.stateIndex <= 0) {
          entity.stateIndex = validStates.length - 1;
        } else entity.stateIndex--;
      } else {
        if (entity.stateIndex >= validStates.length - 1) {
          entity.stateIndex = 0;
        } else entity.stateIndex++;
      }
      
      const newState = validStates[entity.stateIndex];
      const newStateValue = hitBlock.permutation.getProperty(newState);

      entity.onScreenDisplay.setActionBar(`selected "${newState}": ${newStateValue}`);
    }
    else {
      entity.blockType = hitBlock.typeId;
      entity.stateIndex = 0;
      const currentState = validStates[entity.stateIndex];
      const currentStateValue = hitBlock.permutation.getProperty(currentState);

      entity.onScreenDisplay.setActionBar(`selected "${currentState}": ${currentStateValue}`);
    };
  }
  else {
    entity.onScreenDisplay.setActionBar(`${hitBlock.typeId} has no properties`);
  };
});