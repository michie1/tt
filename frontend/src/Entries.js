import React from 'react';
import * as api from './api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay } from '@fortawesome/free-solid-svg-icons'
import { Timer } from './Timer';

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
                  api.deleteEntry(entry.id)
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

export {
  Entries,
};
