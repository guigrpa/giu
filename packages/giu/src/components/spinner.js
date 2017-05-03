// @flow

import React from 'react';
import Icon, { SPINNER_ICON } from './icon';

// ==========================================
// Component
// ==========================================
class Spinner extends React.PureComponent {
  props: Object;
  render() {
    return <Icon icon={SPINNER_ICON} {...this.props} />;
  }
}

// ==========================================
// Public API
// ==========================================
export default Spinner;
