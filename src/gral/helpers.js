function bindAll(_this, fnNames) {
  for (const name of fnNames) {
    /* eslint-disable no-param-reassign */
    _this[name] = _this[name].bind(_this);
    /* eslint-enable no-param-reassign */
  }
}

function cancelEvent(ev) {
  ev.preventDefault();
  ev.stopPropagation();
}

export {
  bindAll,
  cancelEvent,
};
