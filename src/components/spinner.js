import React                from 'react';
import PureRenderMixin      from 'react-addons-pure-render-mixin';
import Icon                 from './icon';

// ==========================================
// Component
// ==========================================
class Spinner extends React.Component {
  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    return <Icon icon="circle-o-notch" {...this.props} />;
  }
}

// ==========================================
// Public API
// ==========================================
export default Spinner;
