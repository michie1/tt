import React from 'react';

function prependZero(number) {
  if (number < 10) {
    return '0' + number;
  } else {
    return number;
  }
}

function Timer(props) {
  const hours = prependZero(Math.floor(props.time / 60 / 60));
  const minutes = prependZero(Math.floor(props.time / 60 % 60));
  const seconds = prependZero(props.time % 60);

  return <span>{hours}:{minutes}:{seconds}</span>;
}

export {
  Timer,
};
