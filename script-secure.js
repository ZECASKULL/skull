/**
 * ==============================================
 * APLICAÇÃO SEGURA: JIUJITSU STORE
 * ==============================================
 * Loja virtual de kimonos com backend seguro
 * 
 * @author: SKULL BJJ Security Team
 * @version: 2.0.0 Secure
 * @since: 2026
 */

// ==============================================
// MÓDULO: CONFIGURAÇÃO
// ==============================================
const CONFIG = {
  // Configurações da loja
  STORE: {
    NAME: 'SKULL BJJ Store',
    CURRENCY: 'R$',
    SHIPPING_COST: 0,
    FREE_SHIPPING_THRESHOLD: 1500
  },
  
  // Configurações de animação
  ANIMATION: {
    FADE_DURATION: 300,
    SLIDE_DURATION: 400,
    TRANSITION_DELAY: 50
  },
  
  // Configurações de acessibilidade
  ACCESSIBILITY: {
    KEYBOARD_NAVIGATION: true,
    FOCUS_OUTLINE_WIDTH: '2px'
  }
};

// ==============================================
// GERENCIADOR DA LOJA SEGURA
// ==============================================
class SecureStoreManager {
  constructor() {
    this.products = [];
    this.filteredProducts = [];
    this.filters = {
      color: 'all',
      minPrice: null,
      maxPrice: null,
      sort: 'featured'
    };
    this.isLoading = false;
    this.init();
  }

  /**
   * Inicializa a aplicação
   */
  async init() {
    try {
      console.log('🛍️ Inicializando loja segura...');
      
      // Verificar autenticação
      await this.checkAuthentication();
      
      // Carregar produtos
      await this.loadProducts();
      
      // Configurar interface
      this.setupUI();
      
      // Configurar eventos
      this.setupEventListeners();
      
      console.log('✅ Loja segura inicializada com sucesso');
    } catch (error) {
      console.error('❌ Erro na inicialização:', error);
      this.handleInitError(error);
    }
  }

  /**
   * Verifica autenticação do usuário
   */
  async checkAuthentication() {
    if (!window.SecureAuth || !window.SecureAuth.isLoggedIn()) {
      console.warn('⚠️ Usuário não autenticado, redirecionando...');
      this.redirectToLogin();
      return false;
    }
    
    const user = window.SecureAuth.getCurrentUser();
    console.log(`👤 Usuário autenticado: ${user.name} (${user.role})`);
    return true;
  }

