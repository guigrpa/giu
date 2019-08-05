// @flow

import React from 'react';
import classnames from 'classnames';
import { cancelEvent } from '../gral/helpers';
import { IS_IOS } from '../gral/constants';

// ==========================================
// Declarations
// ==========================================
type Props = {};

// ==========================================
// Component
// ==========================================
class Backdrop extends React.PureComponent<Props> {
  render() {
    // Due to bug: https://github.com/zeit/styled-jsx/issues/329
    return (
      <div
        onWheel={cancelEvent}
        onTouchMove={cancelEvent}
        {...this.props}
        className={classnames('giu-backdrop', { 'giu-backdrop-ios': IS_IOS })}
      />
    );
  }
}

// ==========================================
// Public
// ==========================================
export default Backdrop;
