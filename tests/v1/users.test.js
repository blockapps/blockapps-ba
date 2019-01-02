require('co-mocha');
const ba = require('blockapps-rest');
const rest = ba.rest6;
const common = ba.common;
const config = common.config;
const util = common.util;
const assert = ba.common.assert;

const dappJs = require('../../server/dapp/dapp');
const poster = require('../poster');
const jwtDecode = require('jwt-decode');
const utils = require('../../server/utils');

const userAccessToken1 = process.env.USER_ACCESS_TOKEN_1;
const userAccessToken2 = process.env.USER_ACCESS_TOKEN_2;

describe("User Test", function () {
  this.timeout(config.timeout);

  let chainID, stratoUser1, startoUser2;

  before(function* () {
    this.timeout(config.timeout);

    // decode and create new account
    const decodedToken = jwtDecode(userAccessToken1);
    const userEmail = decodedToken['email'];
    stratoUser1 = yield utils.createUser(userAccessToken1, userEmail);

    // decode and create new account
    const decodedToken1 = jwtDecode(userAccessToken2);
    const userEmail1 = decodedToken1['email'];
    startoUser2 = yield utils.createUser(userAccessToken1, userEmail1);

    const chain = {
      label: `test airline ${util.uid()}`,
      src: 'contract Governance { }',
      args: {},
      members: [
        {
          address: stratoUser1.address,
          enode: "enode://6d8a80d14311c39f35f516fa664deaaaa13e85b2f7493f37f6144d86991ec012937307647bd3b9a82abe2974e1407241d54947bbb39763a4cac9f77166ad92a0@171.16.0.4:30303?discport=30303"
        },
        {
          address: startoUser2.address,
          enode: "enode://6d8a80d14311c39f35f516fa664deaaaa13e85b2f7493f37f6144d86991ec012937307647bd3b9a82abe2974e1407241d54947bbb39763a4cac9f77166ad92a0@171.16.0.4:30303?discport=30303"
        }
      ],
      balances: [
        {
          address: stratoUser1.address,
          balance: 1000000000000000000000000
        },
        {
          address: startoUser2.address,
          balance: 1000000000000000000000000
        }
      ]
    }

    chainID = yield rest.createChain(chain.label, chain.members, chain.balances, chain.src, chain.args);

    // NOTE: This will carry mockdata of chains and user
    config.deployFilename = `./tests/mock/chainsMock.deploy.yaml`;

    this.timeout(config.timeout);
    const dapp = yield dappJs.uploadContract(userAccessToken1, config.libPath, chainID);
    yield dapp.deploy(config.dataFilename, config.deployFilename, chainID);
    yield dapp.createUser({ address: stratoUser1.address, role: 'SUPPLIER' }, chainID);
  });

  it('should return user balance', function* () {
    this.timeout(config.timeout);
    const url = `/users/${stratoUser1.address}/balance?chainId=${chainID}`;

    const response = yield poster.get(url, userAccessToken1);
    assert.exists(response.balance, "balance must be exists");
  });

  it('get created user', function* () {
    this.timeout(config.timeout);
    const url = `/users/${stratoUser1.address}?chainId=${chainID}`;
    const response = yield poster.get(url, userAccessToken1);

    // 'SUPPLIER' role is 3
    assert.equal(response.user.role, 3, "role must be SUPPLIER (3)");
    assert.equal(response.user.account, stratoUser1.address, "address must be same as strato user");
  });
});
