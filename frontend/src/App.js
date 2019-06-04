import React from 'react';
import ApolloClient from "apollo-boost";
import { gql } from "apollo-boost";
import * as uuid from  'uuid/v4';
import './App.css';

const client = new ApolloClient({
  uri: '/graphql'
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
      <button onClick={() => { props.continue(); }}>Continue</button>
      <span>{props.entry.saved ? 'saved' : 'unsaved'}</span>
      &nbsp;
      <span>{props.entry.inDatabase ? 'in Database' : 'not in Database'}</span>
    </li>;
}

function Entries(props) {
  return <div>
      <h2>Entries</h2>
      <ul>
        {props.entries.map((entry) => {
          return <Entry
              key={entry.text}
              entry={entry}
              continue={() => {
                props.dispatch({
                  type: 'continue',
                  payload: entry.id,
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
        id: state.id,
        time: state.time,
        text: state.text,
        saved: false,
        inDatabase: state.inDatabase,
      }],
      time: 0,
      started: false,
      text: '',
      id: null,
      saved: false,
    };
  } else if (action.type === 'start') {
    return {
      ...state,
      started: true,
      id: uuid(),
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
      id: entry.uuid,
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
    text: ''
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

  const sum = entries.reduce((soFar, entry) => {
    return soFar + entry.time;
  }, time);

  return (
    <div>
      <h2><Timer time={time} /></h2>
      <input name="timer_text" value={text} placeholder="task" onChange={(e) => dispatch({ type: 'setText', payload: e.target.value })} />
      <TimerButton
        started={started}
        start={() => dispatch({ type: 'start' })}
        stop={() => { dispatch({ type: 'stop' })}}
      />
      <Entries entries={entries} dispatch={dispatch} />
      <br />
      Total time: <Timer time={sum} />
    </div>
  );
}
export default App;
