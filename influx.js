// substitua com as suas credenciais
const INFLUX_URL = "https://us-east-1-1.aws.cloud2.influxdata.com"; // endpoint do InfluxDB (Cloud ou seu servidor)
const ORG = "Infra-watch";
const BUCKET = "infra-watch";
const TOKEN = "oGlZ3AapuGDyZW0FukmlXCetJZ7E6ongRVzwctXfr9mEJH3suPAHxMpKreDJZH5a6r0Wy1rrMqgbj9SkjLcxLw=="; // seu token gerado

async function writeLog(service, level, message, code) {
    const lineProtocol = `teste,service=${service},level=${level} message="${message}",code=${code} ${Date.now()}000000`;

    const url = `${INFLUX_URL}/api/v2/write?org=${ORG}&bucket=${BUCKET}&precision=ns`;

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Token ${TOKEN}`,
            "Content-Type": "text/plain; charset=utf-8"
        },
        body: lineProtocol
    });

    if (!res.ok) {
        const err = await res.text();
        console.error("Erro ao escrever no InfluxDB:", res.status, err);
    } else {
        console.log("Log enviado com sucesso!");
    }
}

import { parse } from "csv-parse/sync";

async function queryLogs() {
    const fluxQuery = `
      from(bucket: "${BUCKET}")
        |> range(start: -1h)
    `;

    const res = await fetch(`${INFLUX_URL}/api/v2/query?org=${ORG}`, {
        method: "POST",
        headers: {
            "Authorization": `Token ${TOKEN}`,
            "Content-Type": "application/vnd.flux",
            "Accept": "application/csv"
        },
        body: fluxQuery
    });

    if (!res.ok) {
        const err = await res.text();
        console.error("Erro na query:", res.status, err);
        return;
    }

    const csvText = await res.text();

    // Converte CSV -> JSON
    const records = parse(csvText, {
        columns: true, // usa a primeira linha como cabeçalho
        skip_empty_lines: true
    });

    console.log(records);
    return records;
}


queryLogs();

// exemplo de uso:
//writeLog("apisss", "error", "Falha ao conectar ao DB", 500);
