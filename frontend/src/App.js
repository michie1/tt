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
  return <li><Timer time={props.entry.time} /> - {props.entry.text}</li>;
}

function Entries(props) {
  return <div>
      <h2>Entries</h2>
      <ul>
        {props.entries.map((entry) => { return <Entry key={entry.text} entry={entry} />; })}
      </ul>
    </div>;
}

function App() {
  const [text, setText] = React.useState('');

  const [{
    entries,
    time,
    started
  }, dispatch] = React.useReducer(reducer, {
    entries: [],
    time: 0,
    started: false,
  });

  function reducer(state, action) {
    if (action.type === 'add') {
      return {
        entries: [...state.entries, {
          time: state.time,
          text: text,
        }],
        time: 0,
        started: false,
      };
    } else if (action.type === 'start') {
      return {
        ...state,
        started: true
      };
    } else if (action.type === 'tick') {
      return {
        ...state,
        time: state.time + 1,
      };
    }

    return state;
  }

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


  return (
    <div>
      <h2><Timer started={started} time={time} /></h2>
      <input name="timer_text" value={text} placeholder="task" onChange={(e) => setText(e.target.value)} />
      <TimerButton started={started} start={() => dispatch({ type: 'start' })} stop={() => { dispatch({ type: 'add' })}} />
      <Entries entries={entries} />
    </div>
  );
}
export default App;
