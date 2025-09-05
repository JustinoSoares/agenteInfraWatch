import { getServerId } from "./getServerId";

import { isLoggedIn, login } from "./auth";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";

dotenv.config({
    quiet: true,
});

function generateMetric(prev, min, max, variation = 0.05) {
    prev = Number(prev); // garante que é número

    // variação máxima em % (5% padrão)
    const change = prev * (Math.random() * (variation * 2) - variation);
    let next = prev + change;

    // garantir que fica dentro do range
    if (next < min) next = min;
    if (next > max) next = max;

    return Number(next.toFixed(2));
}

// 🔹 Exemplo de uso
let cpu = 40; // valor inicial
let memory = 65;

setInterval(() => {
    cpu = generateMetric(cpu, 5, 90);       // CPU entre 5% e 90%
    memory = generateMetric(memory, 30, 95); // Memória entre 30% e 95%

    //console.log({ cpu, memory });
}, 2000);


function decreaseMetric(prev, min, step = 1) {
    prev = Number(prev);
    let next = prev - (Math.random() * step);
    if (next < min) next = min;
    return Number(next.toFixed(2));
}

let toner = 100; // começa cheio
let paper = 500;

setInterval(() => {
    toner = decreaseMetric(toner, 0, 0.5); // desce devagar
    paper = decreaseMetric(paper, 0, 2);   // 1–2 folhas por iteração

    console.log({ toner, paper });
}, 2000);

