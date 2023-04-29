import { ChatSendBeforeEvent, system, world } from "@minecraft/server";
import { MinecraftDimensionTypes } from "@minecraft/vanilla-data";

const dimensions: string[] = [
  ...Object.values(MinecraftDimensionTypes).map(id => id.replace('minecraft:', '')),
  ...Object.values(MinecraftDimensionTypes),
];

export async function execute(event: ChatSendBeforeEvent, argv: string[]) {
  const { sender } = event;
  const [, dimension] = argv;
  event.cancel = true;

  if (!dimension) {
    sender.sendMessage(`§cPlease enter a dimension`);
  }
  else if (!dimensions.includes(dimension)) {
    sender.sendMessage(`§cDimension "${dimension}" does not exist`);
  }
  else system.run(() => {
    sender.teleport(sender.location, {
      dimension: world.getDimension(dimension),
    });
    sender.sendMessage(`Teleported to dimension "${dimension}"`);
  });
};
