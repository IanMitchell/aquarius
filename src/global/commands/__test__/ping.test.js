describe('Ping', () => {
  test('response', async () => {
    const response = await prompt('ping');
    expect(response).toBeMessage('pong');
  });
});