  /**
   * Carrega produtos da API
   */
  async loadProducts() {
    this.setLoading(true);
    
    try {
      const response = await window.SecureAuth.getProducts(this.filters);
      
      if (response.success) {
        this.products = response.products;
        this.filteredProducts = [...this.products];
        console.log(`📦 ${this.products.length} produtos carregados`);
      } else {
        throw new Error(response.error || 'Falha ao carregar produtos');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar produtos:', error);
      this.showErrorMessage('Não foi possível carregar os produtos. Tente novamente.');
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Configura interface inicial
   */
  setupUI() {
    // Atualizar informações do usuário
    const user = window.SecureAuth.getCurrentUser();
    if (user) {
      const welcomeMessage = document.getElementById('welcomeMessage');
      if (welcomeMessage) {
        welcomeMessage.textContent = `Bem-vindo, ${user.name}!`;
        if (user.role === 'admin') {
          welcomeMessage.innerHTML += ' 🛡️';
        }
      }
    }

    // Renderizar produtos
    this.renderProducts();
    
    // Configurar filtros
    this.setupFilters();
  }

  /**
   * Configura eventos da interface
   */
  setupEventListeners() {
    // Evento de logout
    document.addEventListener('auth:logout', () => {
      this.redirectToLogin();
    });

    // Evento de expiração de sessão
    document.addEventListener('auth:expired', () => {
      this.showSessionExpiredMessage();
    });

    // Eventos de filtros
    const filterElements = document.querySelectorAll('[data-filter]');
    filterElements.forEach(element => {
      element.addEventListener('change', (e) => {
        this.handleFilterChange(e.target);
      });
    });

    // Eventos de ordenação
    const sortElements = document.querySelectorAll('[data-sort]');
    sortElements.forEach(element => {
      element.addEventListener('click', (e) => {
        this.handleSortChange(e.target);
      });
    });

    // Navegação suave
    this.setupSmoothScrolling();
  }

  /**
   * Configura filtros
   */
  setupFilters() {
    // Filtro de cor
    const colorFilter = document.getElementById('colorFilter');
    if (colorFilter) {
      colorFilter.value = this.filters.color;
    }

    // Filtros de preço
    const minPriceFilter = document.getElementById('minPrice');
    const maxPriceFilter = document.getElementById('maxPrice');
    if (minPriceFilter) minPriceFilter.value = this.filters.minPrice || '';
    if (maxPriceFilter) maxPriceFilter.value = this.filters.maxPrice || '';

    // Ordenação
    const sortFilter = document.getElementById('sortFilter');
    if (sortFilter) {
      sortFilter.value = this.filters.sort;
    }
  }

  /**
   * Manipula mudança de filtros
   */
  async handleFilterChange(element) {
    const filterType = element.dataset.filter;
    const value = element.value;

    switch (filterType) {
      case 'color':
        this.filters.color = value;
        break;
      case 'minPrice':
        this.filters.minPrice = value ? parseFloat(value) : null;
        break;
      case 'maxPrice':
        this.filters.maxPrice = value ? parseFloat(value) : null;
        break;
      case 'sort':
        this.filters.sort = value;
        break;
    }

    await this.applyFilters();
  }

  /**
   * Manipula mudança de ordenação
   */
  async handleSortChange(element) {
    const sortType = element.dataset.sort;
    this.filters.sort = sortType;
    
    // Atualizar UI
    document.querySelectorAll('[data-sort]').forEach(btn => {
      btn.classList.remove('active');
    });
    element.classList.add('active');
    
    await this.applyFilters();
  }

  /**
   * Aplica filtros e recarrega produtos
   */
  async applyFilters() {
    this.setLoading(true);
    
    try {
      const response = await window.SecureAuth.getProducts(this.filters);
      
      if (response.success) {
        this.filteredProducts = response.products;
        this.renderProducts();
        this.updateFilterCount();
      } else {
        throw new Error(response.error || 'Falha ao aplicar filtros');
      }
    } catch (error) {
      console.error('❌ Erro ao aplicar filtros:', error);
      this.showErrorMessage('Erro ao aplicar filtros. Tente novamente.');
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Renderiza produtos na interface
   */
  renderProducts() {
    const container = document.getElementById('productsContainer');
    if (!container) return;

    if (this.filteredProducts.length === 0) {
      container.innerHTML = this.getEmptyStateHTML();
      return;
    }

    const productsHTML = this.filteredProducts.map(product => 
      this.getProductCardHTML(product)
    ).join('');

    container.innerHTML = productsHTML;

    // Adicionar eventos aos cards
    this.setupProductCardEvents();
  }

  /**
   * Gera HTML do card de produto
   */
  getProductCardHTML(product) {
    const hasDiscount = product.discountPrice && product.discountPrice < product.price;
    const currentPrice = hasDiscount ? product.discountPrice : product.price;
    const discountPercentage = hasDiscount ? 
      Math.round((1 - currentPrice / product.price) * 100) : 0;

    return `
      <div class="product-card" data-product-id="${product.id}">
        <div class="product-image-container">
          <img src="${product.image}" alt="${product.name}" class="product-image">
          ${product.badge ? `<span class="product-badge">${this.getBadgeText(product.badge)}</span>` : ''}
          ${hasDiscount ? `<span class="discount-badge">-${discountPercentage}%</span>` : ''}
        </div>
        
        <div class="product-info">
          <h3 class="product-name">${product.name}</h3>
          <p class="product-description">${product.description || ''}</p>
          
          <div class="product-price-container">
            ${hasDiscount ? 
              `<span class="original-price">${CONFIG.STORE.CURRENCY} ${product.price.toFixed(2)}</span>` : 
              ''
            }
            <span class="current-price">${CONFIG.STORE.CURRENCY} ${currentPrice.toFixed(2)}</span>
          </div>
          
          ${product.installmentCount ? 
            `<div class="product-installments">
              ou ${product.installmentCount}x de ${CONFIG.STORE.CURRENCY} ${product.installmentValue.toFixed(2)}
            </div>` : 
            ''
          }
          
          <div class="product-actions">
            <button class="btn-primary" onclick="secureStoreManager.viewProduct(${product.id})">
              Ver Detalhes
            </button>
            <button class="btn-secondary" onclick="secureStoreManager.addToCart(${product.id})">
              Adicionar
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Obtém texto do badge
   */
  getBadgeText(badge) {
    const badges = {
      'novo': 'Novo',
      'mais-vendido': 'Mais Vendido',
      'limitado': 'Edição Limitada',
      'premium': 'Premium'
    };
    return badges[badge] || badge;
  }

  /**
   * Gera HTML de estado vazio
   */
  getEmptyStateHTML() {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <h3>Nenhum produto encontrado</h3>
        <p>Tente ajustar os filtros para encontrar o que procura.</p>
        <button class="btn-primary" onclick="secureStoreManager.clearFilters()">
          Limpar Filtros
        </button>
      </div>
    `;
  }

  /**
   * Configura eventos dos cards de produto
   */
  setupProductCardEvents() {
    const cards = document.querySelectorAll('.product-card');
    
    cards.forEach(card => {
      // Hover effect
      card.addEventListener('mouseenter', () => {
        card.classList.add('hover');
      });
      
      card.addEventListener('mouseleave', () => {
        card.classList.remove('hover');
      });

      // Acessibilidade
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const productId = parseInt(card.dataset.productId);
          this.viewProduct(productId);
        }
      });
    });
  }

  /**
   * Visualiza detalhes do produto
   */
  viewProduct(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    console.log('🔍 Visualizando produto:', product.name);
    // Em uma implementação real, abriria modal ou página de detalhes
    this.showProductDetails(product);
  }

  /**
   * Adiciona produto ao carrinho
   */
  addToCart(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    console.log('🛒 Adicionando ao carrinho:', product.name);
    this.showSuccessMessage(`${product.name} adicionado ao carrinho!`);
  }

  /**
   * Mostra detalhes do produto
   */
  showProductDetails(product) {
    // Implementar modal de detalhes
    this.showSuccessMessage(`Detalhes de: ${product.name}`);
  }

  /**
   * Limpa todos os filtros
   */
  async clearFilters() {
    this.filters = {
      color: 'all',
      minPrice: null,
      maxPrice: null,
      sort: 'featured'
    };

    // Resetar UI
    const colorFilter = document.getElementById('colorFilter');
    const minPriceFilter = document.getElementById('minPrice');
    const maxPriceFilter = document.getElementById('maxPrice');
    const sortFilter = document.getElementById('sortFilter');

    if (colorFilter) colorFilter.value = 'all';
    if (minPriceFilter) minPriceFilter.value = '';
    if (maxPriceFilter) maxPriceFilter.value = '';
    if (sortFilter) sortFilter.value = 'featured';

    await this.applyFilters();
  }

  /**
   * Atualiza contador de produtos
   */
  updateFilterCount() {
    const countElement = document.getElementById('productCount');
    if (countElement) {
      countElement.textContent = `${this.filteredProducts.length} produto(s)`;
    }
  }

  /**
   * Configura navegação suave
   */
  setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  /**
   * Define estado de carregamento
   */
  setLoading(loading) {
    this.isLoading = loading;
    
    const loadingElement = document.getElementById('loadingOverlay');
    if (loadingElement) {
      loadingElement.style.display = loading ? 'flex' : 'none';
    }

    // Atualizar botões
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
    buttons.forEach(button => {
      button.disabled = loading;
    });
  }

  /**
   * Mostra mensagem de sucesso
   */
  showSuccessMessage(message) {
    this.showMessage(message, 'success');
  }

  /**
   * Mostra mensagem de erro
   */
  showErrorMessage(message) {
    this.showMessage(message, 'error');
  }

  /**
   * Mostra mensagem genérica
   */
  showMessage(message, type = 'info') {
    const messageEl = document.createElement('div');
    messageEl.className = `store-message store-message-${type}`;
    messageEl.textContent = message;
    
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

    const colors = {
      success: '#2ecc71',
      error: '#e74c3c',
      warning: '#f39c12',
      info: '#3498db'
    };
    messageEl.style.backgroundColor = colors[type] || colors.info;

    document.body.appendChild(messageEl);

    setTimeout(() => {
      messageEl.style.opacity = '1';
      messageEl.style.transform = 'translateY(0)';
    }, 100);

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
   * Redireciona para login
   */
  redirectToLogin() {
    window.location.href = '/login.html';
  }

  /**
   * Mostra mensagem de sessão expirada
   */
  showSessionExpiredMessage() {
    this.showMessage('Sua sessão expirou. Faça login novamente.', 'warning');
    setTimeout(() => {
      this.redirectToLogin();
    }, 2000);
  }

  /**
   * Trata erros de inicialização
   */
  handleInitError(error) {
    console.error('Erro crítico na inicialização:', error);
    document.body.innerHTML = `
      <div class="error-container">
        <h1>❌ Erro ao carregar a aplicação</h1>
        <p>Não foi possível inicializar a loja. Tente recarregar a página.</p>
        <button onclick="location.reload()" class="btn-primary">Recarregar</button>
      </div>
    `;
  }
}

// ==============================================
// FUNÇÕES GLOBAIS
// ==============================================
function handleLogout() {
  if (window.SecureAuth) {
    window.SecureAuth.logout();
  }
}

function redirectToLogin() {
  window.location.href = '/login.html';
}

function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
}

// ==============================================
// INICIALIZAÇÃO
// ==============================================
document.addEventListener('DOMContentLoaded', async () => {
  // Aguardar sistema de autenticação
  if (!window.SecureAuth) {
    console.error('❌ Sistema de autenticação não encontrado');
    return;
  }

  // Inicializar gerenciador da loja
  window.secureStoreManager = new SecureStoreManager();

  // Expor API global
  window.StoreAPI = {
    loadProducts: () => window.secureStoreManager.loadProducts(),
    applyFilters: () => window.secureStoreManager.applyFilters(),
    clearFilters: () => window.secureStoreManager.clearFilters(),
    viewProduct: (id) => window.secureStoreManager.viewProduct(id),
    addToCart: (id) => window.secureStoreManager.addToCart(id)
  };

  console.log('✅ Loja segura disponível via StoreAPI');
});

// Exportar para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SecureStoreManager };
}
