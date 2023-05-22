class MinecraftColor {
  black<V extends string>(text: V): `§0${V}§r` { return `§0${text}§r` };
  darkBlue<V extends string>(text: V): `§1${V}§r` { return `§1${text}§r` };
  darkGreen<V extends string>(text: V): `§2${V}§r` { return `§2${text}§r` };
  darkAqua<V extends string>(text: V): `§3${V}§r` { return `§3${text}§r` };
  darkRed<V extends string>(text: V): `§4${V}§r` { return `§4${text}§r` };
  darkPurple<V extends string>(text: V): `§5${V}§r` { return `§5${text}§r` };
  gold<V extends string>(text: V): `§6${V}§r` { return `§6${text}§r` };
  gray<V extends string>(text: V): `§7${V}§r` { return `§7${text}§r` };
  darkGray<V extends string>(text: V): `§8${V}§r` { return `§8${text}§r` };
  blue<V extends string>(text: V): `§9${V}§r` { return `§9${text}§r` };
  green<V extends string>(text: V): `§a${V}§r` { return `§a${text}§r` };
  aqua<V extends string>(text: V): `§b${V}§r` { return `§b${text}§r` };
  red<V extends string>(text: V): `§c${V}§r` { return `§c${text}§r` };
  lightPurple<V extends string>(text: V): `§d${V}§r` { return `§d${text}§r` };
  yellow<V extends string>(text: V): `§e${V}§r` { return `§e${text}§r` };
  white<V extends string>(text: V): `§f${V}§r` { return `§f${text}§r` };
  minecoinGold<V extends string>(text: V): `§g${V}§r` { return `§g${text}§r` };
  materialQuartz<V extends string>(text: V): `§h${V}§r` { return `§h${text}§r` };
  materialIron<V extends string>(text: V): `§i${V}§r` { return `§i${text}§r` };
  materialNetherite<V extends string>(text: V): `§j${V}§r` { return `§j${text}§r` };
  materialRedstone<V extends string>(text: V): `§m${V}§r` { return `§m${text}§r` };
  materialCopper<V extends string>(text: V): `§n${V}§r` { return `§n${text}§r` };
  materialGold<V extends string>(text: V): `§p${V}§r` { return `§p${text}§r` };
  materialEmerald<V extends string>(text: V): `§q${V}§r` { return `§q${text}§r` };
  materialDiamond<V extends string>(text: V): `§s${V}§r` { return `§s${text}§r` };
  materialLapis<V extends string>(text: V): `§t${V}§r` { return `§t${text}§r` };
  materialAmethyst<V extends string>(text: V): `§u${V}§r` { return `§u${text}§r` };
};

export function obfuscated<V extends string>(text: V): `§k${V}§r` { return `§k${text}§r` };
export function bold<V extends string>(text: V): `§l${V}§r` { return `§l${text}§r` };
export function italic<V extends string>(text: V): `§o${V}§r` { return `§o${text}§r` };
export const color = new MinecraftColor();

