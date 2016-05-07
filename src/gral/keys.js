import keycode              from 'keycode';
import { UNICODE }          from '../gral/constants';
import { cancelEvent }      from '../gral/helpers';

const IS_MAC = /Mac|iPod|iPhone|iPad/.test(navigator.platform);

const shortcuts = {};

function getKey({ keyCode, altKey, metaKey, ctrlKey, shiftKey }) {
  return `${keyCode},alt=${!!altKey},meta=${!!metaKey},ctrl=${!!ctrlKey},shift=${!!shiftKey}`;
}

function registerShortcut(shortcut, cb) {
  const entry = {};
  entry.keyCodes = shortcut.split('+').map(extName0 => {
    let extName = extName0;
    if (extName === 'mod') extName = IS_MAC ? 'cmd' : 'ctrl';
    return keycode(extName);
  });
  entry.keyNames = entry.keyCodes.map(keyCode => keycode(keyCode));
  for (const keyName of entry.keyNames) {
    switch (keyName) {
      case 'alt':       entry.altKey = true;  break;
      case 'command':   entry.metaKey = true; break;
      case 'ctrl':      entry.ctrlKey = true; break;
      case 'shift':     entry.shiftKey = true; break;
      default:          entry.keyCode = keycode(keyName); break;
    }
  }
  entry.description = entry.keyNames.map(keyName => {
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
  entry.cb = cb;
  entry.key = getKey(entry);
  shortcuts[entry.key] = entry;
  return entry;
}

function unregisterShortcut(shortcut) { delete shortcuts[shortcut.key]; }

function onKeyDown(ev) {
  const key = getKey(ev);
  const shortcut = shortcuts[key];
  if (!shortcut) return;
  cancelEvent(ev);
  shortcut.cb && shortcut.cb();
}

try {
  window.addEventListener('keydown', onKeyDown);
} catch (err) { /* ignore */ }

export {
  registerShortcut,
  unregisterShortcut,
};
