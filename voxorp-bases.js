"use strict";
// v0.0.1

var hiddenLogs = [],
/** @type {Array<string>} */
  imgIDs = [],
/** @type {Array<HTMLImageElement>} */
  images = [];
/**
 * @typedef {number} integer
 */
/**
 * @param {VoxTile|array|string} tile / type
 * @param {string} name
 * @param {integer} x
 * @param {integer} y
 * @param {integer} rotation
 * @returns {VoxTile}
 */
function VoxTile(tile) {
  if (tile instanceof VoxTile) {
  /** @type {string} */
    this.type = tile.type;
  /** @type {string} */
    this.name = tile.name;
  /** @type {integer} */
    this.x = tile.x;
  /** @type {integer} */
    this.y = tile.y;
  /** @type {integer} */
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
    throw new TypeError("2. argument \"name\" is not type of string");
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

/** unsealed Typed array!
 * @constructor
 * @param {Array<object|Array<>>} arr
 * @returns {renderedVoxObjects}
 */
function RenderedVoxObjects(arr) {
  Object.setPrototypeOf(this, Array.prototype);
  for (var i = this.length = arr.length; i-- > 0;)
  /** @type {VoxTile} */
    this[i] = new VoxTile(arr[i]);
  /** @type {function} attaches existing or creates new VoxTile */
  this.push = function push() {
    for (var i = arguments.length, args = [], a; i-- > 0;) {
      a = arguments[i];
      args[i] = a instanceof VoxTile ? a : new VoxTile(a);
    }
    return [].push.apply(this, args);
  }
}
/** position which tile has to be inserted in or replaced for
 * @typedef {object} index
 * @property {number} index.i
 * @property {boolean} index.insert
 */
/** binary search from RenderedVoxObjects 
 * @param {RenderedVoxObjects} where
 * @param {number} x tile position
 * @param {number} y tile position
 * @returns {number} index to insert or replace tile
*/
function binaryFindPos(where, x, y) {
  var bottom = 0, top = 0, middle;
  while (1) {
    middle = Math.floor((bottom + top) / 2 + 1);
    if (bottom === top)
      return {i: middle, insert: !0};
    if (x > where[middle].x && y > where[middle].y)
      bottom = middle;
    else if (x === where[middle].x && y === where[middle].y)
      return {i: middle, insert: !1};
    else
      top = middle - 1;
  }
}

var rendered = new RenderedVoxObjects([["building", "Wall", 0, 0, null], ["building", "Scorer", 0, 4, null]]);
(rendered[1])
function placeRandomTile(x, y) {
  var rand = Math.random() * 5 | 0, index = binaryFindPos(rendered, x, y);
  var name = "Wall,Scorer,Dynamo empty,Crate,Laser tile".split(",")[rand];
  var tile = new VoxTile("building", name, x, y, null);
  if (index.insert) {
    for (var i = index.i; i < rendered.length && rendered[i];)
      i++;
    if (i >= rendered.length)
      rendered.push(rendered[--i]);
    for (; i > index.i; i--)
      rendered[i] = rendered[i - 1];
  }
  rendered[i] = tile;
  render();
}

/*function placeRect(x0, y0, x1, y1) {
  var i = 0, ;
  while (x0 < x1)
    ;
}*/

// ! overwrites function press for handling UIs from previous scripts
function press(x, y) {
  placeRandomTile(x, y);
}

// ! overwrites function render for rerendering from previous scripts
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
      render();
    };
  }

  ctx.reset();
  while (i-- > 0)
  // unloaded images returns null, undefined image returns undefined
    if (r[i] && imageByName(r[i].name)) {
      ctx.drawImage(img, r[i].x * sc + vX, r[i].y * sc + vY, sc, sc);
    }
}
