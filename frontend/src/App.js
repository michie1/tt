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

function timeReducer(state, action) {
  if (action.type === 'tick') {
    return state + 1;
  } else if (action.type === 'reset') {
    return 0;
  } else {
    return state;
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
  const [timerStarted, setStarted] = React.useState(false);
  const [time, timeDispatch] = React.useReducer(timeReducer, 0);

  const [entries, entriesDispatch] = React.useReducer(entriesReducer, []);

  function entriesReducer(state, action) {
    if (action.type === 'add') {
      return [...state, {
        time,
        text
      }];
    } else {
      return state;
    }
  }

  React.useEffect(() => {
    if (timerStarted) {
      const id = setInterval(() => {
        timeDispatch({
          type: 'tick'
        });
      }, 1000);
      return () => {
        clearInterval(id);
        entriesDispatch({
          type: 'add',
        });
      }
    }
  }, [timerStarted]);

  return (
    <div>
      <h2><Timer started={timerStarted} time={time} /></h2>
      <input name="timer_text" value={text} placeholder="task" onChange={(e) => setText(e.target.value)} />
      <TimerButton started={timerStarted} start={() => setStarted(true)} stop={() => { setStarted(false); }}/>
      <Entries entries={entries} dispatch={entriesDispatch} />
    </div>
  );
}

export default App;
