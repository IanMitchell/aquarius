import { Client } from 'discord.js';

export class ClientFake extends Client {}

export function getClientFake() {
  return new ClientFake();
}
