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
    if (!s || s.length === 0) return [];

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
    for (const key of this.getPatterns(ev.key)) {
      if (!this.queue[key]) {
        this.queue[key] = [];
      }

      this.queue[key].push(ev);
      this.broker.emit(key);
    }
  }

  subscribe(key: string, handler: (ev: IEvent) => Promise<void>): void {
    if (!this.queue[key]) {
      this.queue[key] = [];
    }

    this.broker.on(key, async() => {
      if (0 === this.queue[key].length) return;

      const ev = this.queue[key].shift();
      if (!ev) return;

      try {
        await handler(ev);
      } catch (e) {
        logger.error(e);
        throw e;
      }
    });

    // recv remaining messages
    for (let i = 0; i < this.queue[key].length; i++) {
      setTimeout(() => this.broker.emit(key), 0);
    };
  }

  reset(): void {
    for (const key in this.queue) {
      this.queue[key] = [];
    }
    this.queue = {};
    this.broker.removeAllListeners();
  }
}