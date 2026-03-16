# 🚀 Быстрый старт: Развертывание на Railway

## 5 шагов к fegrem.ru

### Шаг 1: Сгенерируйте JWT секрет
```bash
node generate-secret.js
```
Скопируйте сгенерированный секрет - он понадобится в Railway.

### Шаг 2: Создайте App Password для Gmail
1. Зайдите в [Google Account](https://myaccount.google.com/)
2. Включите двухфакторную аутентификацию
3. Перейдите в Security → App passwords
4. Создайте пароль для приложения "Mail"
5. Скопируйте App Password

### Шаг 3: Загрузите проект в GitHub
```bash
git init
git add .
git commit -m "Fegr Messenger ready for Railway"
git remote add origin https://github.com/ваш-username/fegr-messenger.git
git branch -M main
git push -u origin main
```

### Шаг 4: Настройте Railway
1. Зайдите на [Railway.app](https://railway.app)
2. Нажмите "New Project" → "Deploy from GitHub repo"
3. Выберите ваш репозиторий
4. Дождитесь завершения деплоя

### Шаг 5: Настройте переменные окружения
В Railway перейдите в **Settings → Variables** и добавьте:

```
JWT_SECRET=скопированный-секрет-из-шага-1
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ваш-email@gmail.com
SMTP_PASS=скопированный-app-password-из-шага-2
```

## Что дальше?

### Настройка домена fegrem.ru
1. В Railway: Settings → Domains → Add Domain → введите `fegrem.ru`
2. В панели управления доменом добавьте CNAME запись:
   ```
   Имя: @
   Значение: ваш-проект.up.railway.app
   ```
3. Добавьте www перенаправление

### Проверка
1. Перейдите по адресу https://fegrem.ru
2. Убедитесь, что сайт загружается
3. Проверьте SSL сертификат (🔒 в адресной строке)
4. Протестируйте регистрацию и чаты

## ⏱️ Сколько времени займет?

- **Подготовка:** 10 минут
- **Деплой на Railway:** 5 минут
- **Настройка домена:** 10-30 минут (зависит от DNS)
- **Полная готовность:** 30 минут - 24 часа

## 🆘 Срочная помощь

Если что-то не работает:

1. **Проверьте логи в Railway** - там будут все ошибки
2. **Убедитесь, что все переменные окружения настроены**
3. **Проверьте App Password в Gmail**
4. **Подождите 24 часа для DNS распространения**

## 🎉 Готово!

Теперь ваш Fegr Messenger работает на fegrem.ru! ✨

---

**Следующие шаги:**
- [ ] Настроить домен
- [ ] Протестировать все функции
- [ ] Пригласить первых пользователей
- [ ] Наслаждаться результатом! 🚀