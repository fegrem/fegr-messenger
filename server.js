const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const crypto = require('crypto');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const nodemailer = require('nodemailer');

const app = express();
const server = http.createServer(app);

// Настройка CORS для Railway и домена
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'https://fegrem.ru',
  'https://www.fegrem.ru',
  'https://your-app-name.up.railway.app' // Заменится на реальный URL Railway
];

const io = socketIo(server, {
  cors: {
    origin: function (origin, callback) {
      // Разрешаем запросы без origin (мобильные приложения, curl и т.д.)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Обслуживание HTML файлов
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'profile.html'));
});

// Обслуживание index.html для всех маршрутов кроме API
app.get(/^(?!\/api)/, (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Настройка транспорта для email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true для 465, false для других портов
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Подключение к MongoDB с использованием Railway переменных
const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/fegr-messenger';

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Модели данных
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  nickname: { type: String, unique: true, required: true },
  avatar: { type: String, default: null },
  emailVerified: { type: Boolean, default: false },
  verificationCode: { type: String },
  verificationCodeExpires: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: { type: String },
  media: { type: String }, // URL к загруженному файлу
  mediaType: { type: String, enum: ['image', 'video'] },
  createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String },
  media: { type: String }, // URL к загруженному файлу
  mediaType: { type: String, enum: ['image', 'video'] },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

const Post = mongoose.model('Post', postSchema);

// Настройка хранилища файлов
const storage = new GridFsStorage({
  url: process.env.MONGODB_URI || 'mongodb://localhost:27017/fegr-messenger',
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'
        };
        resolve(fileInfo);
      });
    });
  }
});

const upload = multer({ storage });

// Middleware аутентификации
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.id);
    
    if (!user) {
      throw new Error();
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};

// Маршруты API

// Генерация 6-значного кода подтверждения
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Отправка email с подтверждением
async function sendVerificationEmail(email, code) {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Подтверждение email',
      text: `Ваш код подтверждения: ${code}\n\nЭтот код действителен 1 час.`
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    console.error('SMTP Configuration:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      secure: false
    });
    return false;
  }
}

// Регистрация пользователя
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, nickname } = req.body;
    
    const existingUser = await User.findOne({ $or: [{ email }, { nickname }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Email or nickname already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    const user = new User({ 
      email, 
      password: hashedPassword, 
      name, 
      nickname,
      verificationCode,
      verificationCodeExpires
    });
    
    await user.save();
    
    // Отправка email с подтверждением
    const emailSent = await sendVerificationEmail(email, verificationCode);
    
    if (!emailSent) {
      return res.status(500).json({ error: 'Failed to send verification email' });
    }
    
    res.status(201).json({
      message: 'Registration successful. Please check your email for verification code.',
      userId: user._id
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Админ маршрут для очистки пользователей (для тестирования)
app.post('/api/admin/clear-users', async (req, res) => {
  try {
    const result = await User.deleteMany({});
    res.json({ message: `Deleted ${result.deletedCount} users` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Подтверждение email
app.post('/api/auth/verify', async (req, res) => {
  try {
    const { userId, code } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.emailVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }
    
    if (user.verificationCode !== code) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }
    
    if (user.verificationCodeExpires < new Date()) {
      return res.status(400).json({ error: 'Verification code expired' });
    }
    
    user.emailVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });
    
    res.json({
      message: 'Email verified successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        nickname: user.nickname,
        avatar: user.avatar
      },
      token
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Повторная отправка кода подтверждения
app.post('/api/auth/resend-verification', async (req, res) => {
  try {
    const { userId } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.emailVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }
    
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    user.verificationCode = verificationCode;
    user.verificationCodeExpires = verificationCodeExpires;
    await user.save();
    
    const emailSent = await sendVerificationEmail(user.email, verificationCode);
    
    if (!emailSent) {
      return res.status(500).json({ error: 'Failed to send verification email' });
    }
    
    res.json({ message: 'Verification code sent to your email' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Авторизация пользователя
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });
    
    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        nickname: user.nickname,
        avatar: user.avatar
      },
      token
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Обновление профиля пользователя
app.put('/api/users/profile', auth, async (req, res) => {
  try {
    const { name, nickname } = req.body;
    const user = await User.findById(req.user._id);
    
    if (nickname && nickname !== user.nickname) {
      const existingUser = await User.findOne({ nickname, _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(400).json({ error: 'Nickname already exists' });
      }
    }
    
    user.name = name || user.name;
    user.nickname = nickname || user.nickname;
    
    if (req.file) {
      user.avatar = req.file.filename;
    }
    
    await user.save();
    
    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        nickname: user.nickname,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Загрузка аватара
app.post('/api/users/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.avatar = req.file.filename;
    await user.save();
    
    res.json({ avatar: user.avatar });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Отправка сообщения
app.post('/api/messages', auth, upload.single('media'), async (req, res) => {
  try {
    const { receiver, content } = req.body;
    const media = req.file ? req.file.filename : null;
    const mediaType = req.file ? (req.file.mimetype.startsWith('image') ? 'image' : 'video') : null;
    
    const message = new Message({
      sender: req.user._id,
      receiver,
      content,
      media,
      mediaType
    });
    
    await message.save();
    await message.populate('sender', 'name nickname avatar');
    
    // Отправка через сокет
    io.to(receiver).emit('new_message', message);
    
    res.json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Получение сообщений
app.get('/api/messages/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id }
      ]
    }).populate('sender', 'name nickname avatar').sort({ createdAt: 1 });
    
    res.json(messages);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Создание поста
app.post('/api/posts', auth, upload.single('media'), async (req, res) => {
  try {
    const { content } = req.body;
    const media = req.file ? req.file.filename : null;
    const mediaType = req.file ? (req.file.mimetype.startsWith('image') ? 'image' : 'video') : null;
    
    const post = new Post({
      user: req.user._id,
      content,
      media,
      mediaType
    });
    
    await post.save();
    await post.populate('user', 'name nickname avatar');
    
    res.json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Получение ленты постов
app.get('/api/feed', auth, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'name nickname avatar')
      .populate('likes', 'name nickname')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(posts);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Лайк поста
app.post('/api/posts/:postId/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    if (post.likes.includes(req.user._id)) {
      post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      post.likes.push(req.user._id);
    }
    
    await post.save();
    await post.populate('user', 'name nickname avatar');
    
    res.json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Добавление комментария
app.post('/api/posts/:postId/comments', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    post.comments.push({
      user: req.user._id,
      content
    });
    
    await post.save();
    await post.populate('user', 'name nickname avatar');
    
    res.json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Подключение Socket.IO
io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('join', (userId) => {
    socket.join(userId);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Определение порта для Railway
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`MongoDB URI: ${mongoUri.replace(/\/\/.*@/, '//username:password@')}`); // Скрываем пароль в логах
});
