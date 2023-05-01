import { registerChatCommand } from "./handler";
import * as biome from "./biome";
import * as changedimension from "./changedimension";
import * as tphere from "./tphere";

registerChatCommand(biome.data, biome.execute);
registerChatCommand(changedimension.data, changedimension.execute);
registerChatCommand(tphere.data, tphere.execute);