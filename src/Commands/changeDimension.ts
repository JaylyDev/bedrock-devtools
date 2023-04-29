import { BeforeChatEvent, world } from "@minecraft/server";
import { MinecraftDimensionTypes } from "@minecraft/vanilla-data";

const dimensions: string[] = [
  ...Object.values(MinecraftDimensionTypes).map(id => id.replace('minecraft:', '')),
  ...Object.values(MinecraftDimensionTypes),
];

export async function execute(event: BeforeChatEvent, argv: string[]) {
  const { sender } = event;
  const [, dimension] = argv;
  event.cancel = true;

  if (!dimension) {
    sender.sendMessage(`§cPlease enter a dimension`);
  }
  else if (!dimensions.includes(dimension)) {
    sender.sendMessage(`§cDimension "${dimension}" does not exist`);
  }
  else {
    const rotation = sender.getRotation();
    sender.teleport(sender.location, world.getDimension(dimension), rotation.x, rotation.y);
    sender.sendMessage(`Teleported to dimension "${dimension}"`);
  };
};
