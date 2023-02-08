export function FETCH_CREATED_GAME() {
    return `query {
          gameEndeds(orderBy:id, orderDirection:desc, first: 1) {
            id
            playerAddress
            requestId
            slot1
            slot2
            slot3
            isWinner
          }
      }`;
  }