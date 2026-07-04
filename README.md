# Sweet Garden — помощник по уходу за растениями

Веб-приложение для ухода за комнатными растениями: справочник с рекомендациями,
личная коллекция без регистрации, избранное и напоминания о поливе и пересадке.

Фронтенд полностью работает автономно на `localStorage` и **готов к подключению
Go-бэкенда** одной переменной окружения — см.
[docs/backend-integration.md](docs/backend-integration.md).

## Стек

- **Vite + React 19 + TypeScript**
- **Tailwind CSS v4 + shadcn/ui**
- **TanStack Query** — единый слой данных
- **React Router** — маршрутизация
- **date-fns** — расчёт напоминаний
- **Web Notifications API** — системные напоминания об уходе

## Быстрый старт

```bash
npm install
npm run dev      # http://localhost:5173
```

По умолчанию данные хранятся в браузере (`VITE_DATA_SOURCE=local`). Бэкенд не нужен.

```bash
npm run build    # прод-сборка + проверка типов
npm run preview  # предпросмотр сборки
```

## Возможности (базовая версия)

- **Справочник** — карточки с поливом, освещением, пересадкой, ядовитостью и
  особенностями ухода; поиск и фильтры.
- **Мои растения** — личная коллекция: ссылка на карточку справочника, дата
  добавления, заметки, персональные интервалы ухода.
- **Избранное** — без регистрации.
- **Напоминания** — список дел «сегодня» в приложении + системные уведомления.

## Архитектура

Компоненты → хуки TanStack Query → `getDataSource()` → `Local` | `Http`.
Весь обмен данными идёт через интерфейс `DataSource`
([src/api/datasource.ts](src/api/datasource.ts)); переключение localStorage ↔ Go
не затрагивает код компонентов.

```
src/
  api/            слой данных: types, DataSource, local + http адаптеры, seed
  hooks/          TanStack Query хуки
  lib/            reminders, notifications, care-хелперы, тема
  components/     UI (shadcn) + PlantCard, CareSpec, Layout, ...
  pages/          Дашборд, Справочник, Карточка, Мои растения, Избранное
docs/             openapi.yaml + гайд по подключению Go
```

## Подключение Go-бэкенда

Контракт — [docs/openapi.yaml](docs/openapi.yaml). Инструкция —
[docs/backend-integration.md](docs/backend-integration.md). Кратко:

```bash
cp .env.example .env.local   # VITE_DATA_SOURCE=http, VITE_API_URL=...
npm run dev
```
