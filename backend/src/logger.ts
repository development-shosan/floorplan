/**
 * logger.ts
 *
 * Winston logger configuration file.
 *
 * Default log levels (npm levels):
 *
 *   error:   0  - Used for error messages
 *   warn:    1  - Used for warnings
 *   info:    2  - Used for general information
 *   http:    3  - Used for HTTP-related logs
 *   verbose: 4  - Used for verbose logging
 *   debug:   5  - Used for debugging information
 *   silly:   6  - Used for very detailed, usually unnecessary logs
 *
 */
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
                maxFiles: 30, // Keep log files for up to 30 days. Older files will be automatically deleted.
                zippedArchive: true // Compress archived log files using gzip (.gz) to save disk space.
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
                level: 'debug',
                format: winston.format.combine(winston.format.colorize({ all: true }))
            })
        );
    }
    return logger;
};
