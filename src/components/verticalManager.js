import React                from 'react';
import { bindAll }          from '../gral/helpers';
import throttle             from 'lodash/throttle';

// ===============================================================
// VerticalManager
// ===============================================================
// Renders hidden first, reports on its height, then becomes visible when
// it gets a `top` property passed from the top. Becoming visible does not
// mean its child component gets re-rendered (this is more efficient than
// react-virtualized when using its CellMeasurer component).
class VerticalManager extends React.Component {
  static propTypes = {
    id:                     React.PropTypes.string.isRequired,
    childProps:             React.PropTypes.object,
    ChildComponent:         React.PropTypes.any.isRequired,
    onChangeHeight:         React.PropTypes.func,
    top:                    React.PropTypes.number,
    rowHeight:              React.PropTypes.number,
  };

  static defaultProps = {
    childProps:             {},
  };

  constructor(props) {
    super(props);
    bindAll(this, ['measureHeight']);
    this.measureHeight = throttle(this.measureHeight.bind(this), 200);
  }

  componentDidMount() {
    this.measureHeight();
    window.addEventListener('resize', this.measureHeight);
  }

  componentDidUpdate() {
    this.measureHeight();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.measureHeight);
  }

  measureHeight() {
    if (!this.props.onChangeHeight) return;
    const container = this.refs.container;
    if (!container) return;
    const height = container.clientHeight;
    if (height !== this.height) {
      this.height = height;
      this.props.onChangeHeight(this.props.id, height);
    }
  }

  // ===============================================================
  // Render
  // ===============================================================
  render() {
    const { ChildComponent, childProps } = this.props;
    return (
      <div ref="container" style={style.outer(this.props)}>
        <ChildComponent
          {...childProps}
          onChangeHeight={this.measureHeight}
        />
      </div>
    );
  }
}

// ===============================================================
// Styles
// ===============================================================
const style = {
  outer: ({ top, rowHeight }) => ({
    position: 'absolute',
    opacity: top != null ? 1 : 0,
    top,
    left: 0,
    right: 0,
    transition: 'top 300ms'
    // height: rowHeight,
    // overflowY: rowHeight != null ? 'hidden' : undefined,
  }),
};

// ===============================================================
// Public API
// ===============================================================
export default VerticalManager;
