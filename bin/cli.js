#!/usr/bin/env node

import { Command } from "commander";
import { login, getServerId, startServer, getDevicesData, logout } from "../index.js";
import { setServerId, unsetServer, updateServerId } from "../src/getServerId.js";
import ora from "ora";
import os from "os";
import fs from "fs";
import { installLinux, installMac, installWindows, uninstallLinux, uninstallMac, uninstallWindows } from "../src/install.js";
import { exit } from "process";
const PID_FILE = "/tmp/infra-watch.pid";

const program = new Command();

program
  .name("infra-watch")
  .description("Agente de monitoramento")
  .version("1.0.0");

program
  .command("auth")
  .description("Gerencia autenticação")
  .addCommand(
    new Command("login")
      .description("Faz login no servidor")
      .action(async () => {
        await login();
      })
  )
  .addCommand(
    new Command("logout")
      .description("Faz logout no servidor")
      .action(async () => {
        await logout();
      })
  );

// --------- SERVER COMMANDS ---------
const server = new Command("server").description("Gerencia o servidor");

server
  .command("get")
  .description("Obtém o ID do servidor")
  .action(async () => {
    const serverId = await getServerId(true);
    console.log(serverId);
    exit(0);
  });

server
  .command("update")
  .description("Atualiza o ID do servidor")
  .option("-f, --force", "Forçar atualização mesmo que já exista")
  .action(async (options) => {
    await updateServerId(options.force);
  });

server
  .command("set")
  .description("Define o ID do servidor")
  .action(async () => {
    await setServerId();
  });

server
  .command("unset")
  .description("Remove o ID do servidor")
  .action(async () => {
    await unsetServer();
  });

server
  .command("start")
  .description("Inicia o servidor")
  .action(async () => {
    await startServer();
  });

server
  .command("status")
  .description("Mostra se o agente está rodando")
  .action(() => {
    if (fs.existsSync(PID_FILE)) {
      const pid = parseInt(fs.readFileSync(PID_FILE, "utf8"));
      try {
        process.kill(pid, 0); // teste sem matar
        console.log(`✅ Agente rodando (PID: ${pid})`);
      } catch {
        console.log("⚠️ PID file existe, mas processo não está ativo.");
      }
    } else {
      console.log("❌ Nenhum agente rodando.");
    }
  });

program.addCommand(server);

program
  .command("install")
  .description("Instala o agente para iniciar automaticamente no boot")
  .action(async () => {
    const platform = os.platform();
    console.log(`🔍 Detectando SO: ${platform}`);

    try {
      if (platform === "linux") {
        installLinux();
      } else if (platform === "darwin") {
        installMac();
      } else if (platform === "win32") {
        installWindows();
      } else {
        console.log("⚠️ Sistema operacional não suportado ainda.");
      }
    } catch (err) {
      console.error("❌ Erro ao instalar:", err.message);
    }
  });

program
  .command("uninstall")
  .description("Remove o agente da inicialização automática do sistema")
  .action(async () => {
    const platform = os.platform();
    console.log(`🔍 Detectando SO: ${platform}`);

    try {
      if (platform === "linux") {
        uninstallLinux();
      } else if (platform === "darwin") {
        uninstallMac();
      } else if (platform === "win32") {
        uninstallWindows();
      } else {
        console.log("⚠️ Sistema operacional não suportado ainda.");
      }
    } catch (err) {
      console.error("❌ Erro ao desinstalar:", err.message);
    }
  });

program.parseAsync(process.argv);
