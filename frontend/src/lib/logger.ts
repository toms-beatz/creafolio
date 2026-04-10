/**
 * Logger structuré Creafolio — Mantra #4 Fail Fast, Fail Visible
 *
 * En développement : logs colorisés dans la console.
 * En production : logs JSON structurés (compatibles Vercel Logs).
 * Pas de dépendance externe — KISS (Mantra #7).
 */

type LogLevel = "info" | "warn" | "error" | "debug";

type LogContext = Record<string, string | number | boolean | null | undefined>;

interface LogEntry {
  level: LogLevel;
  service: string;
  message: string;
  context: LogContext;
  timestamp: string;
}

function formatLog(entry: LogEntry): string {
  if (process.env.NODE_ENV === "production") {
    return JSON.stringify(entry);
  }

  const colors: Record<LogLevel, string> = {
    info: "\x1b[36m", // cyan
    warn: "\x1b[33m", // yellow
    error: "\x1b[31m", // red
    debug: "\x1b[90m", // gray
  };
  const reset = "\x1b[0m";
  const color = colors[entry.level];

  const contextStr =
    Object.keys(entry.context).length > 0
      ? ` ${JSON.stringify(entry.context)}`
      : "";

  return `${color}[${entry.level.toUpperCase()}]${reset} [${entry.service}] ${entry.message}${contextStr}`;
}

function log(
  level: LogLevel,
  service: string,
  message: string,
  context: LogContext = {},
) {
  // Debug logs désactivés en production
  if (level === "debug" && process.env.NODE_ENV === "production") {
    return;
  }

  const entry: LogEntry = {
    level,
    service,
    message,
    context,
    timestamp: new Date().toISOString(),
  };

  const formatted = formatLog(entry);

  switch (level) {
    case "error":
      console.error(formatted);
      break;
    case "warn":
      console.warn(formatted);
      break;
    default:
      // eslint-disable-next-line no-console
      console.log(formatted);
  }
}

export const logger = {
  info: (service: string, message: string, context?: LogContext) =>
    log("info", service, message, context),
  warn: (service: string, message: string, context?: LogContext) =>
    log("warn", service, message, context),
  error: (service: string, message: string, context?: LogContext) =>
    log("error", service, message, context),
  debug: (service: string, message: string, context?: LogContext) =>
    log("debug", service, message, context),
};
