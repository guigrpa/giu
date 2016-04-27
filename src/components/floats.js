import React                from 'react';
import PureRenderMixin      from 'react-addons-pure-render-mixin';
import { createStore }      from 'redux';
import {
  addLast,
  removeAt,
  set as timmSet,
}                           from 'timm';

// ==========================================
// Store, reducer
// ==========================================
let store = null;
function initStore() { store = createStore(reducer); }

const INITIAL_STATE = [];
function reducer(state0 = INITIAL_STATE, action) {
  let state = state0;
  let idx;
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
  return action.id;
}
const floatDelete = () => store.dispatch(actions.floatDelete());

// ==========================================
// Floats component
// ==========================================
class Floats extends React.Component {
  static propTypes = {
    floats:                 React.PropTypes.array,
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    if (props.floats == null) {
      if (!store) initStore();
      this.storeUnsubscribe = store.subscribe(this.forceUpdate.bind(this));
    }
  }

  componentWillUnmount() { if (this.storeUnsubscribe) this.storeUnsubscribe(); }

  // ==========================================
  render() {
    const floats = this.props.floats != null ? this.props.floats : store.getState();
    return (
      <div 
        className="giu-floats"
        style={style.outer}
      >
        <div>Hello</div>
        {floats.map(props =>
          <div key={props.id}
            {...props}
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
};

// ==========================================
// Public API
// ==========================================
export {
  Floats,
  reducer,
  actions,
  floatAdd, floatDelete,
};
