import { world } from "@minecraft/server";
import * as biome from "./biome";
import * as changeDimension from "./changeDimension";

world.events.beforeChat.subscribe((event) => {
  const { message } = event;
  /**
   * Arguments in string array.
   */
  const argv = message.split(/(".*?"|[^"\s]+)+(?=\s*|\s*$)/g).filter( e => e.trim().length > 0);
  const command = argv[0];

  switch (command) {
    case "!biome":
      biome.execute(event);
      break;

    case "!changedimension":
      changeDimension.execute(event, argv);
      break;
  
    default:
      break;
  };
});
