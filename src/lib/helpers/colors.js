import * as Vibrant from 'node-vibrant';
import rgbHex from 'rgb-hex';

function getColorFromPalette(palette) {
  const swatches = [
    'Vibrant',
    'LightVibrant',
    'DarkVibrant',
    'LightMuted',
    'Muted',
    'DarkMuted',
  ];

  const swatch = swatches.find(name => palette[name]);
  return palette[swatch];
}

/**
 * Determines a dominant color for a Guild Icon
 * @param {string} icon - the URL for a Guild Icon
 * @returns {number} The Color in Hex
 */
export async function getIconColor(icon) {
  const palette = await Vibrant.from(icon).getPalette();
  const hex = rgbHex(...getColorFromPalette(palette).getRgb());
  return parseInt(hex, 16);
}
