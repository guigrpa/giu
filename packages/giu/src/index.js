/*!
 * Giu
 *
 * An opinionated Swiss-army knife for building React application GUIs.
 *
 * @copyright Guillermo Grau Panea 2016
 * @license MIT
 */

// @flow

/* eslint-disable import/newline-after-import, import/first */

// NB: Flow complains when we take a default export from another module
// and reexport as a named export from this main API,
// e.g. export Select from './inputs/select';
// That's why we do it in two steps here

// Reexported libraries
import tinycolor from 'tinycolor2';
export { tinycolor };

// Components
import Giu from './components/giu';
export { Giu };
import { ThemeContext } from './gral/themeContext';
export { ThemeContext };

import Select from './inputs/select';
export { Select };
export { LIST_SEPARATOR } from './inputs/selectCustom';
export {
  TextInput,
  PasswordInput,
  NumberInput,
  RangeInput,
} from './inputs/textNumberRangeInput';
import DateInput from './inputs/dateInput';
export { DateInput };
import Textarea from './inputs/textarea';
export { Textarea };
import Checkbox from './inputs/checkbox';
export { Checkbox };
import FileInput from './inputs/fileInput';
export { FileInput };
import RadioGroup from './inputs/radioGroup';
export { RadioGroup };
import ColorInput from './inputs/colorInput';
export { ColorInput };

export {
  Modals,
  reducer as modalReducer,
  actions as modalActions,
  modalPush,
  modalPop,
  isModalActive,
} from './components/modals';
import Modal from './components/modal';
export { Modal };
export {
  Notifications,
  reducer as notifReducer,
  actions as notifActions,
  notify,
  notifRetain,
  notifDelete,
} from './components/notifications';
import Notification from './components/notification';
export { Notification };
export {
  Floats,
  floatAdd,
  floatDelete,
  floatUpdate,
  floatReposition,
} from './components/floats';
export {
  Hints,
  reducer,
  actions,
  hintDefine,
  hintDisableAll,
  hintReset,
  hintShow,
  hintHide,
  isHintShown,
} from './components/hints';
import HintScreen from './components/hintScreen';
export { HintScreen };

import DataTable, { SORT_MANUALLY } from './components/dataTable';
export { DataTable, SORT_MANUALLY };
import VirtualScroller from './components/virtualScroller';
export { VirtualScroller };

import DropDownMenu from './components/dropDownMenu';
export { DropDownMenu };
import Button from './components/button';
export { Button };
import Icon from './components/icon';
export { Icon };
import Spinner from './components/spinner';
export { Spinner };
import LargeMessage from './components/largeMessage';
export { LargeMessage };
import Progress from './components/progress';
export { Progress };
import HeightMeasurer from './components/heightMeasurer';
export { HeightMeasurer };
import AnimatedCounter from './components/animatedCounter';
export { AnimatedCounter };

// HOCs and wrappers
import Input from './hocs/input';
export { Input };

// Styles
export {
  flexContainer,
  flexItem,
  isDark,
  isLight,
  darken,
  lighten,
  addStylesToPage,
} from './gral/styles';
export {
  COLORS,
  KEYS,
  FONTS,
  getScrollbarWidth,
  IS_MAC,
  IS_IOS,
  IS_MOBILE_OR_TABLET,
} from './gral/constants';

// Other
export {
  bindAll,
  cancelEvent,
  preventDefault,
  stopPropagation,
  cancelBodyScrolling,
  windowHeightWithoutScrollbar,
  windowWidthWithoutScrollbar,
  simplifyString,
  memoize,
} from './gral/helpers';
export * from './gral/wait';
export * from './gral/validators';
export { isAnyModifierPressed } from './gral/keys';
export { isVisible, scrollIntoView } from './gral/visibility';
export * from './gral/storage';
