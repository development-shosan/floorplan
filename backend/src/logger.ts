import winston from 'winston';
import winstonDaily from 'winston-daily-rotate-file';
import process from 'process';

// Log file output directory
const logDir = `${process.cwd()}/logs`;

const { combine, timestamp, label, printf } = winston.format;

const logFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] [${level.toUpperCase()}]: ${message}`;
});

export const createLogger = (fileName: string) => {
    const logger = winston.createLogger({
        format: combine(
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            label({ label: fileName }),
            logFormat
        ),

        transports: [
            new winstonDaily({
                level: 'info',
                datePattern: 'YYYY-MM-DD',
                dirname: logDir,
                filename: `%DATE%.log`,
                maxFiles: 30,
                zippedArchive: true
            }),

            new winstonDaily({
                level: 'error',
                datePattern: 'YYYY-MM-DD',
                dirname: logDir + '/error',
                filename: `%DATE%.error.log`,
                maxFiles: 30,
                zippedArchive: true
            })
        ]
    });

    if (process.env.NODE_ENV !== 'production') {
        logger.add(
            new winston.transports.Console({
                format: winston.format.combine(winston.format.colorize({ all: true }))
            })
        );
    }
    return logger;
};
