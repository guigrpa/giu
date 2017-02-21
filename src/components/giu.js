// @flow

/* eslint-disable global-require */

import React                from 'react';

// ==========================================
// Component
// ==========================================
/* --
A root component that can be used for custom themes.
-- */
type Props = {
  theme: string | Object,
  children: any;
};

class Giu extends React.PureComponent {
  props: Props;

  getChildContext() {
    return { theme: this.props.theme };
  }

  componentWillMount() {
    if (this.props.theme === 'mdl') require('typeface-roboto');
  }

  render() {
    return this.props.children;
  }
}

Giu.childContextTypes = {
  theme: React.PropTypes.any,
};

// ==========================================
// Public API
// ==========================================
export default Giu;
