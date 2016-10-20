import React                from 'react';
import { createStore }      from 'redux';
import {
  addLast, removeAt,
  set as timmSet,
  merge, mergeIn, addDefaults,
  omit,
}                           from 'timm';
import {
  bindAll,
  cancelEvent,
  windowHeightWithoutScrollbar, windowWidthWithoutScrollbar,
}                           from '../gral/helpers';
import { isVisible }        from '../gral/visibility';
import { MISC }             from '../gral/constants';
import {
  boxWithShadow,
}                           from '../gral/styles';

const PROP_KEYS_TO_REMOVE_FROM_FLOAT_DIV = [
  'position', 'align', 'zIndex', 'limitSize', 'getAnchorNode',
];

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
      state = timmSet(state, 'cntReposition', state.cntReposition + 1);
      break;
    case 'FLOAT_DELETE':
      id = action.id;
      idx = state.floats.findIndex(o => o.id === id);
      if (idx >= 0) {
        state = timmSet(state, 'floats', removeAt(state.floats, idx));
      }
      break;
    case 'FLOAT_UPDATE':
      id = action.id;
      idx = state.floats.findIndex(o => o.id === id);
      if (idx >= 0) {
        state = mergeIn(state, ['floats', idx], action.pars);
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
  zIndex: MISC.zMainFloatDelta,
  limitSize: false,
};
const actions = {
  floatAdd: initialPars => {
    const id = `float_${cntId++}`;
    const pars = addDefaults(initialPars, DEFAULT_FLOAT_PARS, { id });
    return { type: 'FLOAT_ADD', pars };
  },
  floatDelete: id => ({ type: 'FLOAT_DELETE', id }),
  floatUpdate: (id, pars) => ({ type: 'FLOAT_UPDATE', id, pars }),
  floatReposition: () => ({ type: 'FLOAT_REPOSITION' }),
};

// Imperative dispatching
const floatAdd = pars => {
  const action = actions.floatAdd(pars);
  store.dispatch(action);
  return action.pars.id;
};
const floatDelete = (id) => store.dispatch(actions.floatDelete(id));
const floatUpdate = (id, pars) => store.dispatch(actions.floatUpdate(id, pars));
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
function isAnchorVisible({ getAnchorNode }) {
  const anchorNode = getAnchorNode();
  if (!anchorNode) return null;
  return isVisible(anchorNode);
}

// ==========================================
// Floats component
// ==========================================
let fFloatsMounted = false;
const isFloatsMounted = () => fFloatsMounted;

class Floats extends React.PureComponent {

  constructor(props) {
    super(props);
    bindAll(this, [
      'forceUpdate',
      'renderFloat',
    ]);
    if (!store) initStore();
    this.storeUnsubscribe = store.subscribe(this.forceUpdate);
  }

  componentWillMount() {
    fFloatsMounted = true;
    this.refFloats = [];
  }

  componentWillUnmount() {
    fFloatsMounted = false;
    if (this.storeUnsubscribe) this.storeUnsubscribe();
  }

  componentDidUpdate() {
    const { curState, prevState } = this;
    if (curState.cntReposition !== prevState.cntReposition) {
      this.repositionFloats();
    }
  }

  // ==========================================
  render() {
    this.prevState = this.curState;
    this.curState = store.getState();
    this.floats = this.curState.floats;
    return (
      <div
        className="giu-floats"
        style={style.outer}
      >
        {this.floats.map(this.renderFloat)}
      </div>
    );
  }

  renderFloat(props, idx) {
    if (!isAnchorVisible(props)) return null;
    const { id, zIndex } = props;
    return (
      <div key={id}
        className="giu-float"
        onMouseDown={cancelEvent}
        style={style.wrapper(zIndex)}
      >
        <div ref={c => { this.refFloats[idx] = c; }}
          {...omit(props, PROP_KEYS_TO_REMOVE_FROM_FLOAT_DIV)}
          style={style.floatInitial(props)}
        />
      </div>
    );
  }

