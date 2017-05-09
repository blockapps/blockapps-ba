import "../../common/ErrorCodes.sol";
import "../../common/Version.sol";
import "../../common/Util.sol";

/**
 * User data contract
 */
contract User is ErrorCodes, Version, Util {
  string public username;
  bytes32 public pwHash;

  string _s;
  bytes32 _b;
  bytes32 _converted;

  function User(string _username, bytes32 _pwHash) {
    username = _username;
    pwHash = _pwHash;
    version = 1;
    test('a', 0);
  }

  function test(string s, bytes32 b) returns(bool) {
    _s = s;
    _b = b;
    _converted = b32(s);
    if (_converted == b) return true;
    return false;
  }
}
