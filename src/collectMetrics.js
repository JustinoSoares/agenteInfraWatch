#!/usr/bin/env node

// Coleta métricas
import si from "systeminformation";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config({
    quiet: true,
});

const dataServices = 'sshd,nginx,apache2,mysql,mariadb,postgresql,redis,memcached,docker,containerd,kubelet,cron,systemd-journald,ufw,firewalld,fail2ban,rsyslog,vsftpd,proftpd,bind9,named,haproxy,keepalived,php-fpm,node,pm2,MSSQLSERVER,SQLAgent,W3SVC,DhcpServer,DNS,PrintSpooler,WinRM,BITS,TermService,LanmanServer,LanmanWorkstation,WindowsUpdate,Hyper-V Host Compute Service,vmms,IISADMIN';

export async function collectMetrics(serverId) {
    try {
        const osInfo = await si.osInfo();
        const cpu = await si.cpu();
        const load = await si.currentLoad();
        const mem = await si.mem();
        const swap = await si.mem();
        const netStats = await si.networkStats();
        const netInterfaces = await si.networkInterfaces();
        const cpuTemp = await si.cpuTemperature();
        const battery = await si.battery();
        const processes = await si.processes();
        const services = await si.services(dataServices);

        const resultServices = services.filter(s => s.running === true);

        function getBootTime() {
            const timeData = si.time();
            // calculando o boot
            const bootTimestamp = timeData.boot || timeData.current - (timeData.uptime * 1000);
            const last_boot = new Date(bootTimestamp).toLocaleString("pt-PT");
            return last_boot;
        }

        const result = resultServices
            .map(s => `${s.name}/${s.mem}`)
            .join(',');

        const payload = {
            serverId: serverId,
            name_server: `${osInfo.hostname}`,
            version: `${osInfo.release}`,
            last_boot: `${getBootTime()}`,
            fisical_nucleos: `${cpu.physicalCores}`,
            logical_nucleos: `${cpu.cores}`,
            cpu_usage: `${load.currentLoad.toFixed(2)}%`,
            cpu_frequency: `${cpu.speed}GHz`,
            ram_usage: {
                total: `${(mem.total / 1024 / 1024 / 1024).toFixed(2)}GB`,
                used: `${(mem.active / 1024 / 1024 / 1024).toFixed(2)}GB`,
                available: `${(mem.available / 1024 / 1024 / 1024).toFixed(2)}GB`,
            },
            swap_usage: {
                total: `${(swap.total / 1024 / 1024 / 1024).toFixed(2)}GB`,
                used: `${(swap.used / 1024 / 1024 / 1024).toFixed(2)}GB`,
                available: `${(swap.free / 1024 / 1024 / 1024).toFixed(2)}GB`,
            },
            sendData: `${(netStats[0]?.tx_bytes / 1024 / 1024).toFixed(2)}MB`,
            receiveData: `${(netStats[0]?.rx_bytes / 1024 / 1024).toFixed(2)}MB`,
            interfaces: {
                total : netInterfaces.length,
                active : netInterfaces.filter(i => i.operstate === 'up').length,
                inactive : netInterfaces.filter(i => i.operstate !== 'up').length,
            },
            cpu_temperature: cpuTemp.main ? `${cpuTemp.main}°C` : "",
            battery: {
                level: battery.hasBattery ? `${battery.percent}%` : "",
                plugged: battery.hasBattery ? 'true' : 'false',
            },
            services: result,
            disk_space: await (async () => {
                const fsSize = await si.fsSize();

                const total = fsSize.reduce(
                    (acc, disk) => {
                        acc.size += disk.size;
                        acc.used += disk.used;
                        return acc;
                    },
                    { size: 0, used: 0 }
                );

                const available = total.size - total.used;

                return {
                    size: `${(total.size / 1024 / 1024 / 1024).toFixed(2)}GB`,
                    used: `${(total.used / 1024 / 1024 / 1024).toFixed(2)}GB`,
                    available: `${(available / 1024 / 1024 / 1024).toFixed(2)}GB`,
                    use: `${((total.used / total.size) * 100).toFixed(2)}%`
                };
            })(),
        };

        //console.log("Disk space: ", payload.disk_space);
        //console.log("PAYLOAD: ", payload);
        return payload;
    } catch (err) {
        console.error("Erro ao coletar/enviar métricas:", err.message);
    }
}