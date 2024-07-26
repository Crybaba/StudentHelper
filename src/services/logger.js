const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize } = format;

// Форматирование логов
const myFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
});

// Создание логгера
const logger = createLogger({
    level: 'info',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        colorize(),
        myFormat
    ),
    transports: [
        new transports.Console(), // Логи в консоль
        new transports.File({ filename: 'logs/error.log', level: 'error' }), // Логи ошибок в файл
        new transports.File({ filename: 'logs/combined.log' }) // Все логи в файл
    ],
    exceptionHandlers: [
        new transports.File({ filename: 'logs/exceptions.log' }) // Логи исключений в файл
    ],
    rejectionHandlers: [
        new transports.File({ filename: 'logs/rejections.log' }) // Логи отклоненных промисов в файл
    ]
});

// Экспорт логгера
module.exports = logger;