  // ==========================================
  repositionFloats() {
    // Make it asynchronous, so that we are not in the middle
    // of React's update cycle (which may cause some refs to be
    // dettached and floats not to be positioned properly).
    // We use a promise here, since it triggers a microtask
    // (faster than a task)
    Promise.resolve().then(() => {
    // setTimeout(() => {
      const floats = this.floats;
      for (let idx = 0; idx < floats.length; idx++) {
        this.repositionFloat(floats[idx], idx);
      }
    });
  }

  repositionFloat(float, idx) {
    const ref = this.refFloats[idx];
    if (!ref) return;

    // Hide and move to top-left for measuring
    let { position, align } = float;
    const { limitSize } = float;
    ref.style.opacity = '0.01';
    ref.style.left = '0px';
    ref.style.right = null;
    ref.style.top = '0px';
    ref.style.bottom = null;
    if (limitSize) {
      ref.style.overflowX = 'visible';
      ref.style.overflowY = 'visible';
      ref.style.maxWidth = null;
      ref.style.maxHeight = null;
    }
    const wFloat = ref.offsetWidth;
    const hFloat = ref.offsetHeight;

    // Preparations
    const anchorNode = float.getAnchorNode();
    const bcr = anchorNode && anchorNode.getBoundingClientRect();
    if (!bcr) return;
    const styleAttrs = {};
    const hWin = windowHeightWithoutScrollbar();
    const wWin = windowWidthWithoutScrollbar();
    const breathe = MISC.windowBorderBreathe;

    // Position vertically
    if (!position) {
      const freeBelow = hWin - bcr.bottom;
      if (freeBelow >= hFloat) {
        position = 'below';
      } else {
        position = freeBelow > bcr.top ? 'below' : 'above';
      }
    }
    let maxHeight;
    if (position === 'below') {
      styleAttrs.top = `${bcr.bottom}px`;
      styleAttrs.bottom = null;
      maxHeight = Math.max(0, hWin - bcr.bottom - breathe);
    } else {
      styleAttrs.top = null;
      styleAttrs.bottom = `${windowHeightWithoutScrollbar() - bcr.top}px`;
      maxHeight = Math.max(0, bcr.top - breathe);
    }
    if (limitSize) styleAttrs.overflowY = 'auto';

    // Position horizontally
    if (!align) {
      const freeRight = wWin - bcr.left;
      if (freeRight >= wFloat) {
        align = 'left';
      } else {
        align = freeRight > bcr.right ? 'left' : 'right';
      }
    }
    let maxWidth;
    if (align === 'left') {
      styleAttrs.left = `${bcr.left}px`;
      styleAttrs.right = null;
      maxWidth = Math.max(0, wWin - bcr.left - breathe);
    } else {
      styleAttrs.left = null;
      styleAttrs.right = `${windowWidthWithoutScrollbar() - bcr.right}px`;
      maxWidth = Math.max(0, bcr.right - breathe);
    }
    if (limitSize) styleAttrs.overflowX = 'auto';

    // Limit size. This must be at the end, so that the changes are also
    // applied at the end
    if (limitSize) {
      styleAttrs.maxHeight = hFloat > maxHeight ? `${maxHeight}px` : null;
      styleAttrs.maxWidth = wFloat > maxWidth ? `${maxWidth}px` : null;
    }

    // Apply style
    Object.keys(styleAttrs).forEach(attr => {
      ref.style[attr] = styleAttrs[attr];
    });
    ref.style.opacity = 1;
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
    width: 0,
    height: 0,
  },
  wrapper: zIndex => ({
    position: 'fixed',
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    zIndex,
  }),
  floatInitial: ({ style: baseStyle, noStyleShadow }) => {
    let out = {
      position: 'fixed',
      top: 0,
      left: 0,
      opacity: 0.5,
    };
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
included in your application. It will not work properly otherwise. Please add it \
as close as possible to the application root; no props are needed.`;

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
  floatAdd, floatDelete, floatUpdate, floatReposition,
  warnFloats,
};
