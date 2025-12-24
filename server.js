// Instalar dependências quando for hospedar:
// npm install express jsonwebtoken bcryptjs cors

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const SECRET = "svfb_secret_key";
let users = []; // banco de dados temporário
let posts = [];

// Cadastro
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: "Usuário já existe" });
  }
  const hashed = await bcrypt.hash(password, 8);
  users.push({ username, password: hashed });
  res.json({ message: "Cadastro feito com sucesso!" });
});

// Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(400).json({ error: "Usuário não encontrado" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: "Senha incorreta" });

  const token = jwt.sign({ username }, SECRET, { expiresIn: "24h" });
  res.json({ token });
});

// Middleware de autenticação
function auth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "Acesso negado" });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Token inválido" });
  }
}

// Criar post/scrap
app.post('/post', auth, (req, res) => {
  const { content } = req.body;
  posts.push({ user: req.user.username, content });
  res.json({ message: "Post enviado!" });
});

// Ver posts
app.get('/posts', (req, res) => {
  res.json(posts);
});

app.listen(3000, () => {
  console.log("Servidor SVFB rodando na porta 3000");
});
