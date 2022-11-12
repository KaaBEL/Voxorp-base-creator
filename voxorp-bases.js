"use strict";
// v0.0

var hiddenLogs = [],
  /** @type {Array<string>} */ imgIDs = [],
  /** @type {Array<HTMLImageElement>} */ images = [];

/**
 * @constructor
 * @param {VoxTile|array|string} tile
 * @returns {VoxTile}
 */
function VoxTile(tile) {
  if (tile instanceof VoxTile) {
    this.type = tile.type;
    this.name = tile.name;
    this.x = tile.x;
    this.y = tile.y;
    this.rotation = tile.rotation;
    Object.seal(this);
    return ;
  }
  var a = tile instanceof Array ? tile : arguments, type;
  type = ["building", "ship"].indexOf(a[0]);
  hiddenLogs.push([a[0], a[1], a[2], a[3], a[4]]);
  if (typeof a[0] !== "string")
    throw new TypeError("1. argument \"type\" is not type of string");
  if (type < 0)
    // keys: building, ship
    throw new TypeError("unknown key value of 1. argument \"type\"");
  if (a.length !== 5)
    throw new TypeError("VoxTile costructor requires 5 arguments:" +
      " type, x, y, rotation");
  if (typeof a[1] !== "string")
    throw new TypeError("1. argument \"name\" is not type of string");
  if (!Number.isInteger(a[2]))
    throw new TypeError("3. argument \"x\" is not an integer");
  if (!Number.isInteger(a[3]))
    throw new TypeError("4. argument \"y\" is not an integer");
  if (type ? !Number.isInteger(a[4]) : a[4] !== null)
    throw new TypeError("5. argument \"rotation\" is not " +
      (type ? "an integer" : "null"));
  this.type = a[0];
  this.name = a[1];
  this.x = a[2];
  this.y = a[3];
  this.rotation = a[4];
  Object.seal(this);
}

/**
 * @constructor
 * @param {Array<object|Array<>>} arr
 * @ typedef {Array<VoxTile>} RenderedVoxObjects
 * @returns {RenderedVoxObjects}
 */
function RenderedVoxObjects(arr) {
  Object.setPrototypeOf(this, Array.prototype);
  for (var i = this.length = arr.length; i-- > 0;)
    this[i] = new VoxTile(arr[i]);
  this.push = function push() {
    for (var i = arguments.length, args = [], a; i-- > 0;) {
      a = arguments[i];
      args[i] = a instanceof VoxTile ? a : new VoxTile(a);
    }
    [].push.apply(this, args);
    return this.length;
  }
}

var rendered = new RenderedVoxObjects([["building", "Wall", 0, 0, null], ["building", "Scorer", 0, 4, null]]);
(rendered[1])
// ! overwrites function init for intialization from previous scripts
function render() {
  var i = rendered.length, img, r = rendered;
  function imageByName(name) {
    var id = imgIDs.indexOf(name);
    if (id >= 0)
      return img = images[id];
    img = new Image();
    img.src = "./voxorp tiles/" + name + ".svg";
    img.id = images.length;
    imgIDs.push(name);
    images.push(null);
    img.onload = function setImage() {
      images[this.id] = this;
    };
    setTimeout(render, 100);
  }

  ctx.reset();
  while (i-- > 0)
  // unloaded images returns null, undefined image returns undefined
    if (r[i] && imageByName(r[i].name)) {
      ctx.drawImage(img, r[i].x * sc + vX, r[i].y * sc + vY, sc, sc);
    }
}

// ! overwrites function init for intialization from previous scripts
function init() {
  resizeWindow();
}

window.onresize = function () {
  var  w = window.innerWidth, h = window.innerHeight, ratio;
  if (w > 4096 || h > 4096)
    if (w > h) {
      h = h * 4096 / w;
      w = 4096;
    } else {
      w = w * 4096 / h;
      h = 4096;
    }
  canvas.width = w;
  canvas.height = h;
  render();
}
