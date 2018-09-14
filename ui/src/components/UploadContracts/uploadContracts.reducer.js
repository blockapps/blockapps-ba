import {
  UPLOAD_CONTRACTS_SUCCESS,
  UPLOAD_CONTRACTS_FAILURE,
  UPLOAD_CONTRACTS_REQUEST
} from "./uploadContracts.actions";

const initialState = {
  uploadContractData: {},
  error: null,
  isLoading: false
};

const reducer = function (state = initialState, action) {
  switch (action.type) {
    case UPLOAD_CONTRACTS_REQUEST:
      return {
        ...state,
        isLoading: true
      };
    case UPLOAD_CONTRACTS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        uploadContractData: action.data
      };
    case UPLOAD_CONTRACTS_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.error
      };
    default:
      return state;
  }
};

export default reducer;
