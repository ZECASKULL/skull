# 🚀 Deploy do SKULL BJJ Store

## 📋 **Requisitos**

- Node.js 16+ 
- npm ou yarn
- PowerShell (Windows) ou Terminal (Linux/Mac)

## 🔧 **Instalação**

### 1. **Instalar Dependências**
```bash
npm install
```

### 2. **Configurar Variáveis de Ambiente**
```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar .env com secrets seguros
nano .env
```

**Importante:** Altere `JWT_SECRET` e `SESSION_SECRET` em produção!

### 3. **Iniciar Servidor**

#### **Windows (PowerShell):**
```powershell
.\start-backend.ps1
```

#### **Manual (qualquer SO):**
```bash
node server.js
```

## 🌐 **Acesso**

- **URL:** http://localhost:3000
- **Login:** http://localhost:3000/login.html

### **Credenciais de Teste:**
- **Admin:** `admin` / `123456`
- **Usuário:** `usuario` / `senha`

## 📁 **Estrutura do Projeto**

```
repo-clean/
├── index.html          # Página principal
├── login.html           # Página de login
├── style.css            # Estilos
├── auth-secure.js       # Autenticação segura
├── script-secure.js     # Lógica da loja
├── server.js            # Backend Node.js
├── package.json         # Dependências
├── start-backend.ps1    # Script de inicialização
├── README.md            # Documentação
├── DEPLOY.md            # Este arquivo
├── .env.example         # Exemplo de configuração
└── .gitignore           # Arquivos ignorados
```

## 🔒 **Segurança Implementada**

- ✅ JWT com HttpOnly cookies
- ✅ Rate limiting server-side
- ✅ CSRF protection
- ✅ Headers de segurança (Helmet)
- ✅ Validação de entrada
- ✅ CORS configurado

## 🛠️ **Desenvolvimento**

### **Porta Customizada:**
```bash
PORT=8080 node server.js
```

### **Modo Produção:**
```bash
NODE_ENV=production node server.js
```

### **Logs:**
O servidor mostra logs de todas as requisições no console.

## 🐛 **Troubleshooting**

### **Porta em uso:**
```bash
# Mudar porta no .env
PORT=3001
```

### **Erro de permissão (PowerShell):**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### **Limpar cache:**
```bash
npm cache clean --force
rm -rf node_modules
npm install
```

## 📦 **Deploy em Produção**

### **1. Preparar Ambiente:**
- Alterar secrets no `.env`
- Configurar `NODE_ENV=production`
- Usar HTTPS

### **2. Usar PM2 (recomendado):**
```bash
npm install -g pm2
pm2 start server.js --name "jiujitsu-store"
pm2 startup
pm2 save
```

### **3. Configurar Nginx/Apache:**
- Proxy reverso para porta 3000
- Configurar SSL/TLS
- Headers de segurança adicionais

## 🌍 **GitHub Pages (Frontend Apenas)**

Se quiser apenas o frontend estático:

1. Remover arquivos de backend
2. Fazer upload para GitHub
3. Ativar GitHub Pages

**Aviso:** Sem backend, o login não funcionará (apenas demonstração).

---

## 📞 **Suporte**

- 📖 Ver `README.md` para documentação completa
- 🔧 Ver `github-setup.md` para setup do repositório
- 🛡️ Relatórios de segurança disponíveis na pasta original

**Desenvolvido com ❤️ pela SKULL BJJ Security Team**
