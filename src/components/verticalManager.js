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
    index:                  React.PropTypes.number.isRequired,
    childProps:             React.PropTypes.object,
    ChildComponent:         React.PropTypes.any.isRequired,
    onChangeHeight:         React.PropTypes.func,
    top:                    React.PropTypes.number,
  };

  static defaultProps = {
    childProps:             {},
  };

  constructor(props) {
    super(props);
    bindAll(this, [
      'measureHeight',
      'asyncMeasureHeight',
    ]);
    this.throttledMeasureHeight = throttle(this.measureHeight.bind(this), 200);
  }

  componentDidMount() {
    this.asyncMeasureHeight();
    window.addEventListener('resize', this.throttledMeasureHeight);
  }

  componentDidUpdate() {
    this.asyncMeasureHeight();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.throttledMeasureHeight);
  }

  measureHeight() {
    const { onChangeHeight } = this.props;
    if (!onChangeHeight) return;
    const container = this.refs.container;
    if (!container) return;
    const height = container.clientHeight;
    /* eslint-disable max-len */
    // console.log(`Measured height for ${this.props.id} - ${this.props.childProps.item.name}: ${height}`)
    /* eslint-enable max-len */
    if (height !== this.height) {
      this.height = height;
      onChangeHeight(this.props.id, height);
    }
  }

  // Some components (e.g. Textarea) are too fast reporting that
  // they have changed, before the DOM has actually been updated
  // and the new height can be measured. Wait for the next tick
  // for things to stabilise before measuring.
  asyncMeasureHeight() {
    setImmediate(this.measureHeight);
  }

  // ===============================================================
  // Render
  // ===============================================================
  render() {
    const { id, index, ChildComponent, childProps } = this.props;
    return (
      <div ref="container"
        id={id}
        style={style.outer(this.props)}
      >
        <ChildComponent
          // react-sortable-hoc sortableRow requires the index
          index={index}
          {...childProps}
          onMayHaveChangedHeight={this.asyncMeasureHeight}
        />
      </div>
      // Typical example of `onMayHaveChangedHeight`: in the `render`
      // property of a given DataTable column:
      // <Textarea onChange={this.props.onMayHaveChangedHeight} />
    );
  }
}

// ===============================================================
// Styles
// ===============================================================
const style = {
  outer: ({ top }) => ({
    position: 'absolute',
    opacity: top != null ? 1 : 0,
    zIndex: top != null ? undefined : -5000,
    top,
    left: 0,
    right: 0,

    // Important transition, no only aesthetically. When a row's contents changes height
    // and it is not shown because it is above the viewport, wheneve the user scrolls up
    // to that row it will get rendered, report on its new height, and all of the subsequent
    // rows will get repositioned. This should happen slowly to avoid confusing jumps
    // while scrolling
    // TODO: maybe disable this transition when list is draggable (react-sortable-hoc already
    // includes transition CSS)
    transition: 'top 300ms',
  }),
};

// ===============================================================
// Public API
// ===============================================================
export default VerticalManager;
