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
// -- * **children** *any*: the contents to be shown
// -- * **style** *object?*: merged with the outermost `div` style
// -- * *All other props are passed through to the `div` element*
class LargeMessage extends React.PureComponent {
  static propTypes = {
    children:               React.PropTypes.any,
    style:                  React.PropTypes.object,
  };

  render() {
    const otherProps = omit(this.props, PROP_KEYS);
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
// Miscellaneous
// ==========================================
const PROP_KEYS = Object.keys(LargeMessage.propTypes);

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
