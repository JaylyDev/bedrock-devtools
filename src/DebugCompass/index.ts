import { system, world, GameMode, MinecraftEffectTypes, Player, Vector3, Vector } from "@minecraft/server";
import { getGamemode } from "get-gamemode";
import { DebugCompass } from "./itemStack";
import { CameraOffset, forceShow, onPlayerSpectateEntityAcquired, stopSpectating } from "./spectate";
import { ActionFormBuilder, ActionFormButton } from "ui-wrapper";

function getBlockInFront(headLocation: Vector3, viewDirection: Vector3): Vector3 {
  const stepSize = 0.5;
  const dx = stepSize * viewDirection.x;
  const dy = stepSize * viewDirection.y;
  const dz = stepSize * viewDirection.z;
  const x = headLocation.x + dx;
  const y = headLocation.y + dy;
  const z = headLocation.z + dz;
  return { x, y, z };
};

/**
 * Fix X rotation for some entities
 */
enum EntityTypeRotation {
  "minecraft:chest_minecart" = 90,
  "minecraft:command_block_minecart" = 90,
  "minecraft:hopper_minecart" = 90,
  "minecraft:minecart" = 90,
  "minecraft:tnt_minecart" = 90,
  "minecraft:ender_dragon" = 180,
  "minecraft:boat" = 90,
  "minecraft:chest_boat" = 90,
};

// API callbacks
system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    if (!player.spectateTarget?.isValid()) continue;
    const headLocation = Vector.add(player.spectateTarget.getHeadLocation(), CameraOffset);
    const viewDirection = player.spectateTarget.getViewDirection();
    const rotation = player.spectateTarget.getRotation();
    const gameMode = getGamemode(player);
    const facingLocation = getBlockInFront(headLocation, viewDirection);
    const duration = 20000000;
    player.spectateTarget.lastLocation = headLocation;

    // Modify state
    if (player.spectateTarget.typeId in EntityTypeRotation) rotation.y += EntityTypeRotation[player.spectateTarget.typeId as keyof typeof EntityTypeRotation];    
    if (gameMode !== GameMode.spectator) player.runCommand("gamemode spectator");

    player.addEffect(MinecraftEffectTypes.invisibility, duration, { amplifier: 1, showParticles: false });
    player.runCommand(`execute as @s at @s anchored eyes run camera @s set minecraft:free ease 0.1 linear pos ${facingLocation.x} ${facingLocation.y} ${facingLocation.z} rot ${rotation.x} ${rotation.y}`);
    player.runCommand("inputpermission set @s camera disabled");
    player.runCommand("inputpermission set @s movement disabled");
  }
});

// Force player to stop spectating when entities die
world.afterEvents.entityDie.subscribe(({ deadEntity }) => {
  for (const player of world.getAllPlayers()) {
    if (player.spectateTarget !== deadEntity) continue;
    stopSpectating(player);
  }; 
});

// Detects whether player uses a compass to open modal, which then spectate selected entity
world.afterEvents.itemUse.subscribe(async ({ itemStack, source }) => {
  if (itemStack.typeId !== DebugCompass || !(source instanceof Player)) return;

  const actionForm = new ActionFormBuilder();
  const entitiesFromViewDirection = source.getEntitiesFromViewDirection({ maxDistance: 64 });

  // No spectate target
  if (entitiesFromViewDirection.length <= 0) {
    source.sendMessage(`${source.name} is not spectating anyone`);
    return;
  };

  actionForm.title("Spectate Menu");
  actionForm.body("Select entity you want to spectate.");
  actionForm.buttons = entitiesFromViewDirection.map(entity => {
    if (entity instanceof Player) return new ActionFormButton(entity.name);
    else if (!!entity.nameTag) return new ActionFormButton(`${entity.typeId} (${entity.nameTag})`);
    else return new ActionFormButton(entity.typeId);
  });

  const response = await forceShow(source, actionForm);
  if (typeof response.selection !== "number") throw new Error("ActionFormResponse::selection not received");

  const entity = entitiesFromViewDirection[response.selection];
  onPlayerSpectateEntityAcquired(source, entity);
});