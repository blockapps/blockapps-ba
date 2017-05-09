import "../../common/ErrorCodes.sol";
import "../../common/Version.sol";

/**
 * User data contract
 */
contract User is ErrorCodes, Version {
  string public username;
  bytes32 public pwHash;
  uint id;

  function User(string _username, bytes32 _pwHash, uint _id) {
    username = _username;
    pwHash = _pwHash;
    id = _id;
    version = 1;
  }
}
