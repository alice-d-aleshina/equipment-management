# Решение проблем с совместимостью React 19 и зависимостей

## Проблема 1: Конфликт версий React

При сборке Docker-образа возникает ошибка:

```
npm error While resolving: react-qr-scanner@1.0.0-alpha.11
npm error Found: react@19.1.0
...
npm error Could not resolve dependency:
npm error peer react@"^17.0.0 || ^18.0.0" from react-qr-scanner@1.0.0-alpha.11
```

Причина: пакет `react-qr-scanner` версии 1.0.0-alpha.11 совместим только с React 17 или 18, 
но в проекте используется React 19.

### Решение 1.1: Использовать флаг --legacy-peer-deps

Это самое простое решение, позволяющее игнорировать конфликты зависимостей. 
Оно уже применено в Dockerfile и docker-compose.yml:

```bash
npm ci --legacy-peer-deps
```

**Предупреждение**: Это может привести к скрытым проблемам совместимости.

### Решение 1.2: Заменить react-qr-scanner на современную альтернативу

Рекомендуемый подход — заменить устаревшую библиотеку:

1. Удалить зависимость react-qr-scanner:
```bash
npm uninstall react-qr-scanner
```

2. Установить современную альтернативу:
```bash
npm install @yudiel/react-qr-scanner
```

3. Обновить код, использующий QR-сканер:

```jsx
// Старый импорт
// import QrReader from 'react-qr-scanner'

// Новый импорт
import { QrScanner } from '@yudiel/react-qr-scanner'

// Использование нового компонента
const YourComponent = () => {
  return (
    <QrScanner
      onDecode={(result) => console.log(result)}
      onError={(error) => console.log(error?.message)}
    />
  )
}
```

### Решение 1.3: Понизить версию React до 18

Если вам важно сохранить совместимость с `react-qr-scanner`:

```bash
npm install react@18 react-dom@18
```

## Проблема 2: Отсутствуют переменные окружения Supabase

При сборке появляется ошибка:

```
Error: Missing Supabase environment variables
```

### Решение 2.1: Создать файл .env с переменными Supabase

1. Скопируйте файл `.env.example` в `.env`:

```bash
cp .env.example .env
```

2. Отредактируйте `.env`, указав реальные значения для Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=https://ваш-проект.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш-публичный-ключ
SUPABASE_SERVICE_ROLE_KEY=ваш-секретный-ключ
```

3. Перезапустите сборку Docker:

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### Решение 2.2: Передать переменные окружения напрямую

Если вы не хотите использовать файл `.env`, можно передать переменные напрямую:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://ваш-проект.supabase.co \
NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш-публичный-ключ \
SUPABASE_SERVICE_ROLE_KEY=ваш-секретный-ключ \
docker-compose up -d
```

### Решение 2.3: Передать переменные окружения на этапе сборки Docker

Проблема может возникать из-за того, что переменные окружения не доступны во время сборки.
Для решения:

1. Добавьте в docker-compose.yml передачу переменных в секцию args:

```yaml
build:
  context: .
  dockerfile: Dockerfile
  args:
    - NEXT_PUBLIC_SUPABASE_URL=ваш-url
    - NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш-ключ
    - SUPABASE_SERVICE_ROLE_KEY=ваш-ключ
```

2. Обновите Dockerfile, чтобы использовать эти аргументы:

```dockerfile
FROM base AS builder
WORKDIR /app

# Копируем .env для сборки
COPY .env ./

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Получение переменных окружения во время сборки
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG SUPABASE_SERVICE_ROLE_KEY

RUN npm run build
```

3. Перестройте Docker образ:

```bash
docker-compose build --no-cache
docker-compose up
```

## Тестирование после изменений

После внесения любого из этих изменений перестройте Docker-образ:

```bash
docker-compose build --no-cache
docker-compose up
``` 