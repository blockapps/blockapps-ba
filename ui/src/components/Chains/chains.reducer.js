import {
  FETCH_CHAINS_SUCCESS,
  FETCH_CHAINS_FAILURE,
  SET_CHAIN_ID,
  RESET_CHAIN_ID
} from './chains.actions';

const initialState = {
  chains: {},
  chainIds: [],
  error: null,
  chainId: null
};

const reducer = function (state = initialState, action) {
  switch (action.type) {
    case FETCH_CHAINS_SUCCESS:
      const chainLabelIds = {};
      const chains = action.chains;
      // this will create an object of chain with label and their address
      chains.forEach((chain) => {
        const id = chain.id;
        const label = chain.info.label;
        if (!chainLabelIds[label]) {
          chainLabelIds[label] = {};
          chainLabelIds[label][id] = {};
        } else {
          chainLabelIds[label][id] = {};
        }
      });
      return {
        ...state,
        chains: chainLabelIds,
        chainIds: action.chains.map((chain) => {return {value: chain.id, label: chain.info.label}} ),
        error: null
      };
    case FETCH_CHAINS_FAILURE:
      return {
        ...state,
        chains: state.chains,
        error: action.error
      };
    case SET_CHAIN_ID:
      return {
        ...state,
        chainId: action.chainId
      }
    case RESET_CHAIN_ID:
      return {
        ...state,
        chainId: null
      }
    default:
      return state;
  }
};

export default reducer;
