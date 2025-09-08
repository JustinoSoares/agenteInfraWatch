#!/usr/bin/env node

import { login, logout } from "./src/login.js";
import { getServerId } from "./src/getServerId.js";
import { startServer } from "./src/startServer.js";
import { collectMetrics } from "./src/collectMetrics.js"; // se separaste
import { getDevicesData } from "./src/devices.js"; // se separaste
import fs from "fs";
import path from "path";
import os from "os";
import dotenv from "dotenv";
dotenv.config({
  quiet: true,
});

// Diretório home do usuário (funciona no Linux, macOS e Windows)
const homeDir = os.homedir();

// Caminho do diretório de config
const CONFIG_DIR = path.join(homeDir, ".infra-watch");
const CONFIG_PATH = path.join(CONFIG_DIR, "config.json");

// garante que a pasta ~/.infra-watch existe
if (!fs.existsSync(CONFIG_DIR)) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
}

export { login, getServerId, startServer, collectMetrics, getDevicesData, logout };

// Início do programa
/*(async () => {
    await startAgent();
    const serverId = await getServerId();
    setInterval(() => collectMetrics(serverId), 1500); // envia a cada 15s
})();*/
