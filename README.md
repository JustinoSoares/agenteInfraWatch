# Infra-Watch

![Node.js](https://img.shields.io/badge/Node.js-v16+-green) ![License](https://img.shields.io/badge/license-MIT-blue) ![Version](https://img.shields.io/badge/version-1.0.0-brightgreen)

**Infra-Watch** é um agente de monitoramento CLI robusto e fácil de usar, projetado para gerenciar e monitorar servidores de forma eficiente. Com ele, você pode autenticar, gerenciar IDs de servidor, iniciar serviços e configurar inicialização automática em diferentes sistemas operacionais.

---

## ✨ Funcionalidades

- **Autenticação**: Faça login e logout no servidor com comandos simples.
- **Gerenciamento de Servidor**: Obtenha, defina, atualize ou remova IDs de servidor.
- **Monitoramento**: Verifique o status do agente em execução.
- **Instalação Automática**: Configure o agente para iniciar automaticamente no boot do sistema (Linux, macOS, Windows).
- **Desinstalação**: Remova facilmente o agente da inicialização automática.

---

## 🚀 Começando

### Pré-requisitos

- **Node.js** (versão 16 ou superior)
- **npm** ou **yarn** para gerenciar dependências

### Instalação

1. Clone o repositório:
   ```bash
   npm install --global infra-watch
   ```
   **💡 Observação.:** deves executar os comandos como admin


2. Execute o CLI:
   ```bash
   npx infra-watch --help
   ```

---

## 📖 Uso

O `infra-watch` oferece uma interface de linha de comando intuitiva. Abaixo estão os principais comandos disponíveis:

### Comandos Principais

- **Autenticação**
  ```bash
  infra-watch auth login   # Faz login no servidor
  infra-watch auth logout  # Faz logout do servidor
  ```

- **Gerenciamento de Servidor**
  ```bash
  infra-watch server get     # Obtém o ID do servidor
  infra-watch server set     # Define o ID do servidor
  infra-watch server update  # Atualiza o ID do servidor
  infra-watch server unset   # Remove o ID do servidor
  infra-watch server start   # Inicia o servidor
  infra-watch server status  # Verifica se o agente está rodando
  ```

- **Instalação e Desinstalação**
  ```bash
  infra-watch install    # Instala o agente para iniciar no boot
  infra-watch uninstall  # Remove o agente da inicialização automática
  ```

### Exemplo de Uso

1. Fazer login no servidor:
   ```bash
   infra-watch auth login
   ```

2. Iniciar o servidor:
   ```bash
   infra-watch server start
   ```

3. Verificar o status do agente:
   ```bash
   infra-watch server status
   ```

4. Instalar o agente para inicialização automática:
   ```bash
   infra-watch install
   ```

---

## 🛠️ Estrutura do Projeto

```plaintext
infra-watch/
├── src/
│   ├── getServerId.js    # Funções para gerenciamento de ID do servidor
│   ├── install.js        # Funções de instalação/desinstalação
│   └── ...               # Outros módulos
├── index.js              # Ponto de entrada principal
├── package.json          # Configurações e dependências
└── README.md             # Documentação do projeto
```

---

## 💻 Sistemas Operacionais Suportados

- **Linux** (instalação via scripts de inicialização)
- **macOS** (instalação via launchd)
- **Windows** (instalação via agendador de tarefas)

> **Nota**: Sistemas operacionais não listados ainda não são suportados. Entre em contato para solicitar suporte adicional.

---

## 📋 Dependências

- [commander](https://www.npmjs.com/package/commander): Para criação da interface CLI.
- [ora](https://www.npmjs.com/package/ora): Para spinners de carregamento elegantes.
- Módulos nativos do Node.js: `fs`, `os`, `process`.

---


## 📜 Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 📧 Contato

Para dúvidas, sugestões ou suporte, entre em contato:

- **Email**: rcsangola42@gmail.com
- **GitHub Issues**: [Abrir uma issue](git@github.com:JustinoSoares/agenteInfraWatch.git)

---

🌟 **Obrigado por usar o Infra-Watch!**