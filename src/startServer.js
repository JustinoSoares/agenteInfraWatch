#!/usr/bin/env node

import { getServerId } from "./getServerId.js";
import { collectMetrics } from "./collectMetrics.js"; // se separaste

async function requestAPI(payload) {
  // Lógica para iniciar o servidor, se necessário
  const API_URL = process.env.API_URL;
  const serverId = await getServerId();

  console.log("Iniciando o servidor com ID:", typeof payload["serverId"], payload["serverId"]);
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
  const serverId = await getServerId();
  //console.log(`Servidor iniciado com ID: ${serverId}`);
  setInterval(async () => {
    const payload = await collectMetrics(serverId);
    console.log("Payload to send:");
    //console.log(payload);
    await requestAPI(payload);
  }, 15000);
}