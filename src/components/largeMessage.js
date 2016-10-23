// @flow

import React                from 'react';
import { omit, merge }      from 'timm';
import { COLORS }           from '../gral/constants';

// ==========================================
// Component
// ==========================================
// -- A simple `div` showing a centered message with a large font size.
// -- Ideal for *No matches found*, *Choose one of the options above*,
// -- that kind of thing. Props:
// --
// -- * **children?** *any*: the contents to be shown
// -- * **style?** *Object*: merged with the outermost `div` style
// -- * *All other props are passed through to the `div` element*
type PropsT = {
  children?: any,
  style?: Object,
  // all other props are passed through
};
const FILTERED_PROPS = ['children', 'style'];

class LargeMessage extends React.PureComponent {
  props: PropsT;

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
// Styles
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
// Public API
// ==========================================
export default LargeMessage;
