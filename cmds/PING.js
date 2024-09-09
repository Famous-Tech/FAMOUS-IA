export function ping() {
    const start = Date.now();
    return `Pong! The bot is active.\nResponse time: ${Date.now() - start}ms`;
}
