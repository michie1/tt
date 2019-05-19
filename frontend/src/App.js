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
  if (props.started) {
    return <h2>{props.time}</h2>
  } else {
    return <h2>00:00:00</h2>
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

function App() {
  const [text, setText] = React.useState('hoi');
  const [timerStarted, setStarted] = React.useState(false);
  const [time, timeDispatch] = React.useReducer(timeReducer, 0);

  React.useEffect(() => {
    if (timerStarted) {
      const id = setInterval(() => {
        timeDispatch({
          type: 'tick'
        });
      }, 1000);
      return () => {
        clearInterval(id);
        timeDispatch({
          type: 'reset'
        });
      }
    }
  }, [timerStarted]);

  function stop() {
    console.log('stop', text);
    setStarted(false);
  }

  return (
    <div>
      <Timer started={timerStarted} time={time} />
      <input name="timer_text" value={text} onChange={(e) => setText(e.target.value)} />
      <TimerButton started={timerStarted} start={() => setStarted(true)} stop={stop}/>
    </div>
  );
}

export default App;
