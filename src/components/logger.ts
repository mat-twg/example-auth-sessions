import { LoggerService } from '@nestjs/common';
import * as process from 'process';
import * as util from 'util';
import * as colors from '@nestjs/common/utils/cli-colors.util';

const colorsBright = {
  gray: (text: string) => `\x1b[90m${text}\x1b[0m`,
  redBright: (text: string) => `\x1b[91m${text}\x1b[0m`,
  greenBright: (text: string) => `\x1b[92m${text}\x1b[0m`,
  yellowBright: (text: string) => `\x1b[93m${text}\x1b[0m`,
  blueBright: (text: string) => `\x1b[94m${text}\x1b[0m`,
  magentaBright: (text: string) => `\x1b[95m${text}\x1b[0m`,
  cyanBright: (text: string) => `\x1b[96m${text}\x1b[0m`,
  whiteBright: (text: string) => `\x1b[97m${text}\x1b[0m`,
};

export const clc = { ...colors.clc, ...colorsBright };

export class Logger implements LoggerService {
  constructor(private readonly context?: string) {}

  static prefix(): string {
    return (
      clc.green(`[${process.env.SERVICE_NAME}]`) +
      clc.gray(` ${new Date().toISOString()}`)
    );
  }

  private pre(level: string): string[] {
    return [
      Logger.prefix(),
      level,
      this.context ? clc.yellow(`[${this.context}]`) : null,
    ].filter((param) => param !== null);
  }

  log(message: any, ...optionalParams: any[]) {
    console.log(
      ...this.pre(clc.bold(clc.green('LOG'))),
      ...optionalParams.map((param) => clc.yellow(`[${param}]`)),
      clc.green(message),
    );
  }

  info(message: any, ...optionalParams: any[]): void {
    console.info(
      ...this.pre(clc.bold(clc.cyanBright('INFO'))),
      ...optionalParams.map((param) => clc.yellow(`[${param}]`)),
      message,
    );
  }

  error(message: any, ...optionalParams: any[]) {
    console.error(
      ...this.pre(clc.bold(clc.red('ERROR'))),
      ...optionalParams.map((param) => clc.yellow(`[${param}]`)),
      clc.redBright(message),
    );
  }

  warn(message: any, ...optionalParams: any[]) {
    console.warn(
      ...this.pre(clc.bold(clc.yellow('WARN'))),
      ...optionalParams.map((param) => clc.yellow(`[${param}]`)),
      clc.yellowBright(message),
    );
  }

  debug(message: any, ...optionalParams: any[]) {
    if (process.env.DEBUG !== 'true') {
      return;
    }
    console.debug(
      ...this.pre(clc.bold(clc.magentaBright('DEBUG'))),
      ...optionalParams.map((param) => clc.yellow(`[${param}]`)),
      util.inspect(message, false, null, true),
    );
  }

  verbose(message: any, ...optionalParams: any[]) {
    console.log(
      ...this.pre(clc.bold(clc.cyanBright('VERBOSE'))),
      ...optionalParams.map((param) => clc.yellow(`[${param}]`)),
      message,
    );
  }

  custom(level: string, message: any, ...optionalParams: any[]) {
    console.log(
      ...this.pre(clc.bold(level)),
      ...optionalParams.map((param) => clc.yellow(`[${param}]`)),
      message,
    );
  }
}
