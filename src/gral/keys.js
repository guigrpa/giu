// @flow

import keycode              from 'keycode';
import { UNICODE, IS_MAC }  from '../gral/constants';
import { cancelEvent }      from '../gral/helpers';

export type KeyboardShortcutT = {
  altKey: boolean,
  metaKey: boolean,
  ctrlKey: boolean,
  shiftKey: boolean,
  keyCodes: Array<number>,
  keyNames: Array<string>,
  hash: string,
};

type KeyboardShortcutCallbackT = (ev: SyntheticKeyboardEvent) => void;

const shortcuts: {[key: string]: KeyboardShortcutCallbackT} = {};

function getHash({ keyCode, altKey, metaKey, ctrlKey, shiftKey }: {
  keyCode: number,
  altKey: boolean,
  metaKey: boolean,
  ctrlKey: boolean,
  shiftKey: boolean,
}) {
  return `${String(keyCode)},alt=${String(altKey)},` +
    `meta=${String(metaKey)},ctrl=${String(ctrlKey)},` +
    `shift=${String(shiftKey)}`;
}

function createShortcut(keySpec: string): KeyboardShortcutT {
  const shortcut = {};
  shortcut.keyCode = -1;
  shortcut.altKey = false;
  shortcut.metaKey = false;
  shortcut.ctrlKey = false;
  shortcut.shiftKey = false;
  shortcut.keyCodes = keySpec.split('+').map((extName0) => {
    let extName = extName0;
    if (extName === 'mod') extName = IS_MAC ? 'cmd' : 'ctrl';
    return keycode(extName);
  });
  shortcut.keyNames = shortcut.keyCodes.map((keyCode) => keycode(keyCode));
  for (const keyName of shortcut.keyNames) {
    switch (keyName) {
      case 'alt':       shortcut.altKey = true;  break;
      case 'command':   shortcut.metaKey = true; break;
      case 'ctrl':      shortcut.ctrlKey = true; break;
      case 'shift':     shortcut.shiftKey = true; break;
      default:          shortcut.keyCode = keycode(keyName); break;
    }
  }
  shortcut.description = shortcut.keyNames.map((keyName) => {
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

function registerShortcut(shortcut: KeyboardShortcutT, cb: KeyboardShortcutCallbackT) {
  shortcuts[shortcut.hash] = cb;
}

function unregisterShortcut(shortcut: KeyboardShortcutT) { delete shortcuts[shortcut.hash]; }

function isAnyModifierPressed(ev: SyntheticKeyboardEvent): boolean {
  return ev.altKey || ev.metaKey || ev.ctrlKey || ev.shiftKey;
}

// Global key-down handler (a single one)
function onKeyDown(ev: SyntheticKeyboardEvent) {
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
