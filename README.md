# Frontend — Мини-приложение «Здоровье семьи»

React SPA для записи на приём, работает в WebView мессенджера MAX.

## Стек

- React 18, TypeScript
- Vite
- Tailwind CSS
- Zustand (state)
- React Router

## Экраны

1. **MainPage** — фильтры (взрослый/ребёнок, филиал, специальность, ФИО)
2. **DoctorsPage** — список врачей
3. **SlotsPage** — календарь + временные слоты
4. **ConfirmPage** — подтверждение записи
5. **SuccessPage** — успех + закрытие WebApp
6. **MyRecordsPage** — мои записи
7. **CancelPage** — отмена записи

## Запуск

```bash
npm install
cp .env.example .env
# Укажите VITE_API_URL=https://your-app.amvera.io/api
npm run dev
```

## Деплой на Vercel

Push в GitHub — автоматический деплой. `vercel.json` настроен для SPA rewrites.

## MAX Bridge

Мини-приложение использует MAX Bridge (`https://max.ru/bridge.js`) для:
- `WebApp.ready()` — сигнал о готовности
- `WebApp.close()` — закрытие приложения
