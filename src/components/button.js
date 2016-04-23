import React                from 'react';
import PureRenderMixin      from 'react-addons-pure-render-mixin';
import { omit }             from 'lodash';

// ==========================================
// Component
// ==========================================
class Button extends React.Component {
  static propTypes = {
    fText:                  React.PropTypes.bool,
    children:               React.PropTypes.any,
    // all other props are passed through
  };
  static defaultProps = {
    fText:                  false,
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  // ==========================================
  // Render
  // ==========================================
  render() {
    const { fText, onClick } = this.props;
    const otherProps = omit(this.props, PROP_KEYS);
    let out;
    if (fText) {
      out = (
        <span
          {...otherProps}
          style={style.outer}
        >
          {this.props.children}
        </span>
      );
    } else {
      out = (
        <button
          {...otherProps}
          style={style.outer}
        >
          {this.props.children}
        </button>
      );
    }
    return out;
  }
}

// ==========================================
// Styles
// ==========================================
const style = {
  outer: {
    cursor: 'pointer',
  },
};

// ==========================================
// Miscellaneous
// ==========================================
const PROP_KEYS = Object.keys(Button.propTypes);

// ==========================================
// Public API
// ==========================================
export default Button;
