#!/usr/bin/env node

import { Command } from "commander";
import { login, getServerId, startServer, collectMetrics } from "../index.js";
import { updateServerId } from "../src/getServerId.js";

const program = new Command();

program
  .name("infra-watch")
  .description("Agente de monitoramento")
  .version("1.0.0");

program
  .command("login")
  .description("Faz login no servidor")
  .action(async () => {
    await login();
  });

program
  .command("server-id")
  .description("Atualiza ou define o ID do servidor")
  .action(async () => {
    const id = await getServerId(true);
  });

  program
  .command("update")
  .description("Atualiza ou define o ID do servidor")
  .option("-f, --force", "Forçar atualização mesmo que já exista")
  .action(async (options) => {
      await updateServerId();
  });

program
  .command("start")
  .description("Inicia o agente e coleta métricas")
  .action(async () => {
    //console.log("Iniciando o agente...");
    await startServer();
    //console.log(`Servidor iniciado com ID: ${serverId}`);
    //setInterval(() => collectMetrics(serverId), 1500);


  });

program.parseAsync(process.argv);
