// @flow

import React from 'react';
import throttle from 'lodash/throttle';

// ================================================
// Declarations
// ================================================
type Props = {
  children: Function, // function-as-a-child
};
type State = {
  height: ?number,
};

// ================================================
// Component
// ================================================
// HeightMeasurer MUST BE the direct child of an element with an "extrinsic"
// height (ie. a height that is not determined by its children, but rather
// by its parents, e.g. a flex item with "overflow: hidden")
class HeightMeasurer extends React.Component<Props, State> {
  state = { height: undefined };
  refOuter = React.createRef();

  componentDidMount() {
    window.addEventListener('resize', this.throttledRecalcHeight);
    this.recalcHeight();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.throttledRecalcHeight);
  }

  recalcHeight = () => {
    const node = this.refOuter.current;
    if (!node) return;
    this.setState({ height: node.parentNode.clientHeight });
  };
  throttledRecalcHeight = throttle(this.recalcHeight, 100);

  // ================================================
  render() {
    const { children: child } = this.props;
    return <div ref={this.refOuter}>{child(this.state.height)}</div>;
  }
}

// ================================================
// Public
// ================================================
export default HeightMeasurer;
