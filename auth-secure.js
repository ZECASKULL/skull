/**
 * ==============================================
 * SISTEMA DE AUTENTICAÇÃO SEGURA (BACKEND)
 * ==============================================
 * Cliente de autenticação que se comunica com backend seguro
 * 
 * @author: SKULL BJJ Security Team
 * @version: 2.0.0 Secure
 * @since: 2026
 */

// ==============================================
// CONFIGURAÇÃO
// ==============================================
const API_CONFIG = {
  BASE_URL: window.location.origin,
  ENDPOINTS: {
    LOGIN: '/api/login',
    LOGOUT: '/api/logout',
    CHECK: '/api/auth/check',
    PRODUCTS: '/api/products',
    CSRF_TOKEN: '/api/csrf-token'
  },
  TIMEOUT: 10000
};

// ==============================================
// GERENCIADOR DE AUTENTICAÇÃO SEGURA
// ==============================================
class SecureAuthManager {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.token = null;
    this.csrfToken = null;
    this.init();
  }

  /**
   * Inicializa o sistema de autenticação
   */
  async init() {
    try {
      // Verificar se há sessão ativa
      await this.checkAuthStatus();
      
      // Configurar interceptores de requisição
      this.setupRequestInterceptors();
      
      console.log('🔐 Sistema de autenticação segura inicializado');
    } catch (error) {
      console.error('❌ Erro na inicialização:', error);
    }
  }

  /**
   * Realiza login seguro
   */
  async login(username, password) {
    try {
      // Obter token CSRF
      await this.getCSRFToken();
      
      // Enviar requisição de login
      const response = await this.apiRequest(API_CONFIG.ENDPOINTS.LOGIN, {
        method: 'POST',
        body: JSON.stringify({
          username: username.trim(),
          password: password
        }),
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': this.csrfToken
        }
      });

      if (response.success) {
        // Armazenar token JWT em memória (não em localStorage)
        this.token = response.token;
        this.currentUser = response.user;
        this.isAuthenticated = true;

        // Disparar evento de login
        this.dispatchEvent('auth:login', {
          user: this.currentUser
        });

        console.log('✅ Login realizado com sucesso');
        return { success: true, user: this.currentUser };
      } else {
        throw new Error(response.error || 'Falha no login');
      }
    } catch (error) {
      console.error('❌ Erro no login:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Realiza logout seguro
   */
  async logout() {
    try {
      if (this.isAuthenticated && this.token) {
        await this.apiRequest(API_CONFIG.ENDPOINTS.LOGOUT, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'X-CSRF-Token': this.csrfToken
          }
        });
      }

      // Limpar dados locais
      this.clearAuthData();

      // Disparar evento de logout
      this.dispatchEvent('auth:logout');

      console.log('✅ Logout realizado com sucesso');
      return { success: true };
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      // Forçar logout mesmo em caso de erro
      this.clearAuthData();
      return { success: true };
    }
  }

  /**
   * Verifica status da autenticação
   */
  async checkAuthStatus() {
    try {
      const token = this.getStoredToken();
      if (!token) {
        this.clearAuthData();
        return { authenticated: false };
      }

      const response = await this.apiRequest(API_CONFIG.ENDPOINTS.CHECK, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.success && response.authenticated) {
        this.token = token;
        this.currentUser = response.user;
        this.isAuthenticated = true;
        return { authenticated: true, user: this.currentUser };
      } else {
        this.clearAuthData();
        return { authenticated: false };
      }
    } catch (error) {
      console.error('❌ Erro na verificação de autenticação:', error);
      this.clearAuthData();
      return { authenticated: false };
    }
  }

  /**
   * Obtém token CSRF
   */
  async getCSRFToken() {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CSRF_TOKEN}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        this.csrfToken = data.csrfToken;
        return this.csrfToken;
      } else {
        throw new Error('Falha ao obter token CSRF');
      }
    } catch (error) {
      console.error('❌ Erro ao obter token CSRF:', error);
      throw error;
    }
  }

  /**
   * Realiza requisição à API com tratamento de erro
   */
  async apiRequest(endpoint, options = {}) {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    
    const defaultOptions = {
      credentials: 'include',
      timeout: API_CONFIG.TIMEOUT
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
      const response = await fetch(url, finalOptions);
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expirado ou inválido
          this.clearAuthData();
          this.dispatchEvent('auth:expired');
          throw new Error('Sessão expirada');
        } else if (response.status === 403) {
          throw new Error('Acesso negado');
        } else if (response.status === 429) {
          throw new Error('Muitas tentativas. Tente novamente mais tarde.');
        } else {
          throw new Error(`Erro HTTP ${response.status}`);
        }
      }

      return await response.json();
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Erro de conexão com o servidor');
      }
      throw error;
    }
  }

  /**
   * Configura interceptores de requisição
   */
  setupRequestInterceptors() {
    // Interceptar cliques em links de logout
    document.addEventListener('click', (e) => {
      if (e.target.matches('#logoutButton, [data-action="logout"]')) {
        e.preventDefault();
        this.logout();
      }
    });

    // Interceptar envio de formulários de login
    document.addEventListener('submit', async (e) => {
      if (e.target.matches('#loginForm')) {
        e.preventDefault();
        await this.handleLoginForm(e.target);
      }
    });
  }

  /**
   * Processa formulário de login
   */
  async handleLoginForm(form) {
    const username = form.username.value;
    const password = form.password.value;
    const submitButton = form.querySelector('button[type="submit"]');

    // Validação básica
    if (!username || !password) {
      this.showMessage('Preencha todos os campos', 'error');
      return;
    }

    // Desabilitar botão
    submitButton.disabled = true;
    submitButton.textContent = 'Entrando...';

    try {
      const result = await this.login(username, password);
      
      if (result.success) {
        this.showMessage('Login realizado com sucesso!', 'success');
        // Redirecionar para página principal
        setTimeout(() => {
          window.location.href = '/index.html';
        }, 1000);
      } else {
        this.showMessage(result.error || 'Falha no login', 'error');
      }
    } catch (error) {
      this.showMessage('Erro ao fazer login', 'error');
    } finally {
      // Reabilitar botão
      submitButton.disabled = false;
      submitButton.textContent = 'Entrar';
    }
  }

  /**
   * Obtém token armazenado (session storage é mais seguro que localStorage)
   */
  getStoredToken() {
    try {
      return sessionStorage.getItem('auth_token');
    } catch (error) {
      console.error('Erro ao obter token armazenado:', error);
      return null;
    }
  }

  /**
   * Armazena token de forma segura
   */
  storeToken(token) {
    try {
      sessionStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Erro ao armazenar token:', error);
    }
  }

  /**
   * Limpa dados de autenticação
   */
  clearAuthData() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.token = null;
    this.csrfToken = null;
    
    try {
      sessionStorage.removeItem('auth_token');
    } catch (error) {
      console.error('Erro ao limpar token armazenado:', error);
    }
  }

  /**
   * Dispara evento customizado
   */
  dispatchEvent(eventName, detail = {}) {
    const event = new CustomEvent(eventName, { detail });
    document.dispatchEvent(event);
  }

  /**
   * Exibe mensagem para o usuário
   */
  showMessage(message, type = 'info') {
    // Criar elemento de mensagem
    const messageEl = document.createElement('div');
    messageEl.className = `auth-message auth-message-${type}`;
    messageEl.textContent = message;
    
    // Estilos
    Object.assign(messageEl.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '12px 24px',
      borderRadius: '4px',
      color: 'white',
      fontWeight: '500',
      zIndex: '10000',
      opacity: '0',
      transform: 'translateY(-20px)',
      transition: 'all 0.3s ease'
    });

    // Cor conforme tipo
    const colors = {
      success: '#2ecc71',
      error: '#e74c3c',
      warning: '#f39c12',
      info: '#3498db'
    };
    messageEl.style.backgroundColor = colors[type] || colors.info;

    // Adicionar ao DOM
    document.body.appendChild(messageEl);

    // Animar entrada
    setTimeout(() => {
      messageEl.style.opacity = '1';
      messageEl.style.transform = 'translateY(0)';
    }, 100);

    // Remover após 3 segundos
    setTimeout(() => {
      messageEl.style.opacity = '0';
      messageEl.style.transform = 'translateY(-20px)';
      setTimeout(() => {
        if (messageEl.parentNode) {
          messageEl.parentNode.removeChild(messageEl);
        }
      }, 300);
    }, 3000);
  }

  /**
   * Obtém produtos da API
   */
  async getProducts(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.color && filters.color !== 'all') {
        params.append('color', filters.color);
      }
      if (filters.minPrice) {
        params.append('minPrice', filters.minPrice);
      }
      if (filters.maxPrice) {
        params.append('maxPrice', filters.maxPrice);
      }
      if (filters.sort) {
        params.append('sort', filters.sort);
      }

      const endpoint = `${API_CONFIG.ENDPOINTS.PRODUCTS}${params.toString() ? '?' + params.toString() : ''}`;
      
      const response = await this.apiRequest(endpoint, {
        method: 'GET'
      });

      return response;
    } catch (error) {
      console.error('❌ Erro ao obter produtos:', error);
      throw error;
    }
  }

  /**
   * Verifica se usuário tem permissão
   */
  hasRole(requiredRole) {
    if (!this.isAuthenticated || !this.currentUser) {
      return false;
    }
    
    if (requiredRole === 'admin') {
      return this.currentUser.role === 'admin';
    }
    
    return true; // Usuário autenticado tem acesso básico
  }

  /**
   * Obtém informações do usuário atual
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Verifica se está autenticado
   */
  isLoggedIn() {
    return this.isAuthenticated;
  }
}

