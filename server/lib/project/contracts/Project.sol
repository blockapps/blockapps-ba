import "../../common/ErrorCodes.sol";
import "../../common/Version.sol";

/**
 * Project data contract
 */
contract Project is ErrorCodes, Version {
  // NOTE: members must be public to be indexed for search
  string public buyer;
  uint public id;

  function Project(uint _id, string _buyer) {
    id = _id;
    buyer = _buyer;
    version = 1;
  }
}
