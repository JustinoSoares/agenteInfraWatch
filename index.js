#!/usr/bin/env node

import { login } from "./src/login.js";
import { getServerId } from "./src/getServerId.js";
import { startServer } from "./src/startServer.js";
import { collectMetrics } from "./src/collectMetrics.js"; // se separaste

import "./test3.js";
// limpar o terminal

export { login, getServerId, startServer, collectMetrics };

// Início do programa
/*(async () => {
    await startAgent();
    const serverId = await getServerId();
    setInterval(() => collectMetrics(serverId), 1500); // envia a cada 15s
})();*/
