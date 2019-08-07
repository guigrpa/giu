// @flow

import React from 'react';
import Icon, { SPINNER_ICON } from './icon';

// ==========================================
// Declarations
// ==========================================
type Props = Object;

// ==========================================
// Component
// ==========================================
class Spinner extends React.PureComponent<Props> {
  render() {
    return <Icon icon={SPINNER_ICON} {...this.props} />;
  }
}

// ==========================================
// Public
// ==========================================
export default Spinner;
