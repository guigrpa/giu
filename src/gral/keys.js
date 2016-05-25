import keycode              from 'keycode';
import { UNICODE }          from '../gral/constants';
import { cancelEvent }      from '../gral/helpers';

let IS_MAC = false;
// May be SSR, hence try
try {
  IS_MAC = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
} catch (err) { /* ignore */ }

const shortcuts = {};

function getHash({ keyCode, altKey, metaKey, ctrlKey, shiftKey }) {
  return `${keyCode},alt=${!!altKey},meta=${!!metaKey},ctrl=${!!ctrlKey},shift=${!!shiftKey}`;
}

function createShortcut(keySpec) {
  const shortcut = {};
  shortcut.keyCodes = keySpec.split('+').map(extName0 => {
    let extName = extName0;
    if (extName === 'mod') extName = IS_MAC ? 'cmd' : 'ctrl';
    return keycode(extName);
  });
  shortcut.keyNames = shortcut.keyCodes.map(keyCode => keycode(keyCode));
  for (const keyName of shortcut.keyNames) {
    switch (keyName) {
      case 'alt':       shortcut.altKey = true;  break;
      case 'command':   shortcut.metaKey = true; break;
      case 'ctrl':      shortcut.ctrlKey = true; break;
      case 'shift':     shortcut.shiftKey = true; break;
      default:          shortcut.keyCode = keycode(keyName); break;
    }
  }
  shortcut.description = shortcut.keyNames.map(keyName => {
    let c;
    switch (keyName) {
      case 'alt':       c = IS_MAC ? UNICODE.altKey : 'Alt-'; break;
      case 'command':   c = UNICODE.cmdKey;        break;
      case 'ctrl':      c = UNICODE.ctrlKey;       break;
      case 'shift':     c = UNICODE.shiftKey;      break;
      case 'left':      c = UNICODE.leftArrow;     break;
      case 'up':        c = UNICODE.upArrow;       break;
      case 'right':     c = UNICODE.rightArrow;    break;
      case 'down':      c = UNICODE.downArrow;     break;
      case 'enter':     c = UNICODE.returnKey;     break;
      case 'backspace': c = UNICODE.backspaceKey;  break;
      default:          c = keyName.toUpperCase(); break;
    }
    return c;
  }).join('');
  shortcut.hash = getHash(shortcut);
  return shortcut;
}

function registerShortcut(shortcut, cb) {
  shortcuts[shortcut.hash] = cb;
}

function unregisterShortcut(shortcut) { delete shortcuts[shortcut.hash]; }

function isAnyModifierPressed(ev) {
  return ev.altKey || ev.metaKey || ev.ctrlKey || ev.shiftKey;
}

function onKeyDown(ev) {
  const hash = getHash(ev);
  const shortcut = shortcuts[hash];
  if (!shortcut) return;
  cancelEvent(ev);
  shortcut(ev);
}

try {
  window.addEventListener('keydown', onKeyDown);
} catch (err) { /* ignore */ }

export {
  createShortcut,
  registerShortcut,
  unregisterShortcut,
  isAnyModifierPressed,
};
