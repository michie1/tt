import React from 'react';
import ApolloClient from "apollo-boost";
import { gql } from "apollo-boost";
import * as uuid from  'uuid/v4';
import './App.css';

const client = new ApolloClient({
  uri: '/graphql/'
});

function TimerButton(props) {
  if (props.started) {
    return <button type="button" onClick={() => props.stop()}>Stop</button>
  } else {
    return <button type="button" onClick={() => props.start()}>Start</button>
  }
}

function Timer(props) {
  const hours = prependZero(Math.floor(props.time / 60 / 60));
  const minutes = prependZero(Math.floor(props.time / 60 % 60));
  const seconds = prependZero(props.time % 60);

  return <span>{hours}:{minutes}:{seconds}</span>;
}

function prependZero(number) {
  if (number < 10) {
    return '0' + number;
  } else {
    return number;
  }
}

function Entry(props) {
  return <li>
      <Timer time={props.entry.time} /> - {props.entry.text}
      <button onClick={() => { props.continue(); }} disabled={props.started}>Continue</button>
      <button onClick={() => { props.delete(); }}>Delete</button>
    </li>;
}

function Entries(props) {
  return <div>
      <h2>Entries</h2>
      <ul>
        {props.entries.map((entry) => {
          return <Entry
              key={entry.id}
              entry={entry}
              started={props.started}
              continue={() => {
                props.dispatch({
                  type: 'continue',
                  payload: entry.id,
                });
              }}
              delete={() => {
                deleteEntry(entry.id)
                  .then(() => {
                    props.dispatch({
                      type: 'delete',
                      payload: entry.id,
                    });
                  });
              }}
            />;
        })}
      </ul>
    </div>;
}

function reducer(state, action) {
  if (action.type === 'stop') {
    return {
      entries: [...state.entries, {
        id: state.entryId,
        time: state.time,
        text: state.text,
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

function fetchEntries() {
  return client
    .query({
      query: gql`
        {
          allEntries {
            nodes {
              id,
              time,
              text
            }
          }
        }`
    })
    .then((response) => {
      return response.data.allEntries.nodes
        .map((entry) => {
          return Object.assign(entry, {
            saved: true,
            inDatabase: true,
          });
        });
    });
}

function createEntry(entry) {
  return client
    .mutate({
      mutation: gql`
        mutation {
          createEntry(
            input:{
              entry:{
                id: "${entry.id}",
                text: "${entry.text}",
                time: ${entry.time}
              }
            }
          ) {
            entry {
              id
            }
          }
        }`
    });
}

function updateEntry(entry) {
  return client
    .mutate({
      mutation: gql`
        mutation {
          updateEntryById(
            input: {
              id: "${entry.id}",
              entryPatch: {
                text: "${entry.text}"
                time: ${entry.time}
              }
            }
          ) {
            entry {
              id
            }
          }
        }`
    });
}

function deleteEntry(entryId) {
  return client
    .mutate({
      mutation: gql`
        mutation {
          deleteEntryById(input: {
              id: "${entryId}"
          }) {
            deletedEntryId
          }
        }`
    });
}

function App() {
  const [{
    entries,
    time,
    started,
    text,
  }, dispatch] = React.useReducer(reducer, {
    entries: [],
    time: 0,
    started: false,
    text: '',
    entryId: null,
  });

  React.useEffect(() => {
    document.title = 'Time Tracker';
  });

  React.useEffect(() => {
    fetchEntries()
      .then((initialEntries) => {
        dispatch({
          type: 'setEntries',
          payload: initialEntries,
        });
      });
  }, []);

  React.useEffect(() => {
    if (started) {
      const id = setInterval(() => {
        dispatch({
          type: 'tick'
        });
      }, 1000);
      return () => {
        clearInterval(id);
      }
    }
  }, [started]);

  React.useEffect(() => {
    if (started === false) {
      const createEntries = entries
        .filter((entry) => {
          return entry.inDatabase === false;
        });

      const updateEntries = entries
        .filter((entry) => {
          return entry.inDatabase &&
            entry.saved === false;
        });

      Promise.all([...(createEntries
          .map((entry) => {
            return createEntry(entry);
          })
        ),
        ...(updateEntries
          .map((entry) => {
            return updateEntry(entry);
          })
        )
      ])
        .then((responses) => {
          return responses.map((response) => {
            return response.data.updateEntryById ?
              response.data.updateEntryById.entry.id :
              response.data.createEntry.entry.id;
          })
        })
        .then((ids) => {
          if (ids.length > 0) {
            dispatch({
              type: 'saved',
              payload: ids
            });
          }
        });
    }
  }, [started, entries]);

  const sum = entries.reduce((soFar, entry) => {
    return soFar + entry.time;
  }, time);

  return (
    <div>
      <h2><Timer time={time} /></h2>
      <input name="timer_text" value={text} placeholder="entry" onChange={(e) => dispatch({ type: 'setText', payload: e.target.value })} />
      <TimerButton
        started={started}
        start={() => dispatch({ type: 'start' })}
        stop={() => { dispatch({ type: 'stop' })}}
      />
      <Entries entries={entries} dispatch={dispatch} started={started} />
      <br />
      Total time: <Timer time={sum} />
    </div>
  );
}
export default App;
