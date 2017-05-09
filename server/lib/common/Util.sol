/**
 * Util contract
 */
contract Util {
  function stringToBytes32(string memory source) returns (bytes32 result) {
      assembly {
          result := mload(add(source, 32))
      }
  }

  function b32(string memory source) returns (bytes32) {
    return stringToBytes32(source);
  }
}
