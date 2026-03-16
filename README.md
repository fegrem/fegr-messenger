# Fegr Messenger

Мессенджер с реальными чатами, постами и медиафайлами. Построен на Node.js, Express, MongoDB и Socket.IO.

## 🚀 Быстрый старт

### Локальная разработка

1. **Клонируйте репозиторий:**
   ```bash
   git clone <ваш-репозиторий>
   cd fegr-messenger
   ```

2. **Установите зависимости:**
   ```bash
   npm install
   ```

3. **Настройте переменные окружения:**
   ```bash
   cp .env.example .env
   # Отредактируйте .env файл с вашими настройками
   ```

4. **Запустите приложение:**
   ```bash
   npm run dev  # Для разработки с hot-reload
   # или
   npm start    # Для production
   ```

Приложение будет доступно по адресу `http://localhost:5000`

## 📦 Развертывание на Railway

### Подготовка проекта

1. **Убедитесь, что у вас есть:**
   - Аккаунт на [GitHub](https://github.com)
   - Аккаунт на [Railway.app](https://railway.app)
   - Аккаунт на [MongoDB Atlas](https://www.mongodb.com/atlas) (для базы данных)

2. **Загрузите проект в GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <ваш-github-репозиторий>
   git push -u origin main
   ```

### Настройка Railway

1. **Подключите GitHub репозиторий:**
   - Зайдите на [Railway.app](https://railway.app)
   - Нажмите "New Project"
   - Выберите "Deploy from GitHub repo"
   - Выберите ваш репозиторий

2. **Настройте переменные окружения:**
   В Railway перейдите в Settings → Variables и добавьте:

   ```
   JWT_SECRET=ваш-сильный-секрет-ключ-минимум-32-символа
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=ваш-email@gmail.com
   SMTP_PASS=ваш-app-password
   ```

   **Важно:** Для Gmail нужно создать App Password:
   - Зайдите в Google Account Settings
   - Включите 2FA
   - Создайте App Password для "Mail"

3. **Настройте MongoDB:**
   - В Railway перейдите в "Add" → "Database"
   - Выберите "MongoDB"
   - Railway автоматически создаст DATABASE_URL переменную

### Настройка домена fegrem.ru

1. **В Railway:**
   - Перейдите в Settings → Domains
   - Нажмите "Add Domain"
   - Введите `fegrem.ru`
   - Railway покажет DNS-записи для настройки

2. **В панели управления доменом:**
   - Добавьте CNAME запись:
     ```
     Тип: CNAME
     Имя: @ (или fegrem.ru)
     Значение: ваш-проект.up.railway.app
     TTL: 3600
     ```
   - Или добавьте A запись (если Railway предоставит IP)

3. **Настройте www перенаправление:**
   - Добавьте CNAME запись:
     ```
     Тип: CNAME
     Имя: www
     Значение: fegrem.ru
     TTL: 3600
     ```

4. **В Railway:**
   - Добавьте домен `www.fegrem.ru`
   - Настройте перенаправление на основной домен

### SSL и HTTPS

Railway автоматически предоставляет SSL сертификаты:
- HTTPS будет работать автоматически
- SSL сертификаты обновляются автоматически
- Никаких дополнительных настроек не требуется

## 🔧 Конфигурация

### Переменные окружения

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `PORT` | Порт сервера | 5000 |
| `NODE_ENV` | Режим окружения | development |
| `JWT_SECRET` | Секрет для JWT токенов | - |
| `MONGODB_URI` | Строка подключения к MongoDB | - |
| `SMTP_HOST` | SMTP хост для email | smtp.gmail.com |
| `SMTP_PORT` | SMTP порт | 587 |
| `SMTP_USER` | SMTP пользователь | - |
| `SMTP_PASS` | SMTP пароль | - |

### Особенности Railway

- **Порт:** Railway автоматически назначает PORT
- **MongoDB:** Используйте DATABASE_URL от Railway
- **HTTPS:** Автоматически включено
- **Домены:** Настройка через Railway dashboard

## 📁 Структура проекта

```
fegr-messenger/
├── server.js          # Основной сервер
├── package.json       # Зависимости и скрипты
├── .env.example       # Пример переменных окружения
├── index.html         # Главная страница
├── login.html         # Страница входа
├── profile.html       # Страница профиля
└── README.md          # Этот файл
```

## 🚨 Важные моменты

### Безопасность

1. **JWT Secret:** Используйте сильный секрет (минимум 32 символа)
2. **Email:** Настройте App Password для Gmail
3. **MongoDB:** Используйте безопасные настройки в Atlas

### Производительность

1. **MongoDB:** Используйте индексы для часто используемых полей
2. **Socket.IO:** Настройте оптимальные параметры для вашего трафика
3. **Статика:** Railway автоматически обслуживает статические файлы

### Мониторинг

1. **Логи:** Просматривайте в Railway dashboard
2. **Метрики:** Используйте встроенные метрики Railway
3. **Ошибки:** Настройте уведомления в Railway

## 🐛 Troubleshooting

### Частые проблемы

1. **Ошибка подключения к MongoDB:**
   - Проверьте DATABASE_URL в Railway
   - Убедитесь, что MongoDB Atlas разрешает подключения

2. **Email не отправляется:**
   - Проверьте App Password в Gmail
   - Убедитесь, что включена 2FA

3. **Домен не работает:**
   - Проверьте DNS записи
   - Подождите 24 часа для распространения DNS

4. **Socket.IO не работает:**
   - Проверьте CORS настройки
   - Убедитесь, что домен добавлен в allowedOrigins

### Поддержка

Если возникли проблемы:
1. Проверьте логи в Railway dashboard
2. Убедитесь, что все переменные окружения настроены
3. Проверьте подключение к MongoDB
4. Обратитесь за помощью в issues

## 📄 Лицензия

MIT License - см. LICENSE файл