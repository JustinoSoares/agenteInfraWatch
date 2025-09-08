#!/usr/bin/env node

import fs from "fs";
import path from "path";
import si from "systeminformation";
import axios from "axios";
import readline from "readline";
import dotenv from "dotenv";
import ora from "ora";
import { exit } from "process";
import { askQuestion, isLoggedIn } from "./utils.js"; // Importa funções utilitárias
import { login } from "./login.js"; // Importa a função de login
dotenv.config({
  quiet: true,
});

const CONFIG_DIR = path.join(process.env.HOME, ".infra-watch");
const CONFIG_PATH = path.join(CONFIG_DIR, "config.json");
const API_URL = process.env.API_URL;
const CONFIG = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));

function saveServerId(newId) {
  let config = {};

  // Se existir config.json, carrega ele
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
      config = JSON.parse(raw);
    } catch {
      config = {};
    }
  }

  // Atualiza ou adiciona o serverId sem tocar nos outros campos
  config.serverId = newId;

  // Salva de volta
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

function unsaveServerId() {
  let config = {};
  // Se existir config.json, carrega ele
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
      config = JSON.parse(raw);
    } catch {
      config = {};
    }
  }

  // Remove o serverId sem tocar nos outros campos
  delete config.serverId;

  // Salva de volta
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

export async function verifyServer(token, newId) {
  const spinner = ora("Verificando o servidor ...").start(); // inicia o loading
  const response = await fetch(`${API_URL}/api/v1/server/exist/${newId}/POST`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status !== 200) {
    if (response.status === 403 || response.status === 401) {
      spinner.fail("Usuário não autorizado.");
    } else spinner.fail("Este servidor não existe.");
    exit(1);
  }
  spinner.succeed("Verificação bem-sucedida: " + newId);
  return response;
}

export const setServerId = async () => {
  if (!isLoggedIn()) {
    console.log("Você precisa estar logado para definir um servidor.");
    await login();
  }
  if (CONFIG.serverId !== undefined) {
    console.log("O Servidor já está definido: " + CONFIG.serverId);
    exit(0);
  }
  const newId = await askQuestion("Digite o ID do Servidor: ");
  await verifyServer(CONFIG.token, newId);
  saveServerId(newId);
  return newId;
};

// Carrega ou cria ID do servidor
export async function getServerId() {
  if (!isLoggedIn()) {
    console.log("Você precisa estar logado para obter o ID do servidor.");
    await login();
  }

  if (CONFIG.serverId === undefined) {
    console.log(
      "Nenhum ID de servidor encontrado. Por favor, defina um novo ID."
    );
    const newId = await addServer();
    console.log(newId);
    return newId;
  } else {
    //console.log(CONFIG.serverId);
    return CONFIG.serverId;
  }
}

export async function updateServerId() {
  if (!isLoggedIn()) {
    console.log("Você precisa estar logado para atualizar o ID do servidor.");
    await login();
  }

  let config = {};
  if (CONFIG.serverId === undefined) {
    console.log("Nenhum ID de servidor encontrado.");
  }

  const newId = await askQuestion("Digite o novo ID deste agente: ");
  const spinner = ora("Verificando o servidor ...").start();

  try {
    const url = `${API_URL}/api/v1/server/exist/${newId}/PUT`;
    const existServer = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CONFIG.token}`,
      },
    });
    if (existServer.status === 403 || existServer.status === 401) {
      spinner.fail("Usuário não autorizado.");
      exit(1);
    }
    if (existServer.status !== 200 && existServer.status !== 423) {
      spinner.fail("Este servidor não existe.");
      exit(1);
    }
    saveServerId(newId);
    spinner.succeed("Servidor actualizado com sucesso: " + newId);
  } catch (error) {
    spinner.fail("Erro ao verificar o servidor.");
    exit(1);
  }
}

export async function unsetServer() {
  if (!isLoggedIn()) {
    console.log("Você precisa estar logado para remover o ID do servidor.");
    await login();
  }

  if (CONFIG.serverId === undefined) {
    console.log("Nenhum ID de servidor encontrado.");
    exit(0);
  }

  unsaveServerId();
  console.log("ID do servidor removido com sucesso.");
}
