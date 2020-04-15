import { Client } from 'discord.js';

export class ClientMock extends Client {}

export function getClientMock() {
  return new ClientMock();
}
