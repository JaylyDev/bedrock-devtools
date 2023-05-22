import { registerChatCommand } from "chat-command";
import * as biome from "./biome";
import * as changedimension from "./changedimension";
import * as tphere from "./tphere";
import * as spectate from "./spectate";

registerChatCommand(biome.data, biome.execute);
registerChatCommand(changedimension.data, changedimension.execute);
registerChatCommand(tphere.data, tphere.execute);
registerChatCommand(spectate.data, spectate.execute);
