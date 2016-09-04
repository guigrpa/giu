/*!
 * Giu
 *
 * An opinionated Swiss-army knife for building React application GUIs.
 *
 * @copyright Guillermo Grau Panea 2016
 * @license MIT
 */
require('./index.css');

// Components
export Select             from './inputs/select';
export { LIST_SEPARATOR } from './inputs/selectCustom';
export {
  TextInput,
  PasswordInput,
  NumberInput,
  RangeInput,
}                         from './inputs/textNumberRangeInput';
export DateInput          from './inputs/dateInput';
export Textarea           from './inputs/textarea';
export Checkbox           from './inputs/checkbox';
export FileInput          from './inputs/fileInput';
export RadioGroup         from './inputs/radioGroup';
export ColorInput         from './inputs/colorInput';

export {
  Modals,
  reducer as modalReducer,
  actions as modalActions,
  modalPush, modalPop, isModalActive,
}                         from './components/modals';
export Modal              from './components/modal';
export {
  Notifications,
  reducer as notifReducer,
  actions as notifActions,
  notify, notifRetain, notifDelete, notifDeleteByName,
}                         from './components/notifications';
export Notification       from './components/notification';
export {
  Floats,
  floatAdd, floatDelete, floatUpdate, floatReposition,
}                         from './components/floats';
export {
  Hints,
  reducer,
  actions,
  hintDefine, hintDisableAll, hintReset, hintShow, hintHide, isHintShown,
}                         from './components/hints';
export HintScreen         from './components/hintScreen';

export DataTable          from './components/dataTable';
export VirtualScroller    from './components/virtualScroller';
export DropDownMenu       from './components/dropDownMenu';
export Button             from './components/button';
export Icon               from './components/icon';
export Spinner            from './components/spinner';
export LargeMessage       from './components/largeMessage';
export Progress           from './components/progress';

// HOCs
export hoverable          from './hocs/hoverable';
export input              from './hocs/input';

// Styles
export {
  flexContainer, flexItem,
  boxWithShadow,
  isDark, isLight,
  darken, lighten,
  addStylesToPage,
}                         from './gral/styles';
export {
  COLORS, KEYS,
  getScrollbarWidth,
  IS_MAC, IS_IOS,
}                         from './gral/constants';

// Other
export {
  bindAll,
  cancelEvent, preventDefault, stopPropagation,
  cancelBodyScrolling,
  windowHeightWithoutScrollbar, windowWidthWithoutScrollbar,
}                         from './gral/helpers';
export *                  from './gral/validators';
export {
  isAnyModifierPressed,
}                         from './gral/keys';
export {
  isVisible,
  scrollIntoView,
}                         from './gral/visibility';
