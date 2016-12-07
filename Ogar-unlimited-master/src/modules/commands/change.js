module.exports = function (gameServer, split) {
  var key = split[1];
  var value = split[2];

  // Check if int/float

  if (isNaN(value)) {
    value = parseInt(value);
  }

  if (typeof gameServer.config[key] != 'undefined') {
    gameServer.config[key] = value;
    console.log("[Console] Set " + key + " to " + value);
    gameServer.reloadClientPacket();
  } else {
    console.log("[Console] Invalid config value");
  }
};
