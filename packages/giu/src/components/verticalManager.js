// @flow

import React from 'react';
import throttle from 'lodash/throttle';

// ===============================================================
// VerticalManager
// ===============================================================
// Renders hidden first, reports on its height, then becomes visible when
// it gets a `top` property passed from its owner comp.
// Becoming visible does not
// mean its child component gets re-rendered (this is more efficient than
// react-virtualized when using its CellMeasurer component).

/* eslint-disable no-unused-vars */
type PublicProps = {
  /* eslint-enable no-unused-vars */
  registerOuterRef?: (ref: any) => void,
  id: string,
  index: number,
  childProps?: Object,
  ChildComponent: ReactClass<*>,
  onChangeHeight: ?(id: string, height: number) => void,
  top: ?number,
};

type DefaultProps = {
  childProps: Object,
};

type Props = {
  /* :: ...$Exact<PublicProps>, */
  /* :: ...$Exact<DefaultProps>, */
};

class VerticalManager extends React.Component {
  static propTypes: Props;
  static defaultProps: DefaultProps = {
    childProps: {},
  };
  height: number;
  throttledMeasureHeight: () => void;
  refVerticalManager: ?Object;

  constructor(props: Props) {
    super(props);
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

  measureHeight = () => {
    const { onChangeHeight } = this.props;
    if (!onChangeHeight) return;
    const { refVerticalManager } = this;
    if (!refVerticalManager) return;
    const height = refVerticalManager.clientHeight;
    /* eslint-disable max-len */
    // console.log(`Measured height for ${this.props.id} - ${this.props.childProps.item.name}: ${height}`)
    /* eslint-enable max-len */
    if (height !== this.height) {
      this.height = height;
      onChangeHeight(this.props.id, height);
    }
  };

  // Some components (e.g. Textarea) are too fast reporting that
  // they have changed, before the DOM has actually been updated
  // and the new height can be measured. Wait for the next tick
  // for things to stabilise before measuring.
  asyncMeasureHeight = () => {
    setImmediate(this.measureHeight);
  };

  // ===============================================================
  // Render
  // ===============================================================
  render() {
    const { id, index, ChildComponent, childProps } = this.props;
    const disabled = !childProps.fSortedManually || this.props.top == null;
    return (
      <div
        ref={this.registerOuterRef}
        className="giu-vertical-manager"
        id={id}
        style={style.outer(this.props)}
      >
        <ChildComponent
          // react-sortable-hoc sortableRow requires the index
          index={index}
          {...childProps}
          onMayHaveChangedHeight={this.asyncMeasureHeight}
          // Disable participation of this row in drag-n-drop
          // (react-sortable-hoc) if its `top` is `undefined`
          // (i.e. if it is hidden and temporarily possitioned at the top,
          // hence possibly interfering in react-sortable-hoc´s algorithm)
          disabled={disabled}
        />
      </div>
    );
    // Typical example of `onMayHaveChangedHeight`: in the `render`
    // property of a given DataTable column:
    // <Textarea onChange={this.props.onMayHaveChangedHeight} />
  }

  // ===============================================================
  // Event handlers
  // ===============================================================
  registerOuterRef = (c: ?Object) => {
    this.refVerticalManager = c;
    if (this.props.registerOuterRef) this.props.registerOuterRef(c);
  };
}

// ===============================================================
// Styles
// ===============================================================
const style = {
  outer: ({ top }) => ({
    position: 'absolute',
    opacity: top != null ? 1 : 0,
    zIndex: top != null ? undefined : -5000,
    // transform: top != null ? `translateY(${top}px)` : undefined,
    top: top != null ? Math.round(top) : undefined,
    left: 0,
    right: 0,
  }),
};

// ===============================================================
// Public API
// ===============================================================
export default VerticalManager;
