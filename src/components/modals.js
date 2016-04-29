import React                from 'react';
import PureRenderMixin      from 'react-addons-pure-render-mixin';
import { createStore }      from 'redux';
import {
  addLast,
  removeAt,
  set as timmSet,
}                           from 'timm';
import Modal                from './modal';

// ==========================================
// Store, reducer
// ==========================================
let store = null;
function initStore() { store = createStore(reducer); }

const INITIAL_STATE = [];
function reducer(state0 = INITIAL_STATE, action) {
  let state = state0;
  switch (action.type) {
    case 'MODAL_PUSH':
      state = addLast(state, action.pars);
      break;
    case 'MODAL_POP':
      state = removeAt(state, state.length - 1);
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
  modalPush: pars => ({
    type: 'MODAL_PUSH',
    pars: timmSet(pars, 'id', `modal_${cntId++}`),
  }),
  modalPop: () => ({ type: 'MODAL_POP' }),
};

// Imperative dispatching
const modalPush = pars => {
  const action = actions.modalPush(pars);
  store.dispatch(action);
  return action.pars.id;
};
const modalPop = () => store.dispatch(actions.modalPop());

// ==========================================
// Modals component
// ==========================================
class Modals extends React.Component {
  static propTypes = {
    modals:                 React.PropTypes.array,
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    this.refModals = [];
    this.prevModals = [];
    if (props.modals == null) {
      if (!store) initStore();
      this.storeUnsubscribe = store.subscribe(this.forceUpdate.bind(this));
    }
  }

  // After popping a modal, focus on the top-most one
  componentDidUpdate(prevProps) {
    if (this.fPopped) {
      const len = this.prevModals.length;
      if (len) this.refModals[len-1].focus();
    }
  }

  componentWillUnmount() { if (this.storeUnsubscribe) this.storeUnsubscribe(); }

  // ==========================================
  render() {
    const modals = this.props.modals || store.getState();
    this.fPopped = (modals.length < this.prevModals.length);
    this.prevModals = modals;
    return (
      <div className="giu-modals">
        {modals.map((props, idx) =>
          <Modal key={props.id} ref={c => { this.refModals[idx] = c; }}
            zIndex={50 + idx * 10}
            {...props}
          />
        )}
      </div>
    );
  }
}

// ==========================================
// Public API
// ==========================================
const isModalActive = () => store.getState().length > 0;

export {
  Modals,
  reducer,
  actions,
  modalPush, modalPop, isModalActive,
};
