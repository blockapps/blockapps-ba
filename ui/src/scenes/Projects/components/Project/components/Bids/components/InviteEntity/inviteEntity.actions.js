export const OPEN_INVITE_ENTITY_MODAL = "OPEN_INVITE_ENTITY_MODAL";
export const CLOSE_INVITE_ENTITY_MODAL = "CLOSE_INVITE_ENTITY_MODAL";
export const INVITE_ENTITY_REQUEST = "INVITE_ENTITY_REQUEST";
export const INVITE_ENTITY_SUCCESS = "INVITE_ENTITY_SUCCESS";
export const INVITE_ENTITY_FAILURE = "INVITE_ENTITY_FAILURE";
export const RESET_MESSAGE = "RESET_MESSAGE";

export function openInviteEntityModal() {
  return {
    type: OPEN_INVITE_ENTITY_MODAL
  };
}

export function closeInviteEntityModal() {
  return {
    type: CLOSE_INVITE_ENTITY_MODAL
  };
}

export const inviteEntityRequest = function (entity) {
  return {
    type: INVITE_ENTITY_REQUEST,
    entity,
  }
}

export const inviteEntitySuccess = function (isEntityCreated) {
  return {
    type: INVITE_ENTITY_SUCCESS,
    isEntityCreated
  }
}

export const inviteEntityFailure = function (error) {
  return {
    type: INVITE_ENTITY_FAILURE,
    error,
  }
}

export const resetMessage = function () {
  return {
    type: RESET_MESSAGE
  }
}
