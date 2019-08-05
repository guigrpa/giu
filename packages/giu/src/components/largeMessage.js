// @flow

import React from 'react';
import { omit } from 'timm';

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
  // All other props are passed through to the `div` element
};
// -- END_DOCS

const FILTERED_PROPS = ['children'];

class LargeMessage extends React.PureComponent<Props> {
  render() {
    const otherProps = omit(this.props, FILTERED_PROPS);
    return (
      <div className="giu-large-message" {...otherProps}>
        {this.props.children}
      </div>
    );
  }
}

// ==========================================
// Public
// ==========================================
export default LargeMessage;
