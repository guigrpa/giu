// @flow

import React                from 'react';

// ==========================================
// Component
// ==========================================
// -- A wrapper for the native HTML `progress` element (with 100% width).
// -- *All props are passed through to the `progress` element.
// -- Remember that an indeterminate progress bar will be shown if you
// -- don't specify the `value` prop (native HTML behaviour).*
class Progress extends React.PureComponent {
  props: Object;
  render() {
    return <progress {...this.props} style={style.progress} />;
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
// Public API
// ==========================================
export default Progress;
