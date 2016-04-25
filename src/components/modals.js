import React                from 'react';
import PureRenderMixin      from 'react-addons-pure-render-mixin';
import {
  createStore,
  applyMiddleware,
}                           from 'redux';
import thunk                from 'redux-thunk';
import {
  addLast,
  removeAt,
  updateIn,
  set as timmSet,
}                           from 'timm';
import { bindAll }          from '../gral/helpers';
import Modal                from './modal';

// ==========================================
// Store, reducer
// ==========================================
let store = null;
const INITIAL_STATE = {
  shown: [],
};
function initStore() {
  const storeEnhancers = applyMiddleware(thunk);
  store = createStore(reducer, storeEnhancers);
}
function reducer(state0 = INITIAL_STATE, action) {
  let state;
  switch (action.type) {
    case 'PUSH':
      state = updateIn(state0, ['shown'], shown => addLast(shown, action.pars));
      break;
    case 'POP':
      state = updateIn(state0, ['shown'], shown => removeAt(shown, shown.length - 1));
      break;
    default:
      state = state0;
      break;
  }
  return state;
}

// ==========================================
// Action creators
// ==========================================
let cntId = 0;
function _pushModal(pars) {
  const finalPars = timmSet(pars, 'id', cntId++);
  return { type: 'PUSH', pars: finalPars };
}

function _popModal() { return { type: 'POP' }; }

// ==========================================
// Modals component
// ==========================================
class Modals extends React.Component {
  static propTypes = {
    lang:                   React.PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    bindAll(this, ['onChangeStore']);
    if (!store) initStore();
    this.storeUnsubscribe = store.subscribe(this.onChangeStore);
  }

  componentWillUnmount() { this.storeUnsubscribe(); }

  onChangeStore() { this.forceUpdate(); }

  render() {
    const { shown } = store.getState();
    return (
      <div>
        {shown.map(props => <Modal key={props.id} {...props} />)}
      </div>
    );
  }
}

// ==========================================
// Public API
// ==========================================
const pushModal = pars => store.dispatch(_pushModal(pars));
const popModal = () => store.dispatch(_popModal());
const isModalActive = () => store.getState().shown.length > 0;

export {
  Modals,
  pushModal, popModal,
  isModalActive,
};
