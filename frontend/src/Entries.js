import React from 'react';
import format from 'date-fns/format';
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
  return (
    <tr style={trStyle}>
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
    </tr>
  );
}

function Entries(props) {
  const groups = Object.entries(props.entries
    .reduce((soFar, entry) => {
      const date = new Date(entry.createdAt);
      const formatted = format(date, 'YYYY-MM-DD');

      Object.assign(soFar, {
        [formatted]: [entry, ...(soFar[formatted] || [])],
      });
      return soFar;
    }, {}))
    .sort(([dateA], [dateB]) => {
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    })
    .map(([date, entries]) => {
      return {
        date,
        entries: entries
          .sort((entryA, entryB) => {
            return new Date(entryB.createdAt).getTime() - new Date(entryA.createdAt).getTime();
          })
      };
    });

  return (
    <div>
      <h3 className="title is-3">Entries</h3>
      {groups
        .map(({date, entries}) => {
          return (
            <div key={date}>
            <h4 className="title is-4">{date}</h4>
            <table className="table is-fullwidth">
            <tbody>
            {entries
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
            </div>
          );
        })
      }
    </div>
  );
}

export {
  Entries,
};
