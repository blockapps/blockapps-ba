export const UPLOAD_CONTRACTS_REQUEST = 'UPLOAD_CONTRACTS_REQUEST';
export const UPLOAD_CONTRACTS_SUCCESS = 'UPLOAD_CONTRACTS_REQUEST_SUCCESS';
export const UPLOAD_CONTRACTS_FAILURE = 'UPLOAD_CONTRACTS_FAILURE';
export const RESET_UPLOAD_CONTRACTS_DATA = 'RESET_UPLOAD_CONTRACTS_DATA';

export const uploadContracts = function (data) {
  return {
    type: UPLOAD_CONTRACTS_REQUEST,
    data
  }
};

export const uploadContractsSuccess = function (data) {
  return {
    type: UPLOAD_CONTRACTS_SUCCESS,
    data: data
  }
};

export const uploadContractsFailure = function (error) {
  return {
    type: UPLOAD_CONTRACTS_FAILURE,
    error: error
  }
};

export const resetUploadContractsData = function () {
  return {
    type: RESET_UPLOAD_CONTRACTS_DATA
  }
};