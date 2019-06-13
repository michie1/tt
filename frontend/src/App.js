import React from 'react';
import ApolloClient from "apollo-boost";
import { gql } from "apollo-boost";
import * as uuid from  'uuid/v4';
import './App.css';
import 'bulma/css/bulma.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay } from '@fortawesome/free-solid-svg-icons'


const client = new ApolloClient({
  uri: '/graphql/'
});

function TimerButton(props) {
  if (props.started) {
    return <button className="button is-danger" type="button" onClick={() => props.stop()}>Stop</button>
  } else {
    return <button className="button is-primary" type="button" onClick={() => props.start()}>Start</button>
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

const trStyle = {
  lineHeight: '2em',
};

const tdStyle = {
  width: '13em',
};

function Entry(props) {
  return <tr style={trStyle}>
        <td>
          {props.entry.text}
        </td>
        <td style={tdStyle}>
          <Timer time={props.entry.time} />
          <button className="button" onClick={() => { props.continue(); }} disabled={props.started}>
            <FontAwesomeIcon icon={faPlay} />
          </button>
          <button className="delete is-large" onClick={() => { props.delete(); }}>Delete</button>
        </td>
      </tr>;
}

function Entries(props) {
  return <div>
    <h3 className="title is-3">Entries</h3>
    <table className="table is-fullwidth">
      <tbody>
        {props.entries
          .sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          })
          .map((entry) => {
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
          })
        }
        </tbody>
      </table>
    </div>;
}

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

function fetchEntries() {
  return client
    .query({
      query: gql`
        {
          allEntries {
            nodes {
              id,
              time,
              text,
              createdAt
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
                time: ${entry.time},
                createdAt: "${entry.createdAt}"
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
    createdAt: null,
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
      <h1 className="title level-item has-text-centered">Time Tracker</h1>
      <div className="container">
        <h2 className="title is-2 level-item has-text-centered"><Timer time={time} /></h2>
        <div className="field is-horizontal">
          <div className="control">
            <input className="input is-primary" name="timer_text" value={text} placeholder="entry" onChange={(e) => dispatch({ type: 'setText', payload: e.target.value })} />
          </div>
          <div className="control">
            <span className="level-item has-text-centered">
              <TimerButton
                started={started}
                start={() => dispatch({ type: 'start' })}
                stop={() => { dispatch({ type: 'stop' })}}
              />
            </span>
          </div>
        </div>
        <Entries entries={entries} dispatch={dispatch} started={started} />
        <br />
        Total time: <strong><Timer time={sum} /></strong>
      </div>
    </div>
  );
}
export default App;
