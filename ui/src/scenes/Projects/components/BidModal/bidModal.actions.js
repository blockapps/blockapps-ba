export const BID_SUBMIT = "BID_SUBMIT";
export const BID_SUCCESS = "BID_SUCCESS";
export const BID_FAILURE = "BID_FAILURE";
export const BID_OPEN_MODAL = "BID_OPEN_MODAL";
export const BID_CLOSE_MODAL = "BID_CLOSE_MODAL";

export const bidSubmit = function(bid) {
  return {
    type: BID_SUBMIT,
    name: bid.name,
    supplier: bid.supplier,
    amount: bid.amount
  }
}

export const bidSuccess= function() {
  return {
    type: BID_SUCCESS
  }
}

export const bidFailure = function(err) {
  return {
    type: BID_FAILURE,
    err: err
  }
}

export const openBidModal = function() {
  return {
    type: BID_OPEN_MODAL,
    isOpen: true
  }
}

export const closeBidModal = function() {
  return {
    type: BID_CLOSE_MODAL,
    isOpen: false
  }
}
