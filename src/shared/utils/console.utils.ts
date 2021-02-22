import { TimeUtils } from './time.utils';

export class ConsoleUtils {
  static timeLog(...args) {
    args.unshift(TimeUtils.getCurrUniDateTimeMs() + ' ');
    console.log.apply(this, args);
  }
}
