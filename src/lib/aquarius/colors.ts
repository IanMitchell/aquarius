import { Palette } from "@vibrant/color";
import Vibrant from "node-vibrant";
import rgbHex from "rgb-hex";

function getColorFromPalette(palette: Palette) {
	const swatches = [
		"Vibrant",
		"LightVibrant",
		"DarkVibrant",
		"LightMuted",
		"Muted",
		"DarkMuted",
	];

	const swatch = swatches.find((name) => palette[name]) ?? swatches[0];
	return palette[swatch]!;
}

/**
 * Determines a dominant color for a Guild Icon
 * @param {string} icon - the URL for a Guild Icon
 * @returns {number} The Color in Hex
 */
export async function getIconColor(icon: string) {
	const palette = await Vibrant.from(icon).getPalette();
	const hex = rgbHex(...getColorFromPalette(palette).getRgb());
	return parseInt(hex, 16);
}

/**
 * Converts a hex string into a MessageEmbed supported Base 16 number
 * @param {string} hex - Hexcode to convert into MessageEmbed format
 * @returns {number} Base 16 color representation
 */
export function getEmbedColorFromHex(hex: string | [number, number, number]) {
	let color = hex;

	if (Array.isArray(color)) {
		color = Array.from(color)
			.map((value) => `${value}${value}`)
			.join("");
	} else if (color.startsWith("#")) {
		color = color.substring(1);
	}

	return parseInt(color, 16);
}
