# openai-websocket-relay

npm init -y
npm install express axios dotenv https winston-daily-rotate-file crypto



3. Удобное управление процессами с PM2
Используйте PM2 для управления приложением:

Запуск приложения:
pm2 start app.js --name app_name

Перезапуск после обновления:
pm2 restart app_name

Логирование:
pm2 logs app_name