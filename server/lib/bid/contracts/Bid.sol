import "../../common/ErrorCodes.sol";
import "./BidState.sol";

/**
 * Bid data contract
 */
contract Bid is ErrorCodes, BidState {
  // NOTE: members must be public to be indexed for search
  string public supplier;
  uint public id;
  BidState public state;

  function Bid(uint _id, string _supplier) {
    id = _id;
    supplier = _supplier;
    state = BidState.OPEN;
  }

  function getState() returns (BidState) {
    return state;
  }

  function setState(BidState _state) {
    state = _state;
  }
}
