export const OAUTH_SUCCESS = 'OAUTH_SUCCESS';

export const oauthSuccess = function (email, role) {
  return {
    type: OAUTH_SUCCESS,
    email: email,
    role: role
  }
}
