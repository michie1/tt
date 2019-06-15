import * as uuid from  'uuid/v4';

function reducer(state, action) {
  if (action.type === 'stop') {
    return {
      entries: [...state.entries, {
        id: state.entryId,
        time: state.time,
        text: state.text,
        createdAt: state.createdAt,
        saved: false,
        inDatabase: state.inDatabase || false,
      }],
      time: 0,
      started: false,
      text: '',
      entryId: null,
      saved: false,
    };
  } else if (action.type === 'start') {
    return {
      ...state,
      started: true,
      entryId: uuid(),
      inDatase: false,
      createdAt: new Date().toISOString(),
    };
  } else if (action.type === 'continue') {
    const entry = state.entries
      .find((searchEntry) => {
        return searchEntry.id === action.payload;
      });

    return {
      ...state,
      started: true,
      entries: state.entries.filter((entry) => {
        return entry.id !== action.payload;
      }),
      time: entry.time,
      text: entry.text,
      createdAt: entry.createdAt,
      entryId: entry.id,
      inDatabase: entry.inDatabase,
    };
  } else if (action.type === 'tick') {
    return {
      ...state,
      time: state.time + 1,
    };
  } else if (action.type === 'setText') {
    return {
      ...state,
      text: action.payload,
    };
  } else if (action.type === 'setEntries') {
    return {
      ...state,
      entries: action.payload
    };
  } else if (action.type === 'saved') {
    return {
      ...state,
      entries: state.entries
        .map((entry) => {
          if (action.payload.includes(entry.id)) {
            entry.saved = true;
            entry.inDatabase = true;
          }
          return entry;
        }),
    }
  } else if (action.type === 'delete') {
    return {
      ...state,
      entries: state.entries
        .filter((entry) => {
          return entry.id !== action.payload;
        })
    };
  }

  return state;
}

export {
  reducer,
};
