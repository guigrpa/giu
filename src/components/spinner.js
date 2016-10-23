// @flow

import React                from 'react';
import Icon                 from './icon';

// ==========================================
// Component
// ==========================================
class Spinner extends React.PureComponent {
  props: Object;
  render() {
    return <Icon icon="circle-o-notch" {...this.props} />;
  }
}

// ==========================================
// Public API
// ==========================================
export default Spinner;
