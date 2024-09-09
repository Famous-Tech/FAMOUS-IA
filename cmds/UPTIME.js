let startTime = Date.now();

export function uptime() {
    let currentTime = Date.now();
    let uptimeMs = currentTime - startTime;

    let uptimeSeconds = Math.floor(uptimeMs / 1000);
    let hours = Math.floor(uptimeSeconds / 3600);
    let minutes = Math.floor((uptimeSeconds % 3600) / 60);
    let seconds = uptimeSeconds % 60;

    return `The bot has been active for: ${hours}h ${minutes}m ${seconds}s.`;
}
