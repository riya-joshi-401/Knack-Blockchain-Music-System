const Knack = artifacts.require("Knack");

module.exports = function (deployer) {
  deployer.deploy(Knack);
};
