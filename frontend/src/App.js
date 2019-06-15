import React from 'react';
import './App.css';
import 'bulma/css/bulma.css';
import { reducer } from './reducer';
import * as api from './api';
import { Entries } from './Entries';
import { Timer } from './Timer';

function TimerButton(props) {
  if (props.started) {
    return <button className="button is-danger" type="button" onClick={() => props.stop()}>Stop</button>
  } else {
    return <button className="button is-primary" type="button" onClick={() => props.start()}>Start</button>
  }
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
    api.fetchEntries()
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
            return api.createEntry(entry);
          })
        ),
        ...(updateEntries
          .map((entry) => {
            return api.updateEntry(entry);
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
