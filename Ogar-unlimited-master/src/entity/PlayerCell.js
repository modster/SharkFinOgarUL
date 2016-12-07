var Cell = require('./Cell');

function PlayerCell() {
  Cell.apply(this, Array.prototype.slice.call(arguments));

  this.cellType = 0;
  this.skin;
  this.recombineTicks = 0; // Ticks passed after the cell has split
  this.shouldRecombine = false; // Should the cell combine. If true, collision with own cells happens

  this.ignoreCollision = false; // This is used by player cells so that they dont cause any problems when splitting
  this.restoreCollisionTicks = 0; // Ticks after which collision is restored on a moving cell
}

module.exports = PlayerCell;
PlayerCell.prototype = new Cell();

// Main Functions
PlayerCell.prototype.onAutoMove = function (gameServer) {
  // Restore collision
  if (this.restoreCollisionTicks > 0) {
    this.restoreCollisionTicks--;
    if (this.restoreCollisionTicks <= 0) {
      this.ignoreCollision = false;
    }
  }
};
PlayerCell.prototype.visibleCheck = function (box, centerPos) {
  // Use old fashioned checking method if cell is small
  if (this.mass < 100) {
    return this.collisionCheck(box.bottomY, box.topY, box.rightX, box.leftX);
  }

  // Checks if this cell is visible to the player
  var cellSize = this.getSize();
  var lenX = cellSize + box.width >> 0; // Width of cell + width of the box (Int)
  var lenY = cellSize + box.height >> 0; // Height of cell + height of the box (Int)

  return (this.abs(this.position.x - centerPos.x) < lenX) && (this.abs(this.position.y - centerPos.y) < lenY);
};

PlayerCell.prototype.simpleCollide = function (x1, y1, check, d) {
  // Simple collision check
  var len = d >> 0; // Width of cell + width of the box (Int)

  return (this.abs(x1 - check.position.x) < len) &&
    (this.abs(y1 - check.position.y) < len);
};

PlayerCell.prototype.calcMergeTime = function (base) {
  // The recombine mechanic has been completely revamped.
  // As time passes on, recombineTicks gets larger, instead of getting smaller.
  // When the owner has only 1 cell, ticks and shouldRecombine will be reset by gameserver.
  var r = false;
    if (this.owner.recombineinstant) {
    r = true; // If base recombine time is 0, instantly recombine
  } else {
    if (base == 0) {
      var rec = 0.5; 
  } else 
    var rec = Math.floor(base + ((0.02 * this.mass))); // base seconds + 0.02% of mass
      if (this.recombineTicks > rec) 
      r = true; // Can combine with other cells
  } 
  //probably an easier way of doing this, but im too lazy
  if (this.owner.gameServer.config.playerRecombineTime <= 0) { 
    var r = false;
      if (base == 0 || this.owner.recombineinstant) {
      r = true; // If base recombine time is less than or equal to 0, instantly recombine
  } else {
    var rec = Math.floor(base); // base seconds + 0.02% of mass
    if (this.recombineTicks > rec) 
    r = true; // Can combine with other cells
    }
  }
  this.shouldRecombine = r;
};

