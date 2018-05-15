export const OPEN_REQUEST_REMOVAL_MODAL = "OPEN_REQUEST_REMOVAL_MODAL";
export const CLOSE_REQUEST_REMOVAL_MODAL = "CLOSE_REQUEST_REMOVAL_MODAL";
export const FETCH_ENTITES_REQUEST = "FETCH_ENTITES_REQUEST";
export const FETCH_ENTITES_SUCCESS = "FETCH_ENTITES_SUCCESS";
export const FETCH_ENTITES_FAILURE = "FETCH_ENTITES_FAILURE";
export const VOTE_REQUEST = "VOTE_REQUEST";
export const VOTE_SUCCESS = "VOTE_SUCCESS";
export const VOTE_FAILURE = "VOTE_FAILURE";
export const RESET_MESSAGE = "RESET_MESSAGE";

export function openRequestRemovalModal() {
  return {
    type: OPEN_REQUEST_REMOVAL_MODAL
  };
}

export function closeRequestRemovalModal() {
  return {
    type: CLOSE_REQUEST_REMOVAL_MODAL
  };
}

export function vote(data) {
  return {
    type: VOTE_REQUEST,
    data
  }
}

export function voteSuccess(response) {
  return {
    type: VOTE_SUCCESS,
    response
  }
}

export function voteFailure(error) {
  return {
    type: VOTE_FAILURE,
    error
  }
}

export function fetchEntities(username) {
  return {
    type: FETCH_ENTITES_REQUEST,
    username
  };
}

export function fetchEntitiesSuccess(entities) {
  return {
    type: FETCH_ENTITES_SUCCESS,
    entities
  };
}

export function fetchEntitiesFailure(error) {
  return {
    type: FETCH_ENTITES_FAILURE,
    error
  };
}

export const resetMessage = function () {
  return {
    type: RESET_MESSAGE
  }
}