import React                from 'react';
import PureRenderMixin      from 'react-addons-pure-render-mixin';
import { COLORS }           from '../gral/constants';

// ==========================================
// Component
// ==========================================
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
