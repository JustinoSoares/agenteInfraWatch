#!/usr/bin/env node

import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import axios from "axios";
import ora from "ora"; // Biblioteca para mostrar loading no terminal
import { askQuestion, saveToken } from "./utils.js"; // Importa funções utilitárias
dotenv.config({
  quiet: true,
});

const CONFIG_DIR = path.join(process.env.HOME, ".infra-watch");
const CONFIG_PATH = path.join(CONFIG_DIR, "config.json");

// cria o arquivo se não existir
if (!fs.existsSync(CONFIG_PATH)) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify({}), "utf-8");
}
const API_URL = process.env.API_URL;



export async function login() {
  if (!fs.existsSync(CONFIG_PATH)) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify({}), "utf-8");
  }
  const username = await askQuestion("username: ");
  const password = await askQuestion("password: ");

  const spinner = ora("Fazendo login...").start(); // inicia o loading

  try {
    const response = await axios.post(`${API_URL}/api/v1/auth/login`, {
      username,
      password,
    });

    //console.log("response", response.data);

    // se chegou aqui, status é 2xx
    spinner.succeed("✅ Login bem-sucedido!");
    saveToken(response.data.token);
    return true;
  } catch (err) {
    if (err.response) {
      // servidor respondeu com erro
      spinner.fail(`Falha no login: ${err.response.data.message || "Erro de autenticação"}`);
    } else {
      // erro de rede ou timeout
      spinner.fail(`Erro de conexão: ${err.message}`);
    }
    process.exit(1);
  }
}

export async function logout() {
  saveToken(null);
  console.log("✅ Logout realizado com sucesso!");
}
