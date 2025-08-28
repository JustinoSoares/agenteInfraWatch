import ping from "ping";
import snmp from "net-snmp";

// OIDs comuns em SNMP
const OIDS = {
  uptime: "1.3.6.1.2.1.1.3.0",       // System uptime
  sysName: "1.3.6.1.2.1.1.5.0",      // Nome do dispositivo
  cpu: "1.3.6.1.4.1.2021.11.9.0",    // CPU idle (UCD-SNMP MIB)
  temp: "1.3.6.1.4.1.2021.13.16.2.1.3.1", // Temperatura (se suportado)
  memTotal: "1.3.6.1.4.1.2021.4.5.0" // Memória total
};

async function checkDevice(host, community = "public") {
  const result = {
    host,
    available: false,
    metrics: {}
  };

  // 1. Verificar disponibilidade via ping
  const pingRes = await ping.promise.probe(host, { timeout: 2 });
  result.available = pingRes.alive;

  if (!pingRes.alive) {
    return result; // se não responde ping, retorna só "offline"
  }

  // 2. Se ativo, cria sessão SNMP
  const session = snmp.createSession(host, community);

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
          result.metrics[key] = vb.value ? vb.value.toString() : "unknown";
        }
      });

      session.close();
      resolve(result);
    });
  });
}

// 🔹 Exemplo de uso
(async () => {
  const devices = ["10.12.3.1", "10.12.3.2", "10.12.3.8"]; // lista de dispositivos
  Promise.all(devices.map(host => checkDevice(host)))
    .then(results => {
      results.forEach(status => console.log(status));
    });
})();
