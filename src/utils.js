#!/usr/bin/env node

import fs from "fs";
import readline from "readline";
import dotenv from "dotenv";
import path from "path";
dotenv.config();
const CONFIG_PATH = path.resolve("../config.json");
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