import React                from 'react';
import PureRenderMixin      from 'react-addons-pure-render-mixin';
import {
  createStore,
  applyMiddleware,
}                           from 'redux';
import thunk                from 'redux-thunk';
import {
  merge,
  updateIn,
  set as timmSet,
}                           from 'timm';
import HintScreen           from './hintScreen';

// ==========================================
// Store, reducer
// ==========================================
let store = null;

const INITIAL_STATE = {
  fDisableAll: false,
  disabled: [],
  shown: null,
  catalogue: {},
};
const NAMESPACE = 'giu';

function initStore() {
  const storeEnhancers = applyMiddleware(thunk);
  const initialState = merge({}, INITIAL_STATE);
  try {
    initialState.fDisableAll = JSON.parse(localStorage[`${NAMESPACE}_fDisableAll`]);
  } catch (err) { /* discard */ }
  try {
    initialState.disabled = JSON.parse(localStorage[`${NAMESPACE}_disabled`]);
  } catch (err) { /* discard */ }
  store = createStore(reducer, initialState, storeEnhancers);
}

function reducer(state0 = INITIAL_STATE, action) {
  let state = state0;
  let id;
  switch (action.type) {
    case 'HINT_DEFINE':
      state = updateIn(state, ['catalogue'], catalogue =>
        timmSet(catalogue, action.id, action.pars));
      break;
    case 'HINT_DISABLE_ALL':
      state = timmSet(state, 'fDisableAll', true);
      state = timmSet(state, 'shown', null);
      break;
    case 'HINT_RESET':
      state = merge(state, {
        fDisableAll: false,
        disabled: [],
      });
      break;
    case 'HINT_SHOW':
      id = action.id;
      if (!state.fDisableAll && state.disabled.indexOf(id) < 0) {
        state = timmSet(state, 'disabled', state.disabled.concat(id));
        state = timmSet(state, 'shown', id);
      }
      break;
    case 'HINT_HIDE':
      state = timmSet(state, 'shown', null);
      break;
    default:
      break;
  }
  return state;
}

// ==========================================
// Action creators
// ==========================================
const actions = {
  hintDefine: (id, pars) => ({ type: 'HINT_DEFINE', id, pars }),
  hintDisableAll: () => (dispatch, getState) => {
    dispatch({ type: 'HINT_DISABLE_ALL' });
    const { fDisableAll } = getState();
    localStorage[`${NAMESPACE}_fDisableAll`] = JSON.stringify(fDisableAll);
  },
  hintReset: () => (dispatch, getState) => {
    dispatch({ type: 'HINT_RESET' });
    const { fDisableAll, disabled } = getState();
    localStorage[`${NAMESPACE}_fDisableAll`] = JSON.stringify(fDisableAll);
    localStorage[`${NAMESPACE}_disabled`] = JSON.stringify(disabled);
  },
  hintShow: id => (dispatch, getState) => {
    dispatch({ type: 'HINT_SHOW', id });
    const { disabled } = getState();
    localStorage[`${NAMESPACE}_disabled`] = JSON.stringify(disabled);
  },
  hintHide: () => ({ type: 'HINT_HIDE' }),
};

// Imperative dispatching
const hintDefine = (id, pars) => store.dispatch(actions.hintDefine(id, pars));
const hintDisableAll = () => store.dispatch(actions.hintDisableAll());
const hintReset = () => store.dispatch(actions.hintReset());
const hintShow = id => store.dispatch(actions.hintShow(id));
const hintHide = () => store.dispatch(actions.hintHide());

// ==========================================
// Hints component
// ==========================================
class Hints extends React.Component {
  static propTypes = {
    storeState:             React.PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    if (props.storeState == null) {
      if (!store) initStore();
      this.storeUnsubscribe = store.subscribe(this.forceUpdate.bind(this));
    }
  }

  componentWillUnmount() { if (this.storeUnsubscribe) this.storeUnsubscribe(); }

  // ==========================================
  render() {
    this.storeState = this.props.storeState || store.getState();
    return (
      <div className="giu-hints">
        {this.renderHint()}
      </div>
    );
  }

  renderHint() {
    const { shown, catalogue } = this.storeState;
    if (!shown) return null;
    const pars = catalogue[shown];
    return <HintScreen {...pars} onClose={hintHide} />;
  }
}

// ==========================================
// Public API
// ==========================================
const isHintShown = () => store.getState().shown != null;

export {
  Hints,
  reducer,
  actions,
  hintDefine, hintDisableAll, hintReset, hintShow, hintHide, isHintShown,
};
