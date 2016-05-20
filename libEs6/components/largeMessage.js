import React                from 'react';
import PureRenderMixin      from 'react-addons-pure-render-mixin';
import { COLORS }           from '../gral/constants';

// ==========================================
// Component
// ==========================================
// -- A simple `div` showing a centered message with a large font size.
// -- Ideal for *No matches found*, *Choose one of the options above*,
// -- that kind of thing.
// --
// -- * **children** *any*: the contents to be shown
class LargeMessage extends React.Component {
  static propTypes = {
    children:               React.PropTypes.any,
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    return (
      <div
        className="giu-large-message"
        style={style.outer}
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
  outer: {
    fontSize: '1.4em',
    fontWeight: 700,
    color: COLORS.dim,
    padding: '0.8em',
    textAlign: 'center',
  },
};

// ==========================================
// Public API
// ==========================================
export default LargeMessage;
