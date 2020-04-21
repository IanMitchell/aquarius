export default function createShield(aquarius, message, label) {
  return {
    schemaVersion: 1,
    message,
    label,
    color: 'green',
    style: 'for-the-badge',
  };
}
