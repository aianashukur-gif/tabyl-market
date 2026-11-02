# TABYL — доска объявлений

Учебный проект на React + TypeScript + Vite.

## Запуск локально

```bash
npm install
npm run dev
```

Открой адрес, который покажет Vite (обычно http://localhost:5173).

## Проверка сборки

```bash
npm run build
```

Готовая версия появится в папке `dist`.

## Публикация на GitHub Pages

1. Создай публичный репозиторий `tabyl-market`.
2. Загрузи содержимое этой папки в корень репозитория (не саму папку-обёртку).
3. Сделай push в ветку `main`.
4. В Settings → Pages выбери `GitHub Actions` в разделе Build and deployment.
5. Открой Actions и дождись зелёной галочки у workflow.
6. Сайт будет доступен по адресу `https://ТВОЙ-ЛОГИН.github.io/tabyl-market/`.

## API

- GET `https://inai-col1.fishrungames.com/ads` — получить объявления.
- POST `https://inai-col1.fishrungames.com/ads` — отправить объявление через `multipart/form-data`.

В POST отправляются поля `title`, `description`, `price`, `image`. Не добавляй вручную заголовок `Content-Type`: браузер сам установит multipart boundary.

## Технологии

- React
- TypeScript
- Vite
- GitHub Actions
- GitHub Pages

Проект не использует Babel и не требует ветку `gh-pages`.
