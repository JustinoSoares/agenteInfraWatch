
// em Node 18+ já tem fetch nativo

const ZABBIX_URL = 'https://infra-watch.zabbix.cloud/api_jsonrpc.php';
const ZABBIX_USER = "Admin";
const ZABBIX_PASSWORD = "LKhjtLwI";

async function login() {
  const res = await fetch(ZABBIX_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json-rpc" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "user.login",
      params: {
        username: ZABBIX_USER,
        password: ZABBIX_PASSWORD,
      },
      id: 1,
      auth: null,
    }),
  });

  const data = await res.json();
  console.log("Login", data);
  return data.result; // auth token
}

// 2 - Pegar hosts
async function getHosts(auth) {
  const res = await fetch(ZABBIX_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json-rpc" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "host.get",
      params: {
        output: ["hostid", "host", "status", "available"], // status (enable/disable), available (0=unknown, 1=available, 2=unavailable)
      },
      auth,
      id: 2,
    }),
  });

  const data = await res.json();
  return data.result;
}

// 3 - Pegar métricas específicas (uptime e memória)
async function getItems(auth, hostid) {
  const res = await fetch(ZABBIX_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json-rpc" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "item.get",
      params: {
        hostids: hostid,
        output: ["itemid", "key_", "lastvalue", "name"],
        filter: {
          key_: [
            "system.uptime", // Uptime
            "vm.memory.size[used]", // Memória usada
          ],
        },
      },
      auth,
      id: 3,
    }),
  });

  const data = await res.json();
  return data.result;
}

// 4 - Executar
(async () => {
  const auth = await login();
  const hosts = await getHosts(auth);

  for (const host of hosts) {
    console.log(`\nHost: ${host.host} (ID: ${host.hostid})`);
    console.log(`Status: ${host.status == 0 ? "Ativo" : "Desativado"}`);
    console.log(`Disponibilidade: ${host.available == 1 ? "Disponível" : "Indisponível"}`);

    const items = await getItems(auth, host.hostid);

    for (const item of items) {
      console.log(`${item.name}: ${item.lastvalue}`);
    }
  }
})();