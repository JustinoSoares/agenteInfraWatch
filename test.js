//https://infra-watch.zabbix.cloud
// 1207bf0240d84683790f891ed8d9f3be
//10671

const URLBASE = 'https://infra-watch.zabbix.cloud/api_jsonrpc.php';

const loginZabbix = async () => {
    const response = await fetch('https://infra-watch.zabbix.cloud/api_jsonrpc.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: "2.0",
            method: "user.login",
            params: {
                username: "Admin",   // substitui pelo teu user
                password: "LKhjtLwI"   // substitui pela tua senha
            },
            id: 1,
            auth: null
        })
    });

    const data = await response.json();
    console.log(data);
    return data.result;
};


const addHostToZabbix = async (authToken) => {
    const response = await fetch('https://infra-watch.zabbix.cloud/api_jsonrpc.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: "2.0",
            method: "host.create",
            params: {
                host: "ANA", // Nome do host
                interfaces: [
                    {
                        type: 1, // 1 = Agent
                        main: 1,
                        useip: 1,
                        ip: "127.0.0.1", // IP do seu equipamento
                        dns: "",
                        port: "3000" // Porta do Zabbix Agent
                    }
                ],
                groups: [
                    {
                        groupid: "2" // "Linux servers" geralmente é o grupo 2, pode confirmar em hostgroup.get
                    }
                ],
                templates: [
                    {
                        templateid: "10001" // Template a aplicar (ex: Template OS Linux)
                    }
                ]
            },
            auth: authToken,
            id: 1
        })
    });

    const data = await response.json();
    console.log(data);
    return data.result;
};

const getMetrics = async (authToken) => {
    // Simula a coleta de métricas
    const response = await fetch(URLBASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: "2.0",
            method: "item.get",
            params: {
               output: ["itemid", "name", "key_", "lastvalue"]
            },
            auth: authToken,
            id: 1
        })
    });

    const data = await response.json();
    console.log(data.result);
    return data.result;
};

async function getHosts(authToken) {
    const response = await fetch(URLBASE, {
        method: "POST",
        headers: { "Content-Type": "application/json-rpc" },
        body: JSON.stringify({
            jsonrpc: "2.0",
            method: "host.get",
            params: {
                output: ["hostid", "host", "name", "interfaceid"], // quais campos queres
            },
            auth: authToken,
            id: 1,
        }),
    });
    const data = await response.json();
    console.log(data.result);
    return data.result;
}

const getItems = async (authToken) => {
    const response = await fetch(URLBASE, {
        method: "POST",
        headers: { "Content-Type": "application/json-rpc" },
        body: JSON.stringify({
            jsonrpc: "2.0",
            method: "hostinterface.get",
            params: {
                output: ["interfaceid", "ip", "dns", "port"],
                hostid: "10671", // Substitua pelo ID do host
            },
            auth: authToken,
            id: 1,
        }),
    });
    const data = await response.json();
    console.log(data.result);
    return data.result;
}

//getItems("1207bf0240d84683790f891ed8d9f3be")
//getMetrics("1207bf0240d84683790f891ed8d9f3be");


//getHosts("1207bf0240d84683790f891ed8d9f3be");

addHostToZabbix("1207bf0240d84683790f891ed8d9f3be");
