import React                from 'react';
import PureRenderMixin      from 'react-addons-pure-render-mixin';
import { omit }             from 'lodash';

// ==========================================
// Component
// ==========================================
class Button extends React.Component {
  static propTypes = {
    plain:                  React.PropTypes.bool,
    children:               React.PropTypes.any,
    // all other props are passed through
  };
  static defaultProps = {
    plain:                  false,
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  // ==========================================
  // Render
  // ==========================================
  render() {
    const { plain, children } = this.props;
    const otherProps = omit(this.props, PROP_KEYS);
    return plain
      ? this.renderPlain(otherProps, children)
      : this.renderButton(otherProps, children);
  }

  renderPlain(props, children) {
    return (
      <span
        {...props}
        style={style.outer}
      >
        {children}
      </span>
    );
  }

  renderButton(props, children) {
    return (
      <button
        {...props}
        style={style.outer}
      >
        {children}
      </button>
    );
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
