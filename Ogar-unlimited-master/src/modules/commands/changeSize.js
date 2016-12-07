module.exports = function (gameServer, split) {
  w = split[1];
  h = split[2];
  if (isNaN(borderDec)) {
      console.log("Failed to change size of map.");
  } else {
  gameServer.config.borderLeft = 0;
  gameServer.config.borderRight = 0;
  gameServer.config.borderTop = w;
  gameServer.config.borderBottom = h;

  console.log("[Console] Successivly Enlarged game. Size: Width: " + gameServer.config.borderBottom + ", Height: " + gameServer.config.borderTop);
  }
};
