import { MinecraftDimensionTypes, system, world } from "@minecraft/server";
import { ChatCommandBuilder, CommandArgumentString, CommandResponse } from "./handler";
export async function execute(response: CommandResponse<Record<string, CommandArgumentString>>) {
    const { dimension } = response.params;
    const { sender } = response;
    system.run(() => {
        sender.teleport(sender.location, {
            dimension: world.getDimension(dimension),
        });
        sender.sendMessage(`Teleported to dimension "${dimension}"`);
    });
}
;
export const data = new ChatCommandBuilder()
    .withName("!changedimension")
    .withDescription("Teleport player to another dimension.")
    .withPermission(true)
    .withArgument("dimension", {
    choices: [
        ...Object.values(MinecraftDimensionTypes),
        ...Object.values(MinecraftDimensionTypes).map((id) => id.replace('minecraft:', ''))
    ],
    type: "string",
    optional: false,
});
//# sourceMappingURL=changedimension.js.map