// @flow

import React from 'react';
import { omit, merge } from 'timm';
import { COLORS } from '../gral/constants';

// ==========================================
// Component
// ==========================================
/* --
A simple `div` showing a centered message with a large font size.
Ideal for *No matches found*, *Choose one of the options above*,
that kind of thing. Props:
-- */
// -- START_DOCS
type Props = {
  children?: any, // contents to be shown
  style?: Object, // merged with the outermost `div` style
  // All other props are passed through to the `div` element
};
// -- END_DOCS

const FILTERED_PROPS = ['children', 'style'];

class LargeMessage extends React.PureComponent<Props> {
  render() {
    const otherProps = omit(this.props, FILTERED_PROPS);
    return (
      <div
        className="giu-large-message"
        {...otherProps}
        style={style.outer(this.props)}
      >
        {this.props.children}
      </div>
    );
  }
}

// ==========================================
const style = {
  outer: ({ style: baseStyle }) => {
    const out = {
      fontSize: '1.4em',
      fontWeight: 700,
      color: COLORS.dim,
      padding: '0.8em',
      textAlign: 'center',
    };
    return merge(out, baseStyle);
  },
};

// ==========================================
// Public
// ==========================================
export default LargeMessage;
