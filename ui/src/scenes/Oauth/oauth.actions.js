export const OAUTH_REDIRECT_REQUEST = 'OAUTH_REDIRECT_REQUEST';
export const OAUTH_SUCCESS = 'OAUTH_SUCCESS';

export const oauthRedirectRequest = function () {
  return {
    type: OAUTH_REDIRECT_REQUEST
  }
};

export const oauthSuccess = function () {
  return {
    type: OAUTH_SUCCESS
  }
}
