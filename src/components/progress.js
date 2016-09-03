import React                from 'react';
import { omit }             from 'timm';

// ==========================================
// Component
// ==========================================
// -- A wrapper for the native HTML `progress` element (with 100% width).
// -- *All props are passed through to the `progress` element.
// -- Remember that an indeterminate progress bar will be shown if you
// -- don't specify the `value` prop (native HTML behaviour).*
class Progress extends React.PureComponent {
  static propTypes = {
    // all other props are passed through
  };

  render() {
    const otherProps = omit(this.props, PROP_KEYS);
    return <progress {...otherProps} style={style.progress} />;
  }
}

// ==========================================
// Styles
// ==========================================
const style = {
  progress: {
    width: '100%',
  },
};

// ==========================================
// Miscellaneous
// ==========================================
const PROP_KEYS = Object.keys(Progress.propTypes);

// ==========================================
// Public API
// ==========================================
export default Progress;
