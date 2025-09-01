#!/usr/bin/env node

import { login } from "./src/login.js";
import { getServerId } from "./src/getServerId.js";
import { startServer } from "./src/startServer.js";
import { collectMetrics } from "./src/collectMetrics.js"; // se separaste
import { getDevicesData } from "./src/devices.js"; // se separaste
// limpar o terminal

export { login, getServerId, startServer, collectMetrics, getDevicesData };

// Início do programa
/*(async () => {
    await startAgent();
    const serverId = await getServerId();
    setInterval(() => collectMetrics(serverId), 1500); // envia a cada 15s
})();*/
