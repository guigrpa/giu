// @flow

let namespace = 'giu';

function setLocalStorageNamespace(newNamespace: string) {
  namespace = newNamespace;
}

function localGet(key: string, { defaultValue }: {|
  defaultValue?: any,
|} = {}): any {
  let out = defaultValue;
  try {
    const str: any = localStorage[`${namespace}_${key}`];
    out = JSON.parse(str);
  } catch (err) { /* ignore */ }
  return out;
}

function localSet(key: string, val: any) {
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
