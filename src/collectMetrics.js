#!/usr/bin/env node

// Coleta métricas
import si from "systeminformation";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

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

        function getBootTime() {
            const timeData = si.time();
            // calculando o boot
            const bootTimestamp = timeData.boot || timeData.current - (timeData.uptime * 1000);
            const last_boot = new Date(bootTimestamp).toLocaleString("pt-PT");
            return last_boot;
        }

        const payload = {
            serverId: serverId,
            name_server: osInfo.hostname,
            version: osInfo.release,
            last_boot: getBootTime(),
            fisical_nucleos: cpu.physicalCores,
            logical_nucleos: cpu.cores,
            cpu_usage: load.currentLoad.toFixed(2) + "%",
            cpu_frequency: cpu.speed + " GHz",
            ram_usage: {
                total: (mem.total / 1024 / 1024 / 1024).toFixed(2) + " GB",
                used: (mem.active / 1024 / 1024 / 1024).toFixed(2) + " GB",
                available: (mem.available / 1024 / 1024 / 1024).toFixed(2) + " GB",
            },
            swap_usage: {
                total: (swap.total / 1024 / 1024 / 1024).toFixed(2) + " GB",
                used: (swap.used / 1024 / 1024 / 1024).toFixed(2) + " GB",
                available: (swap.free / 1024 / 1024 / 1024).toFixed(2) + " GB",
            },
            sendData: (netStats[0]?.tx_bytes / 1024 / 1024).toFixed(2) + " MB",
            receiveData: (netStats[0]?.rx_bytes / 1024 / 1024).toFixed(2) + " MB",
            activated_interfaces: netInterfaces
                .filter(n => n.operstate === "up")
                .map(n => n.iface),
            cpu_temperature: cpuTemp.main ? cpuTemp.main + " °C" : "N/A",
            battery: {
                level: battery.hasBattery ? battery.percent + "%" : "N/A",
                plugged: battery.hasBattery ? battery.isCharging : "N/A",
            },
            processes: {
                total: processes.all,
                running: processes.running,
                blocked: processes.blocked,
                sleeping: processes.sleeping,
                unknown: processes.unknown,
            },
        };
        console.log("Processos:", {
            total: processes.all,
            running: processes.running,
            blocked: processes.blocked,
            sleeping: processes.sleeping,
            unknown: processes.unknown,
            //list : processes.list.some(p => p.name.includes("nginx"))
        });

        //await axios.post(API_URL, payload);
        //console.log("Métricas enviadas:", payload);
        return payload;
    } catch (err) {
        console.error("Erro ao coletar/enviar métricas:", err.message);
    }
}