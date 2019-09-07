import sinon from 'sinon';
import assert from 'assert';
import { MQ } from '../mq';

const mq = MQ.getInstance();

describe("generate wildcard patterns using key", () => {
  it("1 depth", () => {
    const key = 'match';
    assert.deepEqual([key], mq.getPatterns(key));
  });

  it("2 depths", () => {
    const key = 'chat.channel';
    assert.deepEqual([key, 'chat.#'], mq.getPatterns(key));
  });

  it("3 depths", () => {
    const key = 'chat.channel.join';
    assert.deepEqual([key, 'chat.channel.#', 'chat.#'], mq.getPatterns(key));
  });
});

describe("publish", () => {
  afterEach(() => {
    mq.reset();
  });

  it("publish without consumer", async() => {
    const ev = {
      key: 'channel.joined',
      args: {
        chId: 83,
        user: 'vincent',
      }
    }
    assert.equal(undefined, mq.queue[ev.key]);

    mq.publish(ev);
    assert.equal(1, mq.queue[ev.key].length);

    mq.publish(ev);
    assert.equal(2, mq.queue[ev.key].length);
  });
});

describe("subscribe", () => {
  afterEach(() => {
    mq.reset();
  });

  it("subscribe without wildcard", async() => {
    const key = 'session.created';
    assert.equal(0, Object.keys(mq.queue).length);
    assert.equal(undefined, mq.queue[key]);

    mq.subscribe(key, async(ev) => console.log(ev));

    assert.deepEqual([], mq.queue[key]);
    assert.equal(1, Object.keys(mq.queue).length);
  });

  it("subscribe with wildcard", async() => {
    const key = 'session.#';
    assert.equal(0, Object.keys(mq.queue).length);
    assert.equal(undefined, mq.queue[key]);

    mq.subscribe(key, async(ev) => console.log(ev));

    assert.deepEqual([], mq.queue[key]);
    assert.equal(1, Object.keys(mq.queue).length);
  });
});

describe("pub/sub", () => {
  afterEach(() => {
    mq.reset();
  });

  it("pub/sub key without wildcard", async() => {
    const spyHandler = sinon.spy();
    mq.subscribe('session.created', async(ev) => spyHandler(ev));
    mq.publish({
      key: 'session.created',
      args: {
        user: 'haandol',
      }
    });
    assert.equal(1, spyHandler.callCount);

    mq.publish({
      key: 'session.expired',
      args: {
        user: 'haandol',
      }
    });
    assert.equal(1, spyHandler.callCount);
  });

  it("pub/sub key with wildcard", async() => {
    const spyHandler = sinon.spy();
    mq.subscribe('session.#', async(ev) => spyHandler(ev));
    mq.publish({
      key: 'session.created',
      args: {
        user: 'haandol',
      }
    });
    assert.equal(1, spyHandler.callCount);

    mq.publish({
      key: 'session.expired',
      args: {
        user: 'haandol',
      }
    });
    assert.equal(2, spyHandler.callCount);
  });

  it("msg pub before sub will be processed eventually", async() => {
    const wildcardKey = 'session.#';

    mq.publish({
      key: 'session.created',
      args: {
        user: 'haandol',
      }
    });
    assert.equal(1, mq.queue[wildcardKey].length);

    mq.publish({
      key: 'session.expired',
      args: {
        user: 'haandol',
      }
    });
    assert.equal(2, mq.queue[wildcardKey].length);

    const spyHandler = sinon.spy();
    mq.subscribe(wildcardKey, async(ev) => spyHandler(ev));
    assert.equal(2, spyHandler.callCount);
  });

});