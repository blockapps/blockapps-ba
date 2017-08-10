import "../../common/ErrorCodes.sol";
import "../../common/Version.sol";

/**
 * User data contract
 */
contract OffsetTx is ErrorCodes, Version {
  // NOTE: members must be public to be indexed for search
  uint public txId;
  string public email;
  uint public fractions;
  uint public projectId;

  function OffsetTx(uint _txId, string _email, uint _fractions, uint _projectId) {
    txId = _txId;
    email = _email;
    fractions = _fractions;
    projectId = _projectId;
    version = 1;
  }
}
