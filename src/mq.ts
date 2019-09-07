import { EventEmitter } from 'events';
import { logger } from './logger';

const SEP = '.';

interface IEvent {
  key: string;
  args: any;
}

export class MQ {
  static _instance: MQ;
  broker: EventEmitter;
  queue: {[key: string]: IEvent[]};

  static getInstance(): MQ {
    if (MQ._instance) return MQ._instance;

    MQ._instance = new MQ();
    return MQ._instance;
  }

  constructor() {
    this.queue = {};
    this.broker = new EventEmitter();
  }

  getPatterns(s: string): string[] {
    const result = [s];

    let endIndex = s.lastIndexOf(SEP);
    while (0 < endIndex) {
      const subs = s.slice(0, endIndex);
      result.push(`${subs}.#`);
      endIndex = subs.lastIndexOf(SEP);
    }

    return result;
  }

  publish(ev: IEvent): void {
    const patterns = this.getPatterns(ev.key);
    patterns.forEach(key => {
      if (!this.queue[key]) {
        this.queue[key] = [];
      }

      this.queue[key].push(ev);
      this.broker.emit(key);
    });
  }

  subscribe(key: string, handler: (ev: IEvent) => Promise<void>): void {
    this.broker.on(key, () => {
      if (!this.queue[key]) {
        this.queue[key] = [];
      }

      const ev = this.queue[key].shift();
      if (!ev) {
        logger.error('empty eventQ');
        return;
      }

      handler(ev).catch(e => {
        logger.error(e);
        throw e;
      });
    });
  }
}