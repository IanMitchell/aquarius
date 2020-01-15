import { Constants } from 'discord.js';

export default function createShield(aquarius, message, label) {
  if (aquarius.status !== Constants.Status.READY) {
    return {
      schemaVersion: 1,
      message,
      label,
      color: 'red',
      style: 'for-the-badge',
      isError: true,
    };
  }

  return {
    schemaVersion: 1,
    message,
    label,
    color: 'green',
    style: 'for-the-badge',
  };
}
