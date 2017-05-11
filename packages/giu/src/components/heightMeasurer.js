// @flow

import React from 'react';
import throttle from 'lodash/throttle';

// ================================================
// Component
// ================================================
// HeightMeasurer MUST BE the direct child of an element with an "extrinsic"
// height (ie. a height that is not determined by its children, but rather
// by its parents, e.g. a flex item with "overflow: hidden")
class HeightMeasurer extends React.Component {
  props: {
    children: Function, // function-as-a-child
  };
  state: {
    height: ?number,
  };
  refOuter: ?Object;
  throttledRecalcHeight: Function;

  constructor() {
    super();
    this.state = { height: undefined };
    this.throttledRecalcHeight = throttle(this.recalcHeight, 100);
  }

  componentDidMount() {
    window.addEventListener('resize', this.throttledRecalcHeight);
    this.recalcHeight();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.throttledRecalcHeight);
  }

  recalcHeight = () => {
    const node = this.refOuter;
    if (node) this.setState({ height: node.parentNode.clientHeight });
  };

  render() {
    const { children: child } = this.props;
    return (
      <div
        ref={c => {
          this.refOuter = c;
        }}
      >
        {child(this.state.height)}
      </div>
    );
  }
}

// ================================================
// Public
// ================================================
export default HeightMeasurer;
