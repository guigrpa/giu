import React                from 'react';
import PureRenderMixin      from 'react-addons-pure-render-mixin';
import { createStore }      from 'redux';
import {
  addLast,
  removeAt,
  merge,
  set as timmSet,
}                           from 'timm';
import { bindAll }          from '../gral/helpers';
import {
  boxWithShadow,
}                           from '../gral/styles';

// ==========================================
// Store, reducer
// ==========================================
let store = null;
function initStore() { store = createStore(reducer); }

const INITIAL_STATE = [];
function reducer(state0 = INITIAL_STATE, action) {
  let state = state0;
  let idx;
  let id;
  switch (action.type) {
    case 'FLOAT_ADD':
      state = addLast(state, action.pars);
      break;
    case 'FLOAT_DELETE':
      id = action.id;
      idx = state.findIndex(o => o.id === id);
      if (idx >= 0) {
        state = removeAt(state, idx);
      }
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
const actions = {
  floatAdd: pars => ({
    type: 'FLOAT_ADD',
    pars: timmSet(pars, 'id', `float_${cntId++}`),
  }),
  floatDelete: id => ({ type: 'FLOAT_DELETE', id }),
};

// Imperative dispatching
const floatAdd = pars => {
  const action = actions.floatAdd(pars);
  store.dispatch(action);
  return action.pars.id;
};
const floatDelete = (id) => store.dispatch(actions.floatDelete(id));

// ==========================================
// Floats component
// ==========================================
let fFloatsMounted = false;
const isFloatsMounted = () => fFloatsMounted;

class Floats extends React.Component {
  static propTypes = {
    floats:                 React.PropTypes.array,
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    bindAll(this, ['forceUpdate']);
    if (props.floats == null) {
      if (!store) initStore();
      this.storeUnsubscribe = store.subscribe(this.forceUpdate);
    }
  }

  componentWillMount() {
    fFloatsMounted = true;
    window.addEventListener('scroll', this.forceUpdate);
  }

  componentWillUnmount() {
    fFloatsMounted = false;
    window.removeEventListener('scroll', this.forceUpdate);
    if (this.storeUnsubscribe) this.storeUnsubscribe();
  }

  // ==========================================
  render() {
    const floats = this.props.floats != null ? this.props.floats : store.getState();
    return (
      <div
        className="giu-floats"
        style={style.outer}
      >
        {floats.map(props =>
          <div key={props.id}
            {...props}
            style={style.float(props)}
          />
        )}
      </div>
              // TODO: zIndex will depend on whether the float
              // should appear on top of a modal, etc.

              // Rethink zIndexes!
    );
  }
}


// ==========================================
// Styles
// ==========================================
const style = {
  outer: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  },
  float: ({
    getBoundingClientRect,
    style: baseStyle, noStyleShadow,
  }) => {
    const bcr = getBoundingClientRect();
    let out = {
      position: 'fixed',
      left: bcr.left,
      top: bcr.bottom,
      zIndex: 1,
    };
    if (!noStyleShadow) out = boxWithShadow(out);
    if (baseStyle) out = merge(out, baseStyle);
    return out;
  },
};

// ==========================================
// Public API
// ==========================================
export {
  Floats,
  isFloatsMounted,
  reducer,
  actions,
  floatAdd, floatDelete,
};
