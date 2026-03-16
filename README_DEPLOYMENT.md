# 📦 Fegr Messenger - Готовый к деплою пакет

## 🎯 Что в этой папке?

Все необходимые файлы для быстрого развертывания Fegr Messenger на Railway с доменом fegrem.ru.

## 📁 Файлы

### 🔧 Основные файлы
- **`package.json`** - Зависимости и скрипты
- **`server.js`** - Сервер, готовый для Railway
- **`index.html`** - Клиент, работает с любым доменом

### 📋 Конфигурационные файлы
- **`.env.example`** - Пример переменных окружения
- **`.gitignore`** - Игнорирование ненужных файлов
- **`railway.json`** - Конфигурация Railway

### 📖 Документация
- **`README.md`** - Основная документация
- **`DEPLOYMENT.md`** - Подробная инструкция по развертыванию
- **`QUICK_START.md`** - Быстрый старт (5 шагов)
- **`CHECKLIST.md`** - Чек-лист готовности

### 🔐 Инструменты
- **`generate-secret.js`** - Генератор JWT секрета

## 🚀 Быстрый запуск (5 минут)

### 1. Сгенерируйте JWT секрет
```bash
cd fegr-messenger-deployment
node generate-secret.js
```

### 2. Создайте репозиторий на GitHub
```bash
git init
git add .
git commit -m "Fegr Messenger ready for Railway"
git remote add origin https://github.com/ваш-username/fegr-messenger.git
git push -u origin main
```

### 3. Настройте Railway
1. Зайдите на [Railway.app](https://railway.app)
2. Подключите GitHub репозиторий
3. Добавьте переменные окружения:
   ```
   JWT_SECRET=скопированный-секрет
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=ваш-email@gmail.com
   SMTP_PASS=app-password-от-gmail
   ```

### 4. Настройте домен
1. В Railway: Settings → Domains → Add Domain → fegrem.ru
2. В панели управления доменом добавьте CNAME запись

### 5. Готово!
Через 5 минут ваш сайт будет доступен по https://fegrem.ru

## 📋 Что уже настроено?

✅ **CORS** - разрешены все необходимые домены
✅ **MongoDB** - автоматическое подключение
✅ **Socket.IO** - работа с доменом
✅ **HTTPS** - автоматическое SSL
✅ **Порты** - автоматическое определение
✅ **Переменные окружения** - все необходимые

## 🆘 Если что-то не работает

1. **Проверьте логи в Railway**
2. **Убедитесь в правильности переменных окружения**
3. **Проверьте DNS записи**
4. **Смотрите подробные инструкции в DEPLOYMENT.md**

## 📞 Поддержка

- **QUICK_START.md** - Быстрая помощь
- **DEPLOYMENT.md** - Подробная инструкция
- **CHECKLIST.md** - Проверка готовности

---

**Готов к запуску!** 🚀