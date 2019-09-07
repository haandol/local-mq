import { MQ } from '../mq';

const mq = MQ.getInstance();

console.log(mq.getPatterns('ssf.match.create'));

mq.subscribe('ssf.match.create', async (ev) => {
  console.log('ssf.match.create', ev);
});

mq.subscribe('ssf.match.#', async (ev) => {
  console.log('ssf.match.#', ev);
});

mq.subscribe('ssf.#', async (ev) => {
  console.log('ssf.#', ev);
});

mq.publish({
  key: 'ssf.match.create',
  args: {
    user: 'haandol',
  }
});