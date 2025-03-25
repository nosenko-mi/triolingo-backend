# Aigle Backend

## Опис
Aigle - це серверний застосунок на Node.js з використанням TypeScript і Express, а також бази даних MySQL через TypeORM.

## Вимоги
Перед запуском переконайтеся, що у вас встановлено:
- Node.js (рекомендована версія 22+)
- MySQL

## Встановлення
1. Склонуйте репозиторій:
```bash
git clone https://github.com/your-repo/aigle.git
cd aigle
```
2. Встановіть залежності: ```npm install```.
3. Створіть файл ```.env``` у корені проєкту і додайте необхідні змінні оточення, наприклад:
```
TYPEORM_HOST=127.0.0.1
TYPEORM_PORT=3306
TYPEORM_USERNAME=root
TYPEORM_PASSWORD=password
TYPEORM_DATABASE=aigle
TYPEORM_SYNCHRONIZE=false
TYPEORM_LOGGING=false

JWT_SECRET=my-super-secret
```

## Запуск проекту
У режимі розробки ```npm run dev```

У режимі продакшн ```npm run start```

## Тестування
Запуск тестів: ```npm test```

Запуск тестів у режимі спостереження: ```npm run test:watch```

## Лінтинг
Перевірка коду: ```npm run lint```

Автовиправлення помилок: ```npm run lint:fix```.

Додаткова інформація

- Використовується TypeORM для роботи з базою даних.
- Використовується Jest для тестування.
- Фреймворк Express для побудови API.