PlayerCell.prototype.calcMove = function (x2, y2, gameServer) {
  var config = gameServer.config;
  var r = this.getSize(); // Cell radius

  // Get angle
  var deltaY = y2 - this.position.y;
  var deltaX = x2 - this.position.x;
  var angle = Math.atan2(deltaX, deltaY);

  if (isNaN(angle)) {
    return;
  }
  if (this.owner.frozen || (!this.owner.verify && this.owner.gameServer.config.verify == 1)) {
    return;
  }


  // Distance between mouse pointer and cell
  var dist = this.getDist(this.position.x, this.position.y, x2, y2);
  var speed = Math.min(this.getSpeed(), dist);

  var x1 = this.position.x + (speed * Math.sin(angle));
  var y1 = this.position.y + (speed * Math.cos(angle));
  var xd = 0;
  var yd = 0;

  // Collision check for other cells
  for (var i = 0; i < this.owner.cells.length; i++) {
    var cell = this.owner.cells[i];

    if ((this.getId() == cell.getId()) || (this.ignoreCollision) || (cell.ignoreCollision)) {
      // Don't collide with cell that has ignoreCollision on, when I have ignoreCollision on, or with yourself
      continue;
    }

    if ((!cell.shouldRecombine) || (!this.shouldRecombine)) {
      // Cannot recombine - Collision with your own cells
      var collisionDist = cell.getSize() + r; // Minimum distance between the 2 cells
      dist = this.getDist(x1, y1, cell.position.x, cell.position.y); // Distance between these two cells
      if (!this.simpleCollide(x1, y1, cell, collisionDist)) {
        // Skip
        continue;
      }

     // Calculations
      if (dist < collisionDist) { // Collided
        // The moving cell pushes the colliding cell
        // Strength however depends on cell1 speed divided by cell2 speed
        var c1Speed = this.getSpeed();
        var c2Speed = cell.getSpeed();
      
        // TODO: need to simplify mult
        var mult = config.splitMult; //pushback, cell squishing, strength of small cells, snappiness, etc.

        if (config.splitversion == 1) {
          var mult = c1Speed / c2Speed / 2;
          if (mult < 0.15) mult = 0.15;
          if (mult > 0.9) mult = 0.9;
        }
        var newDeltaY = y1 - cell.position.y;
        var newDeltaX = x1 - cell.position.x;

        var newAngle = Math.atan2(newDeltaX, newDeltaY);
        
        var move = (collisionDist - dist) * mult; 
          if(Math.random() > 0.5) {
            //cells switch order:
            x1 = x1 + (move * Math.sin(newAngle)) >> 0;
            y1 = y1 + (move * Math.cos(newAngle)) >> 0;
              }
          else {
            //cells don't switch order:
            xd += (move * Math.sin(newAngle));
            yd += (move * Math.cos(newAngle));
        }
      }
    }
  }

  var xSave = this.position.x;
  var ySave = this.position.y;
  gameServer.gameMode.onCellMove(x1, y1, this);
  x1 += xd + (this.position.x - xSave);
  y1 += yd + (this.position.y - ySave);
  // Check to ensure we're not passing the world border (shouldn't get closer than a quarter of the cell's diameter)
  if (x1 < config.borderLeft + r / 2) {
    x1 = config.borderLeft + r / 2;
  }
  if (x1 > config.borderRight - r / 2) {
    x1 = config.borderRight - r / 2;
  }
  if (y1 < config.borderTop + r / 2) {
    y1 = config.borderTop + r / 2;
  }
  if (y1 > config.borderBottom - r / 2) {
    y1 = config.borderBottom - r / 2;
  }

  this.position.x = x1 >> 0;
  this.position.y = y1 >> 0;
  if (this.gameServer) this.quadUpdate(this.gameServer);
};

// Override

PlayerCell.prototype.getEatingRange = function () {
  return this.getSize() * .4;
};

PlayerCell.prototype.onConsume = function (consumer, gameServer) {
  if (!this.owner.verify && this.owner.gameServer.config.verify == 1) {


  } else {
    // Add an inefficiency for eating other players' cells
    var factor = (consumer.owner === this.owner ? 1 : gameServer.config.massAbsorbedPercent / 100);
    // Anti-bot measure
    factor = (consumer.mass >= 625 && this.mass <= 17 && gameServer.config.playerBotGrowEnabled == 1) ? 0 : factor;
    consumer.addMass(factor * this.mass);
  }
};

PlayerCell.prototype.onAdd = function (gameServer) {
  // Add to special player node list
  gameServer.addNodesPlayer(this);
  // Gamemode actions
  gameServer.gameMode.onCellAdd(this);
};

PlayerCell.prototype.onRemove = function (gameServer) {
  var index;
  // Remove from player cell list
  index = this.owner.cells.indexOf(this);
  if (index != -1) {
    this.owner.cells.splice(index, 1);
  }
  // Remove from special player controlled node list
  gameServer.removeNodesPlayer(this);

  // Gamemode actions
  gameServer.gameMode.onCellRemove(this);
};

PlayerCell.prototype.moveDone = function (gameServer) {
  this.ignoreCollision = false;
};

// Lib

PlayerCell.prototype.abs = function (x) {
  return x < 0 ? -x : x;
};

PlayerCell.prototype.getDist = function (x1, y1, x2, y2) {
  var xs = x2 - x1;
  xs = xs * xs;

  var ys = y2 - y1;
  ys = ys * ys;

  return Math.sqrt(xs + ys);
};