// ==============================================
// INICIALIZAÇÃO
// ==============================================
document.addEventListener('DOMContentLoaded', async () => {
  // Inicializar gerenciador de autenticação
  window.secureAuthManager = new SecureAuthManager();
  
  // Expor API segura globalmente
  window.SecureAuth = {
    login: (username, password) => window.secureAuthManager.login(username, password),
    logout: () => window.secureAuthManager.logout(),
    checkAuth: () => window.secureAuthManager.checkAuthStatus(),
    getCurrentUser: () => window.secureAuthManager.getCurrentUser(),
    isLoggedIn: () => window.secureAuthManager.isLoggedIn(),
    hasRole: (role) => window.secureAuthManager.hasRole(role),
    getProducts: (filters) => window.secureAuthManager.getProducts(filters)
  };

  // Verificar autenticação ao carregar
  const authStatus = await window.secureAuthManager.checkAuthStatus();
  
  if (authStatus.authenticated) {
    // Atualizar UI se estiver autenticado
    updateUIForAuthenticatedUser(authStatus.user);
  }

  console.log('✅ Sistema de autenticação segura disponível via SecureAuth');
});

/**
 * Atualiza UI para usuário autenticado
 */
function updateUIForAuthenticatedUser(user) {
  // Atualizar mensagem de boas-vindas
  const welcomeMessage = document.getElementById('welcomeMessage');
  if (welcomeMessage) {
    welcomeMessage.textContent = `Bem-vindo, ${user.name}!`;
    if (user.role === 'admin') {
      welcomeMessage.innerHTML += ' 🛡️';
    }
  }

  // Mostrar botão de logout
  const logoutButton = document.getElementById('logoutButton');
  if (logoutButton) {
    logoutButton.style.display = 'block';
  }
}

// Exportar para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SecureAuthManager };
}
