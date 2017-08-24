// @flow

import * as React from 'react';
import Icon, { SPINNER_ICON } from './icon';

// ==========================================
// Component
// ==========================================
class Spinner extends React.PureComponent<Object> {
  render() {
    return <Icon icon={SPINNER_ICON} {...this.props} />;
  }
}

// ==========================================
// Public API
// ==========================================
export default Spinner;
