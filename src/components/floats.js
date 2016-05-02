import React                from 'react';
import PureRenderMixin      from 'react-addons-pure-render-mixin';
import { createStore }      from 'redux';
import {
  addDefaults,
  addLast,
  removeAt,
  merge,
  set as timmSet,
}                           from 'timm';
import {
  bindAll,
  windowHeightWithoutScrollbar, windowWidthWithoutScrollbar,
}                           from '../gral/helpers';
import { isVisible }        from '../gral/visibility';
import {
  boxWithShadow,
}                           from '../gral/styles';

// ==========================================
// Store, reducer
// ==========================================
let store = null;
function initStore() { store = createStore(reducer); }

const INITIAL_STATE = {
  cntReposition: 0,
  floats: [],
};
function reducer(state0 = INITIAL_STATE, action) {
  let state = state0;
  let idx;
  let id;
  switch (action.type) {
    case 'FLOAT_ADD':
      state = timmSet(state, 'floats', addLast(state.floats, action.pars));
      break;
    case 'FLOAT_DELETE':
      id = action.id;
      idx = state.floats.findIndex(o => o.id === id);
      if (idx >= 0) {
        state = timmSet(state, 'floats', removeAt(state.floats, idx));
      }
      break;
    case 'FLOAT_REPOSITION':
      state = timmSet(state, 'cntReposition', state.cntReposition + 1);
      break;
    default:
      break;
  }
  return state;
}

// ==========================================
// Action creators
// ==========================================
let cntId = 0;
const DEFAULT_FLOAT_PARS = {
  position: 'below',
  align: 'left',
};
const actions = {
  floatAdd: initialPars => {
    const id = `float_${cntId++}`;
    const pars = addDefaults(initialPars, DEFAULT_FLOAT_PARS, { id });
    return { type: 'FLOAT_ADD', pars };
  },
  floatDelete: id => ({ type: 'FLOAT_DELETE', id }),
  floatReposition: () => ({ type: 'FLOAT_REPOSITION' }),
};

// Imperative dispatching
const floatAdd = pars => {
  const action = actions.floatAdd(pars);
  store.dispatch(action);
  return action.pars.id;
};
const floatDelete = (id) => store.dispatch(actions.floatDelete(id));
const floatReposition = () => store && store.dispatch(actions.floatReposition());

// ==========================================
// Inits
// ==========================================

// Reposition all floats upon window scroll or resize
// (This does *not* cover div scrolling, of course -- for that,
// you need to explicitly attach the `floatReposition` dispatcher
// as a listener to the corresponding `scroll` event)
try {
  window.addEventListener('scroll', floatReposition);
  window.addEventListener('resize', floatReposition);
} catch (err) { /* ignore */ }

// ==========================================
// Position and visibility calculation
// ==========================================
function calcPosition({ getAnchorNode, position, align }) {
  const anchorNode = getAnchorNode();
  const bcr = anchorNode && anchorNode.getBoundingClientRect();
  if (!bcr) return null;
  if (!isVisible(anchorNode, bcr)) return null;
  const out = {};
  if (position === 'below') {
    out.top = bcr.bottom;
  } else {
    out.bottom = windowHeightWithoutScrollbar() - bcr.top;
  }
  if (align === 'left') {
    out.left = bcr.left;
  } else {
    out.right = windowWidthWithoutScrollbar() - bcr.right;
  }
  return out;
}

// ==========================================
// Floats component
// ==========================================
let fFloatsMounted = false;
const isFloatsMounted = () => fFloatsMounted;

class Floats extends React.Component {
  static propTypes = {
    floats:                 React.PropTypes.array,
    cntReposition:          React.PropTypes.number,
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    bindAll(this, [
      'forceUpdate',
      'renderFloat',
    ]);
    if (props.floats == null) {
      if (!store) initStore();
      this.storeUnsubscribe = store.subscribe(this.forceUpdate);
    }
  }

  componentWillMount() {
    fFloatsMounted = true;
  }

  componentWillUnmount() {
    fFloatsMounted = false;
    if (this.storeUnsubscribe) this.storeUnsubscribe();
  }

  // ==========================================
  render() {
    const floats = this.props.floats || store.getState().floats;
    return (
      <div
        className="giu-floats"
        style={style.outer}
      >
        {floats.map(this.renderFloat)}
      </div>
              // TODO: zIndex will depend on whether the float
              // should appear on top of a modal, etc.

              // Rethink zIndexes!
    );
  }

  renderFloat(props) {
    const pos = calcPosition(props);
    if (!pos) return null;
    const { id, zIndex = 5 } = props;
    return (
      <div key={id}
        className="giu-float"
        style={style.wrapper(zIndex)}
      >
        <div
          {...props}
          style={style.float(pos, props)}
        />
      </div>
    );
  }
}

// ==========================================
// Styles
// ==========================================
const style = {
  outer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 0, // '100vw',
    height: 0, // '100vh',
    // pointerEvents: 'none',
    // zIndex: 80,
  },
  wrapper: zIndex => ({
    position: 'fixed',
    top: 0,
    left: 0,
    width: 0, // '100vw',
    height: 0, // '100vh',
    zIndex,
  }),
  float: (pos, {
    style: baseStyle, noStyleShadow,
  }) => {
    let out = merge(pos, {
      position: 'fixed',
      // pointerEvents: 'auto',
      // zIndex: 80,
    });
    if (!noStyleShadow) out = boxWithShadow(out);
    if (baseStyle) out = merge(out, baseStyle);
    return out;
  },
};

// ==========================================
// Warnings
// ==========================================
let fCheckedFloats = false;
const floatsWarning = name => `<${name}> requires a <Floats> component to be \
included in your application. It will not work properly otherwise.`;

function warnFloats(componentName) {
  if (fCheckedFloats) return;
  fCheckedFloats = true;
  /* eslint-disable no-console */
  if (!isFloatsMounted()) console.warn(floatsWarning(componentName));
  /* eslint-enable no-console */
}


// ==========================================
// Public API
// ==========================================
export {
  Floats,
  reducer,
  actions,
  floatAdd, floatDelete, floatReposition,
  warnFloats,
};
