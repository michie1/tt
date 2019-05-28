import React from 'react';
import './App.css';

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
                  payload: entry.text,
                });
              }}
            />;
        })}
      </ul>
    </div>;
}

function reducer(state, action) {
  if (action.type === 'add') {
    return {
      entries: [...state.entries, {
        time: state.time,
        text: state.text,
      }],
      time: 0,
      started: false,
      text: '',
    };
  } else if (action.type === 'start') {
    return {
      ...state,
      started: true,
    };
  } else if (action.type === 'continue') {
    const entry = state.entries
      .find((searchEntry) => {
        return searchEntry.text === action.payload;
      });

    return {
      ...state,
      started: true,
      entries: state.entries.filter((entry) => {
        return entry.text !== action.payload;
      }),
      time: entry.time,
      text: entry.text,
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
  }

  return state;
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
      <h2><Timer started={started} time={time} /></h2>
      <input name="timer_text" value={text} placeholder="task" onChange={(e) => dispatch({ type: 'setText', payload: e.target.value })} />
      <TimerButton
        started={started}
        start={() => dispatch({ type: 'start' })}
        stop={() => { dispatch({ type: 'add' })}}
      />
      <Entries entries={entries} dispatch={dispatch} />
      <br />
      Total time: <Timer time={sum} />
    </div>
  );
}
export default App;
