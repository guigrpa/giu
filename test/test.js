import test from 'ava';
import * as m from '../lib/es5/index';

test('foo', t => {
  t.same(m.foo(2), 4);
});
