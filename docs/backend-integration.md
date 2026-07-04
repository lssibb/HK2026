# Подключение Go-бэкенда

Фронтенд работает поверх абстракции `DataSource` ([src/api/datasource.ts](../src/api/datasource.ts)).
Есть две реализации:

| Реализация       | Файл                                  | Хранилище      |
| ---------------- | ------------------------------------- | -------------- |
| `LocalDataSource`| `src/api/local/localDataSource.ts`    | `localStorage` |
| `HttpDataSource` | `src/api/http/httpDataSource.ts`      | Go REST API    |

Компоненты о них не знают — они ходят через хуки TanStack Query. **Переключение
на бэкенд = одна переменная окружения, код фронта не меняется.**

## Как включить бэкенд

```bash
cp .env.example .env.local
# в .env.local:
VITE_DATA_SOURCE=http
VITE_API_URL=http://localhost:8080
```

`VITE_API_URL` можно оставить пустым — тогда фронт ходит на same-origin `/api`
(в dev это проксируется на бэкенд через [vite.config.ts](../vite.config.ts), в
проде — если Go отдаёт собранный SPA сам).

## Контракт

Полный контракт — [docs/openapi.yaml](./openapi.yaml). Схемы 1:1 повторяют
[src/api/types.ts](../src/api/types.ts). Все пути под префиксом `/api`.

| Метод  | Путь                          | Тело            | Ответ         |
| ------ | ----------------------------- | --------------- | ------------- |
| GET    | `/api/plants`                 | —               | `Plant[]`     |
| GET    | `/api/plants/{id}`            | —               | `Plant`       |
| GET    | `/api/favorites`              | —               | `string[]` (id растений) |
| POST   | `/api/favorites`              | `{ plantId }`   | `204`         |
| DELETE | `/api/favorites/{plantId}`    | —               | `204`         |
| GET    | `/api/user-plants`            | —               | `UserPlant[]` |
| GET    | `/api/user-plants/{id}`       | —               | `UserPlant`   |
| POST   | `/api/user-plants`            | `AddUserPlantInput`    | `UserPlant` (201) |
| PATCH  | `/api/user-plants/{id}`       | `UpdateUserPlantInput` | `UserPlant`  |
| DELETE | `/api/user-plants/{id}`       | —               | `204`         |
| POST   | `/api/user-plants/{id}/water` | `{ at? }`       | `UserPlant`   |
| POST   | `/api/user-plants/{id}/repot` | `{ at? }`       | `UserPlant`   |

### Обмен растениями (усложнение)

| Метод  | Путь                                    | Тело                 | Ответ                |
| ------ | --------------------------------------- | -------------------- | -------------------- |
| GET    | `/api/exchange/listings`                | —                    | `ExchangeListing[]`  |
| POST   | `/api/exchange/listings`                | `CreateListingInput` | `ExchangeListing` (201) |
| GET    | `/api/exchange/listings/{id}`           | —                    | `ExchangeListing`    |
| PATCH  | `/api/exchange/listings/{id}`           | `UpdateListingInput` | `ExchangeListing`    |
| DELETE | `/api/exchange/listings/{id}`           | —                    | `204`                |
| GET    | `/api/exchange/listings/{id}/messages`  | —                    | `ExchangeMessage[]`  |
| POST   | `/api/exchange/listings/{id}/messages`  | `{ text }`           | `ExchangeMessage` (201) |

- `ownerId`/`authorId` = `"me"` для текущего пользователя (в базе аккаунтов нет —
  привяжите к сессии/анонимному id, как и остальные пользовательские данные).
- Демо-объявления для локальной версии — [src/api/seed/exchange.seed.json](../src/api/seed/exchange.seed.json);
  на бэке они не нужны, доска наполняется реальными объявлениями.
- Чат в базовой версии — обычный REST (polling). Для живого чата позже можно
  добавить WebSocket/SSE, фронтовый контракт (`ChatPanel`) при этом не меняется.

### Рекомендации (усложнение)

Считаются **на клиенте** из коллекции + избранного + справочника
([src/lib/recommend.ts](../src/lib/recommend.ts)) — отдельный эндпоинт не нужен.
Если позже понадобится серверная рекомендательная система (ML/коллаборативная
фильтрация), добавьте `GET /api/recommendations` → `Plant[]` и переключите
дашборд на него; текущая логика останется фолбэком.

### Распознавание по фото (усложнение)

| Метод | Путь             | Тело                           | Ответ                     |
| ----- | ---------------- | ------------------------------ | ------------------------- |
| POST  | `/api/recognize` | `multipart/form-data`, поле `image` | `RecognitionCandidate[]` |

`RecognitionCandidate = { plantId, confidence: 0..1 }`, лучший первым; `plantId`
должен ссылаться на растение справочника. Фронт абстрагирует распознавание за
интерфейсом `PlantRecognizer` ([src/api/recognize/recognizer.ts](../src/api/recognize/recognizer.ts)):
- `LocalRecognizer` — демо-эвристика по цвету изображения в браузере (сейчас);
- `HttpRecognizer` — `multipart POST /api/recognize` (включается `VITE_DATA_SOURCE=http`).

На бэке подключите модель или внешний сервис (например, Plant.id / PlantNet /
своя CV-модель), верните top-N кандидатов — UI распознавания не изменится.

Ошибки — JSON `{ "error": "текст" }` с соответствующим кодом (фронт читает поле
`error`, см. [src/api/http/client.ts](../src/api/http/client.ts)).

### Генерация Go-кода из контракта

```bash
go install github.com/oapi-codegen/oapi-codegen/v2/cmd/oapi-codegen@latest
oapi-codegen -generate types,chi-server -package api docs/openapi.yaml > internal/api/api.gen.go
```

## Наполнение справочника

Справочник уже собран — [src/api/seed/plants.seed.json](../src/api/seed/plants.seed.json)
(14 растений со всеми полями `Plant`). Импортируйте его в БД при первом запуске
(seed/миграция), и `GET /api/plants` будет отдавать те же данные, что видит
локальная версия. JSON намеренно совпадает со схемой `Plant`.

## Что важно учесть

- **Задачи по уходу не хранятся.** `CareTask` вычисляется на клиенте из
  `UserPlant` + интервалов ([src/lib/reminders.ts](../src/lib/reminders.ts)).
  Таблица задач на бэке не нужна — достаточно отдавать `UserPlant` с полями
  `lastWateredAt` / `lastRepottedAt`, которые обновляют эндпоинты `water`/`repot`.
- **`water`/`repot`** просто проставляют соответствующую метку времени
  (`at` из тела или `now()`) и возвращают обновлённый `UserPlant`.
- **Идентификация пользователя.** В базовой версии аккаунтов нет. На бэке
  привяжите данные к сессии/анонимному идентификатору (cookie) — фронт токенов
  не шлёт. Когда появится аутентификация (усложнение из ТЗ), достаточно
  добавить заголовок в `client.ts`.
- **Даты** — ISO 8601 (`time.RFC3339`).
- **CORS.** В dev CORS не нужен (Vite проксирует `/api`). Если бэкенд и фронт в
  проде на разных origin — включите CORS для `VITE_API_URL`. Проще всего отдавать
  собранный `dist/` тем же Go-сервером — тогда всё same-origin.

## Проверить связку

1. Поднимите Go на `:8080`, реализующий контракт.
2. `VITE_DATA_SOURCE=http` в `.env.local`.
3. `npm run dev` → приложение работает поверх бэкенда. Ни один компонент при
   этом не меняется.
