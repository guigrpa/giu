// @flow

import React from 'react';
import Icon, { SPINNER_ICON } from './icon';

// ==========================================
// Component
// ==========================================
type Props = Object;

class Spinner extends React.PureComponent<Props> {
  render() {
    return <Icon icon={SPINNER_ICON} {...this.props} />;
  }
}

// ==========================================
// Public
// ==========================================
export default Spinner;
