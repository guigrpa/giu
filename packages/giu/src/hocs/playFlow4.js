// @no-flow

import * as React from 'react';
import type { HoverableProps } from '../hocs/hoverable';
import hoverable from '../hocs/hoverable';

type Props = {
  foo: number, // foo is required.
};

class _MyComponent extends React.PureComponent<HoverableProps & Props> {
  static defaultProps = {
    foo: 42, // ...but we have a default prop for foo.
  };
}
const MyComponent = hoverable(_MyComponent);

// So we don't need to include foo.
export const a = () => <MyComponent />;
