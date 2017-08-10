import "./OffsetTx.sol";
import "../../common/ErrorCodes.sol";
import "../../common/Util.sol";

/**
* Interface for Tx data contracts
*/
contract TxManager is ErrorCodes, Util {
  /**
  * Constructor
  */

  uint txId;

  function TxManager() {
    txId = block.number; // can also be oassed in as a constructor argument
  }

  // assumptions:  email, projectId are validated
  function createOffsetTx(string email, uint fractions, uint projectId) returns (ErrorCodes, uint) {
    txId++;
    OffsetTx tx = new OffsetTx(txId, email, fractions, projectId);
    return (ErrorCodes.SUCCESS, txId);
  }
}
