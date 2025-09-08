import os from "os";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { Command } from "commander";

export function installLinux() {
  console.log(`${process.execPath} ${process.argv[1]} server start`);
  const service = `
[Unit]
Description=Agente de monitoramento Infra-Watch
After=network.target

[Service]
ExecStart=npx infra-watch server start
Restart=always
User=${process.env.USER}
Environment=NODE_ENV=production
WorkingDirectory=${process.cwd()}

[Install]
WantedBy=multi-user.target
`;

  const tmpFile = "/tmp/infra-watch.service";
  const servicePath = "/etc/systemd/system/infra-watch.service";
  fs.writeFileSync(tmpFile, service);

  execSync(`sudo mv ${tmpFile} ${servicePath}`);
  execSync(`sudo systemctl daemon-reload`);
  execSync(`sudo systemctl enable infra-watch`);
  execSync(`sudo systemctl start infra-watch`);

  console.log("✅ Infra-Watch instalado no systemd e iniciará no boot!");
}


export function installMac() {
  const plist = `
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" 
"http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.infra-watch</string>
  <key>ProgramArguments</key>
  <array>
    <string>${process.execPath}</string>
    <string>${process.argv[1]}</string>
    <string>start</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
</dict>
</plist>
`;

  const plistPath = path.join(
    process.env.HOME,
    "Library/LaunchAgents/com.infra-watch.plist"
  );
  fs.writeFileSync(plistPath, plist);

  execSync(`launchctl load ${plistPath}`);
  console.log("✅ Infra-Watch instalado no macOS (launchctl) e iniciará no boot!");
}

/**
 * Windows (schtasks)
 */
export function installWindows() {
  const cmd = `schtasks /Create /SC ONSTART /TN "InfraWatch" /TR "\\"${process.execPath}\\" \\"${process.argv[1]}\\" start" /F`;
  execSync(cmd, { stdio: "inherit" });
  console.log("✅ Infra-Watch instalado no Windows e iniciará no boot!");
}


export function uninstallLinux() {
  const servicePath = "/etc/systemd/system/infra-watch.service";

  try {
    execSync(`sudo systemctl stop infra-watch`);
    execSync(`sudo systemctl disable infra-watch`);
    if (fs.existsSync(servicePath)) {
      execSync(`sudo rm -f ${servicePath}`);
    }
    execSync(`sudo systemctl daemon-reload`);
    console.log("🗑️ Infra-Watch removido do systemd!");
  } catch (err) {
    console.error("❌ Erro ao remover do systemd:", err.message);
  }
}

export function uninstallMac() {
  const plistPath = path.join(
    process.env.HOME,
    "Library/LaunchAgents/com.infra-watch.plist"
  );

  try {
    execSync(`launchctl unload ${plistPath}`);
    if (fs.existsSync(plistPath)) {
      fs.unlinkSync(plistPath);
    }
    console.log("🗑️ Infra-Watch removido do macOS LaunchAgents!");
  } catch (err) {
    console.error("❌ Erro ao remover do macOS:", err.message);
  }
}


export function uninstallWindows() {
  try {
    execSync(`schtasks /Delete /TN "InfraWatch" /F`, { stdio: "inherit" });
    console.log("🗑️ Infra-Watch removido do Windows Scheduler!");
  } catch (err) {
    console.error("❌ Erro ao remover do Windows:", err.message);
  }
}


