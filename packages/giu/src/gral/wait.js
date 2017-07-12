// @flow

// ==========================================
// Waiting...
// ==========================================
const WAIT_INTERVAL = 25;
const waiters = {};

/* --
**delay()**

Waits for a given number of milliseconds.

* **delay** *number*: delay [ms]
* **Returns** *Promise<void>*: resolves when the delay expires.
-- */
const delay = (ms: number) =>
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });

/* --
**waitUntil()**

Waits until a given condition is true, or until time runs out.

* **cb** *() => boolean*: predicate
* **timeout?** *number*: maximum wait time [ms]
* **waiterId?** *string*: an ID for who's waiting (can be checked with `isWaiting()`)
* **Returns** *Promise<void>*: resolves when the delay expires. Otherwise,
  the function throws a `TIME_OUT` exception
-- */
const waitUntil = async (
  cb: () => boolean,
  timeout: number = Infinity,
  waiterId: ?string
) => {
  let t = 0;
  if (cb()) return;
  if (waiterId != null) waiters[waiterId] = true;
  while (t < timeout) {
    await delay(WAIT_INTERVAL);
    if (cb()) {
      if (waiterId != null) delete waiters[waiterId];
      return;
    }
    t += WAIT_INTERVAL;
  }
  if (waiterId != null) delete waiters[waiterId];
  throw new Error('TIME_OUT');
};

/* --
**isWaiting()**

Returns whether a given (or any) waiter is waiting on `waitUntil()`.

* **waiterId?** *string*: an ID for who's waiting (leave empty for *all*)
* **Returns** *boolean*: whether the specified waiter (or anybody) is waiting
  on `waitUntil()`
-- */
const isWaiting = (waiterId?: string) => {
  if (waiterId != null) return waiters[waiterId];
  return Object.keys(waiters).length !== 0;
};

// ==========================================
// Public API
// ==========================================
export { delay, waitUntil, isWaiting };
