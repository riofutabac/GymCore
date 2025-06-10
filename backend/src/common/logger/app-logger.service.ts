import { Injectable, LoggerService, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class AppLoggerService implements LoggerService {
  private context?: string;

  constructor() {}

  setContext(context: string) {
    this.context = context;
    return this;
  }

  log(
    level: 'LOG' | 'ERROR' | 'WARN' | 'DEBUG' | 'VERBOSE',
    message: string | object,
    context?: string,
  ): void {
    const timestamp = new Date().toISOString();
    const formattedMessage = typeof message === 'object' ? JSON.stringify(message) : message;

    // Estructura de log para posible uso futuro - comentado para evitar warning de variable no usada
    /*
    const logEntry = {
      timestamp,
      level,
      message: formattedMessage,
      context: context || this.context,
    };
    */
    
    // Formatear el mensaje para la consola
    let consoleMessage = `${timestamp} [${level}]`;
    if (context || this.context) {
      consoleMessage += ` [${context || this.context}]`;
    }
    consoleMessage += `: ${formattedMessage}`;
    
    // Usar el método de consola apropiado según el nivel
    switch (level) {
      case 'ERROR':
        console.error(consoleMessage);
        break;
      case 'WARN':
        console.warn(consoleMessage);
        break;
      case 'DEBUG':
        console.debug(consoleMessage);
        break;
      case 'VERBOSE':
        console.trace(consoleMessage);
        break;
      case 'LOG':
      default:
        console.log(consoleMessage);
        break;
    }
    
    // Aquí se podría implementar la lógica para guardar los logs en un archivo o enviarlos a un servicio externo
  }

  error(
    message: string | Error | object,
    trace?: string,
    context?: string,
  ): void {
    let errorMessage: string;
    let stack: string | undefined;

    if (message instanceof Error) {
      errorMessage = message.message;
      stack = message.stack;
    } else if (typeof message === 'object') {
      try {
        errorMessage = JSON.stringify(message);
      } catch {
        errorMessage = '[Object]';
      }
    } else {
      errorMessage = message;
    }

    this.log('ERROR', errorMessage, context);
    if (stack || trace) {
      console.error(stack || trace);
    }
  }

  warn(message: string | object, context?: string): void {
    this.log('WARN', message, context);
  }

  debug(message: string | object, context?: string): void {
    this.log('DEBUG', message, context);
  }

  verbose(message: string | object, context?: string): void {
    this.log('VERBOSE', message, context);
  }

  private formatMessage(message: unknown): string {
    if (message === null) {
      return 'null';
    }

    if (typeof message === 'object') {
      try {
        // Intentar convertir el objeto a JSON de forma segura
        return JSON.stringify(message, null, 2);
      } catch {
        // Error al convertir el objeto a JSON
        return '[Object no serializable]';
      }
    }
    return String(message);
  }
}
