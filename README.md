# Local MQ

simple local message queue using event emitter.

you can use this library for mocking mqtt or rabbitmq.

# Install

`$npm i local-mq`

# Usage

1. import library
2. call `getInstance()`
3. call `subscribe`, `publish`

```
const localMQ = require('local-mq');

const mq = localMQ.getInstance();

const event = {
  key: 'session.created',
  args: {
    name: 'vincent',
    role: 'prototype.engineer',
  }
}

mq.subscribe('session.#', async (ev) => console.log(ev));
mq.subscribe('session.created', async (ev) => console.log(ev));

mq.publish(event);
```