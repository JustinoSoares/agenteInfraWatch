#!/usr/bin/env node

import { getServerId } from "./getServerId.js";
import { collectMetrics } from "./collectMetrics.js"; // se separaste
import { login } from "./login.js";
import { isLoggedIn } from "./utils.js";
import path from "path";
import fs from "fs";

const CONFIG_PATH = path.resolve("../config.json");
const API_URL = process.env.API_URL;
const CONFIG = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));

async function requestAPI(payload) {
  // Lógica para iniciar o servidor, se necessário
  const serverId = await getServerId();

  //console.log("Iniciando o servidor com ID:", typeof payload["serverId"], payload["serverId"]);
  // Inicia o servidor
  const response = await fetch(`${API_URL}/api/v1/server/dataserver`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Adicione outros cabeçalhos, como autenticação, se necessário
    },
    body: JSON.stringify({
      serverId: serverId,
      name_server: payload["name_server"],
      version: payload["version"],
      last_boot: payload["last_boot"],
      fisical_nucleos: payload["fisical_nucleos"],
      logical_nucleos: payload["logical_nucleos"],
      cpu_usage: payload["cpu_usage"],
      cpu_frequency: payload["cpu_frequency"],
      ram_usage: payload["ram_usage"],
      swap_usage: payload["swap_usage"],
      sendData: payload["sendData"],
      receiveData: payload["receiveData"],
      activated_interfaces: payload["activated_interfaces"],
      cpu_temperature: payload["cpu_temperature"],
      battery: payload["battery"],
    }),
  });
  if (!response.ok) {
    console.error("Erro ao iniciar o servidor:", response.statusText);
    return;
  }
  else {
    console.log("Servidor iniciado com sucesso:", await response.json());
  }
}

export async function startServer() {
  if (isLoggedIn() === false) {
    console.log("Usuário não autenticado. Por favor, faça login primeiro.");
    await login();
  }
  try {
    const serverId = await getServerId();
    const response = await fetch(`${API_URL}/api/v1/server/exist/${serverId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CONFIG.token}`,
      },
    });

    if (response.status === 403 || response.status === 401) {
      console.log("Usuário não autorizado.");
      exit(1);
    }
    if (response.status !== 200) {
      console.log("Este servidor não existe. Por favor, registre o servidor primeiro.");
      exit(1);
    }

    const data = await response.json();

    setInterval(async () => {
      const payload = await collectMetrics(serverId);
      //console.log("Payload para enviar:", payload);
      await requestAPI(payload);
    }, Number(data.time_ms || 60000)); // Pega o intervalo do servidor ou usa 60 segundos como padrão
  } catch (error) {
    console.error("Erro ao iniciar o servidor:", error);
  }

}