function createProjectArgs(uid, chainId) {
  const projectArgs = {
    name: 'Project_ ? ' + uid,
    buyer: 'Buyer1',
    description: 'description_ ? % ' + uid,
    spec: 'spec_ ? % ' + uid,
    price: 1234,
    created: new Date().getTime(),
    targetDelivery: new Date().getTime() + 3 * 24 * 60 * 60 * 1000, // 3 days
    chainId: chainId
  };

  return projectArgs;
}


module.exports = {
  createProjectArgs
};
