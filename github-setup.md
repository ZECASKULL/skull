# 🚀 Como Fazer Upload para o GitHub

Como o Git não está instalado no seu sistema, siga estes passos para fazer o upload do projeto Jiujitsu Store para o GitHub:

## 📋 Passo 1: Instalar Git

### Windows:
1. Baixe Git em: https://git-scm.com/download/win
2. Instale com as opções padrão
3. Reinicie o PowerShell/Command Prompt

## 📋 Passo 2: Criar Repositório no GitHub

1. Acesse: https://github.com
2. Clique em "New repository"
3. Nome do repositório: `jiujitsu-store`
4. Descrição: `🥋 Loja virtual de kimonos de jiu-jitsu brasileiro`
5. Marque "Public" ou "Private"
6. **Não** inicialize com README (já temos um)
7. Clique em "Create repository"

## 📋 Passo 3: Fazer Upload dos Arquivos

### Opção A: Interface Web (Mais Fácil)
1. No repositório criado, clique em "Add file" → "Upload files"
2. Arraste todos os arquivos do projeto:
   - `index.html`
   - `login.html`
   - `style.css`
   - `script.js`
   - `auth.js`
   - `auth-check.js`
   - `server.ps1`
   - `run-server.ps1`
   - `.gitignore`
   - `README.md`
3. Clique em "Commit changes"

### Opção B: Git Command Line (Após instalar Git)
```bash
# Navegue até a pasta do projeto
cd "c:\Users\Zecal\meu site"

# Inicialize o repositório
git init

# Configure seu usuário (primeira vez só)
git config --global user.name "Seu Nome"
git config --global user.email "seu-email@example.com"

# Adicione todos os arquivos
git add .

# Faça o primeiro commit
git commit -m "🚀 Initial commit: Jiujitsu Store E-commerce"

# Adicione o repositório remoto (substitua pela URL do seu repo)
git remote add origin https://github.com/SEU-USUARIO/jiujitsu-store.git

# Envie para o GitHub
git push -u origin main
```

## 📋 Passo 4: Ativar GitHub Pages

1. No seu repositório GitHub, vá em "Settings"
2. Role até "GitHub Pages"
3. Em "Branch", selecione "main"
4. Clique em "Save"
5. Após alguns minutos, seu site estará online em:
   `https://SEU-USUARIO.github.io/jiujitsu-store/`

## 🎯 Arquivos do Projeto

### Principais:
- `index.html` - Página principal da loja
- `style.css` - Estilos modernos e responsivos
- `script.js` - Lógica JavaScript da loja
- `README.md` - Documentação completa

### Servidor:
- `server.ps1` - Servidor PowerShell
- `run-server.ps1` - Script para iniciar servidor

### Autenticação (mantidos):
- `login.html` - Página de login
- `auth.js` - Sistema de autenticação
- `auth-check.js` - Verificação de acesso

## 🌐 Resultado Final

Após o upload, você terá:
- ✅ Repositório GitHub completo
- ✅ Site online via GitHub Pages
- ✅ Código-fonte disponível para outros desenvolvedores
- ✅ Portfolio profissional para mostrar suas habilidades

## 📱 Para Testar o Site Online

1. Acesse a URL do GitHub Pages
2. Teste todos os filtros e funcionalidades
3. Verifique o responsivo em diferentes dispositivos
4. Use o console para testar as funções de debug

Parabéns! 🎉 Seu projeto Jiujitsu Store estará no GitHub!
