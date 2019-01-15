const LINE_TEXT_LIMIT = 250;

const ellipsis = (text, limit) => {
  if (text.length > limit) {
    return `${text.substring(0, limit)}...`;
  }
  return text;
};

const getActionType = (action, definitions = {}) => {
  const { __reactduxSpecialAction: special, type } = action;
  if (typeof type === 'string') {
    return type;
  }
  if (special) {
    return 'setKeyValue';
  }
  const name = Object.entries(definitions).find(([key, value]) => {
    if (value === type) {
      return key;
    }
  });
  return name ? name[0] : 'unknown';
};

const logStructure = target => {
  if (target === undefined) {
    return;
  }
  if (typeof target === 'string') {
    console.log(ellipsis(target, LINE_TEXT_LIMIT));
  } else if (target !== null && typeof target === 'object') {
    Object.entries(target)
      .filter(([key, value]) => value !== undefined)
      .forEach(([key, value]) => {
        const output = typeof value === 'string'
          ? ellipsis(value, LINE_TEXT_LIMIT)
          : value;
        console.log(`${key}:`, output);
      });
  } else {
    console.log(target);
  }
};

export default definitions =>
  store =>
    next =>
      action => {
        next(action);
        if (process.env.NODE_ENV === 'production') {
          return;
        }
        console.groupCollapsed(`----------------------\n%c ACTION: ${getActionType(action, definitions)}\n----------------------`);
        console.groupCollapsed('payload:');
        logStructure(action.payload);
        console.groupEnd();
        // console.groupCollapsed('state:');
        // logStructure(store.getState());
        // console.groupEnd();
        console.groupEnd();
      };