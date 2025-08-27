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
dotenv.config();

const CONFIG_PATH = path.resolve("../config.json");
const API_URL = process.env.API_URL;


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
// Carrega ou cria ID do servidor
export async function getServerId() {
    if (!isLoggedIn()) {
        console.log("Você precisa estar logado para obter o ID do servidor.");
        await login();
    }

    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
    if (config.serverId === undefined) {
        console.log("Nenhum ID de servidor encontrado. Por favor, defina um novo ID.");
        const newId = await askQuestion("Digite o ID deste agente: ");
        const existServer = await axios.post(`${API_URL}/api/v1/server/exist/` + newId, {
            serverId: newId,
        }, {
            headers: {
                Authorization: `Bearer ${config.token}`,
            },
        });
        const spinner = ora("Verificando o servidor ...").start(); // inicia o loading
        if (existServer.data.status !== 200) {
            spinner.fail("Verificação falhou, tente novamente.");
            exit(1);
        }
        saveServerId(newId);
        spinner.succeed("Verificação bem-sucedida: " + newId);
        return newId;
        //exit(0);
    }
    else {
        console.log(config.serverId);
        return config.serverId;
        //exit(0);
    }

}

export async function updateServerId() {
    if (!isLoggedIn()) {
        console.log("Você precisa estar logado para atualizar o ID do servidor.");
        await login();
    }

    let config = {};
    if (fs.existsSync(CONFIG_PATH)) {
        try {
            config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
        } catch { }
    }

    const newId = await askQuestion("Digite o novo ID deste agente: ");
    const spinner = ora("Verificando o servidor ...").start();

    try {
        const url = `${API_URL}/api/v1/server/exist/${newId}`;
        const existServer = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${config.token}`,
            },
        });
        if (existServer.status === 403) {
            spinner.fail("Usuário não autorizado.");
            exit(1);
        }
        if (existServer.status !== 200) {
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

