import ApolloClient from 'apollo-boost';
import { gql } from 'apollo-boost';

const client = new ApolloClient({
  uri: process.env.REACT_APP_API + '/graphql'
});

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

export {
  fetchEntries,
  createEntry,
  updateEntry,
  deleteEntry,
};
