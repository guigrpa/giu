let namespace = 'giu';

function setLocalStorageNamespace(newNamespace) {
  namespace = newNamespace;
}

function localGet(key, options = {}) {
  let out = options.defaultValue;
  try {
    out = JSON.parse(localStorage[`${namespace}_${key}`]);
  } catch (err) { /* ignore */ }
  return out;
}

function localSet(key, val) {
  try {
    localStorage[`${namespace}_${key}`] = JSON.stringify(val);
  } catch (err) { /* ignore */ }
}

// ==========================================
// Public API
// ==========================================
export {
  setLocalStorageNamespace,
  localGet, localSet,
};
