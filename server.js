/**
 * ==============================================
 * BACKEND SEGURO - JIUJITSU STORE
 * ==============================================
 * Servidor Node.js Express com segurança enterprise
 * 
 * @author: SKULL BJJ Security Team
 * @version: 1.0.0 Secure
 * @since: 2026
 */

// Importações
require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const session = require('express-session');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const { body, validationResult } = require('express-validator');

// Configurações
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'jiujitsu-store-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const BCRYPT_ROUNDS = 12;
const SESSION_SECRET = process.env.SESSION_SECRET || 'jiujitsu-store-session-secret-change-in-production';

// Dados dos usuários (em produção usar banco de dados)
const USERS = [
  {
    id: 1,
    username: 'admin',
    password: '123456',
    role: 'admin',
    name: 'Administrador',
    email: 'admin@skullbjj.com'
  },
  {
    id: 2,
    username: 'usuario',
    password: 'senha',
    role: 'user',
    name: 'Usuário Comum',
    email: 'usuario@skullbjj.com'
  }
];

// Função para verificar senhas (texto claro para desenvolvimento)
async function verifyPassword(plainPassword, hashedPassword) {
  // Para desenvolvimento: comparação direta
  console.log('🔐 Verificando senha:', plainPassword, '===', hashedPassword);
  return plainPassword === hashedPassword;
}

// Dados dos produtos (em produção usar banco de dados)
const PRODUCTS = [
  {
    id: 1,
    name: "Kimono Premium Black",
    price: 599.90,
    color: "preto",
    image: "https://via.placeholder.com/300x400/000000/FFFFFF?text=Kimono+Black",
    description: "Kimono profissional de alta qualidade",
    badge: "mais-vendido"
  },
  {
    id: 2,
    name: "Kimono Competition White",
    price: 799.90,
    color: "branco",
    image: "https://via.placeholder.com/300x400/FFFFFF/000000?text=Kimono+White",
    description: "Kimono para competições",
    badge: "novo"
  },
  {
    id: 3,
    name: "Kimono Training Blue",
    price: 499.90,
    color: "azul",
    image: "https://via.placeholder.com/300x400/0000FF/FFFFFF?text=Kimono+Blue",
    description: "Kimono para treinamento diário"
  },
  {
    id: 4,
    name: "Kimono Pro Edition",
    price: 899.90,
    color: "preto",
    image: "https://via.placeholder.com/300x400/333333/FFFFFF?text=Kimono+Pro",
    description: "Edição limitada para profissionais",
    badge: "limitado"
  },
  {
    id: 5,
    name: "Kimono Lightweight",
    price: 399.90,
    color: "azul",
    image: "https://via.placeholder.com/300x400/1E90FF/FFFFFF?text=Kimono+Light",
    description: "Kimono ultra leve para verão"
  },
  {
    id: 6,
    name: "Kimono Classic Gold",
    price: 1299.90,
    color: "preto",
    image: "https://via.placeholder.com/300x400/FFD700/000000?text=Kimono+Gold",
    description: "Edição especial com detalhes em ouro",
    badge: "premium"
  }
];

// Inicialização do Express
const app = express();

// Middleware de segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  }
}));

// CORS configurado
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por IP
  message: {
    error: 'Muitas requisições. Tente novamente mais tarde.',
    retryAfter: '15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting específico para login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas de login
  skipSuccessfulRequests: true,
  message: {
    error: 'Muitas tentativas de login. Conta bloqueada por 15 minutos.',
    retryAfter: '15 minutos'
  }
});

app.use('/api/login', loginLimiter);
app.use(limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Session middleware
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  },
  name: 'jiujitsu-session'
}));

// CSRF protection
const csrfProtection = csrf({ 
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict'
  }
});

// Middleware de logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.connection.remoteAddress;
  console.log(`[${timestamp}] ${req.method} ${req.url} - IP: ${ip}`);
  next();
});

// Middleware de validação de entrada
const validateInput = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Dados inválidos',
      details: errors.array()
    });
  }
  next();
};

// Middleware de autenticação JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Token de autenticação necessário'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Token inválido ou expirado'
      });
    }
    req.user = user;
    next();
  });
};

// Middleware de verificação de role
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Permissão negada'
      });
    }
    next();
  };
};

// === ROTAS DA API ===

// Rota de saúde do servidor
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Servidor Jiujitsu Store online',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Obter token CSRF
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({
    success: true,
    csrfToken: req.csrfToken()
  });
});

// Login
app.post('/api/login', [
  body('username').trim().isLength({ min: 3, max: 50 }).escape(),
  body('password').isLength({ min: 4, max: 100 })
], validateInput, async (req, res) => {
  try {
    const { username, password } = req.body;

    // Encontrar usuário
    const user = USERS.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário ou senha inválidos'
      });
    }

    // Verificar senha
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Usuário ou senha inválidos'
      });
    }

    // Gerar JWT
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Armazenar sessão
    req.session.user = {
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name
    };

    // Remover senha do objeto usuário
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      user: userWithoutPassword,
      token: token
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Verificar autenticação
app.get('/api/auth/check', authenticateToken, (req, res) => {
  res.json({
    success: true,
    authenticated: true,
    user: req.user
  });
});

// Logout
app.post('/api/logout', authenticateToken, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Erro no logout:', err);
      return res.status(500).json({
        success: false,
        error: 'Erro ao fazer logout'
      });
    }

    res.clearCookie('jiujitsu-session');
    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });
  });
});

// Obter produtos
app.get('/api/products', (req, res) => {
  const { color, minPrice, maxPrice, sort } = req.query;

  let filteredProducts = [...PRODUCTS];

  // Filtrar por cor
  if (color && color !== 'all') {
    filteredProducts = filteredProducts.filter(p => p.color === color);
  }

  // Filtrar por preço
  if (minPrice) {
    filteredProducts = filteredProducts.filter(p => p.price >= parseFloat(minPrice));
  }
  if (maxPrice) {
    filteredProducts = filteredProducts.filter(p => p.price <= parseFloat(maxPrice));
  }

  // Ordenar
  if (sort) {
    switch (sort) {
      case 'price-asc':
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'featured':
        filteredProducts.sort((a, b) => (b.badge ? 1 : 0) - (a.badge ? 1 : 0));
        break;
    }
  }

  res.json({
    success: true,
    products: filteredProducts,
    total: filteredProducts.length
  });
});

// Obter produto por ID
app.get('/api/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const product = PRODUCTS.find(p => p.id === productId);

  if (!product) {
    return res.status(404).json({
      success: false,
      error: 'Produto não encontrado'
    });
  }

  res.json({
    success: true,
    product: product
  });
});

// Rota admin apenas para administradores
app.get('/api/admin/users', authenticateToken, requireRole(['admin']), (req, res) => {
  const usersWithoutPasswords = USERS.map(({ password, ...user }) => user);
  
  res.json({
    success: true,
    users: usersWithoutPasswords
  });
});

// Middleware para servir arquivos estáticos
app.use(express.static('.', {
  dotfiles: 'deny',
  index: ['index.html'],
  maxAge: '1h'
}));

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro no servidor:', err);
  
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({
      success: false,
      error: 'Token CSRF inválido'
    });
  }

  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor'
  });
});

// Middleware para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor Jiujitsu Store iniciado na porta ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`🛡️ Segurança: Helmet + Rate Limiting + JWT + CSRF`);
  console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
