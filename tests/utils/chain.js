const ba = require('blockapps-rest');
const { util } = ba.common;

const ENODE = 'enode://6d8a80d14311c39f35f516fa664deaaaa13e85b2f7493f37f6144d86991ec012937307647bd3b9a82abe2974e1407241d54947bbb39763a4cac9f77166ad92a0@171.16.0.4:30303?discport=30303';
const BALANCE = 1000000000000000000000000000000000000000;

const createChainArgs = (members, users) => {
  const memberList = members.map((address) => { return ({ address: address, enode: ENODE }) });
  const balanceList = members.map((address) => { return ({ address: address, balance: BALANCE }) });

  const chain = {
    label: `test airline ${util.uid()}`,
    src: 'contract Governance { }',
    args: {},
    members: memberList,
    balances: balanceList
  }

  return (
    chain
  )
}

module.exports = {
  createChainArgs
};
