#!/usr/bin/env node

import fs from "fs";
import readline from "readline";
import dotenv from "dotenv";
import path from "path";
import os from "os";
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

export function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }));
}


export function saveToken(token) {
    let config = {};


    // Se já existe um config.json, carrega ele
    if (fs.existsSync(CONFIG_PATH)) {
        const raw = fs.readFileSync(CONFIG_PATH, "utf8");
        try {
            config = JSON.parse(raw);
        } catch {
            config = {};
        }
    }

    // Adiciona o token (sem sobrescrever os outros campos)
    config.token = token;

    // Salva de volta
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

export const isLoggedIn = () => {
    if (fs.existsSync(CONFIG_PATH)) {
        const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
        return config.token ? true : false;
    }
    return false;
};