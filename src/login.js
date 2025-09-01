#!/usr/bin/env node

import path from "path";
import dotenv from "dotenv";
import ora from "ora"; // Biblioteca para mostrar loading no terminal
import { askQuestion, saveToken } from "./utils.js"; // Importa funções utilitárias
dotenv.config();

const CONFIG_PATH = path.resolve("../config.json");
const API_URL = process.env.API_URL;

export async function login() {
  const username = await askQuestion("username: ");
  const password = await askQuestion("password: ");

  const spinner = ora("Fazendo login...").start(); // inicia o loading

  try {
    const response = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    if (response.status === 200) {
      spinner.succeed("✅ Login bem-sucedido!");
      saveToken(response.data.token); // salva o token no config.json
      return response.data; // pode devolver o token ou dados do usuário
    } else {
      spinner.fail(`❌ Falha no login: ${response.data.message}`);
      process.exit(1);
    }
  } catch (error) {
    //spinner.fail(`Não foi possível conectar ao servidor`);
    spinner.fail(`Não foi possível conectar ao servidor`, error);
    process.exit(1);
  }
}
