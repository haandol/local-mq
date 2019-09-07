# Local MQ

simple local message queue using event emitter

# Install

`$npm i local-mq`

# Usage

```
const mq = require('local-mq');

const event = {
  key: 'session.created',
  args: {
    name: 'vincent',
    role: 'prototype.engineer',
  }
}

mq.publish(event);

mq.subscribe('session.#', handler);
mq.subscribe('session.created', handler);
```