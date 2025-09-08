import ping from "ping";
import snmp from "net-snmp";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config({
    quiet: true,
});
import { isLoggedIn } from "./utils.js";
import { getServerId } from "./getServerId.js";

const CONFIG_DIR = path.join(process.env.HOME, ".infra-watch");
const CONFIG_PATH = path.join(CONFIG_DIR, "config.json");
const API_URL = "https://infrawatch-in5r.onrender.com";

// OIDs comuns em SNMP
const OIDS = {
  sysDescr: "1.3.6.1.2.1.1.1.0",  // Descrição do sistema
  uptime: "1.3.6.1.2.1.1.3.0",    // Uptime
  sysName: "1.3.6.1.2.1.1.5.0",   // Nome do dispositivo
  sysLocation: "1.3.6.1.2.1.1.6.0", // Localização
};

async function checkDevice(host, community = "public") {
  const result = {
    host,
    available: false,
    metrics: {},
  };

  // 1. Verificar disponibilidade via ping
  const pingRes = await ping.promise.probe(host, { timeout: 2 });
  result.available = pingRes.alive;

  if (!pingRes.alive) {
    return result; // se não responde ping, retorna só "offline"
  }

  // 2. Se ativo, cria sessão SNMP
  const session = snmp.createSession(host, community, {port : 1161});

  return new Promise((resolve) => {
    session.get(Object.values(OIDS), (error, varbinds) => {
      if (error) {
        console.error("Erro SNMP:", error.toString());
        resolve(result);
        return;
      }

      varbinds.forEach((vb, i) => {
        if (snmp.isVarbindError(vb)) return;

        const key = Object.keys(OIDS)[i];
        // Adiciona apenas se o valor for válido
        if (vb.value !== null && vb.value !== undefined) {
          result.metrics[key] = vb.value ? vb.value.toString() : "";
        }
      });
      session.close();
      resolve(result);
    });
  });
}

// 🔹 Exemplo de uso
export async function getDevicesData() {
  if (isLoggedIn() === false) {
    console.error("Você precisa estar logado para listar os dispositivos.");
    process.exit(1);
  }
  const serverId = await getServerId();

  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  const response = await fetch(`${API_URL}/api/v1/device/get/` + serverId, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.token}`,
    },
  });

  if (response.status === 200) {
    const devicesList = await response.json();
    await Promise.all(devicesList.map((list) => checkDevice(list.host))).then((results) => {
      results.forEach((status) => console.log(status));
    });
  } else {
    console.log("RESPONSE: ", response);
  }

  /*const devices = ["127.0.0.2", "192.168.1.144"]; // lista de dispositivos
  await Promise.all(devices.map(host => checkDevice(host)))
  .then(results => {
  results.forEach(status => console.log(status));
  });*/
}
