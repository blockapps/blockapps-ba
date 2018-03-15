contract MasterContract {
  uint public storedData;

  function MasterContract() {
    storedData = 2;
  }

  function setToFour(){
    storedData = 4;
  }
}
