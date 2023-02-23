"use strict";
// v0.0.2.10

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
 * @param {Array<object|null|Array<>>} arr
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
      args[i] = a instanceof VoxTile ? a : a ? new VoxTile(a) : null;
    }
    return [].push.apply(this, args);
  }
  this.toString = function toString() {
    for (var i = 0, s = ""; i < this.length; i++)
      if (this[i] === null)
        s += "null; "
      else
        s += this[i].name + "," + this[i].x + "," + this[i].y + "; ";
    return s;
  }
}
/** position which tile has to be inserted in or replaced for
 * @typedef {object} index
 * @property {number} index.i
 * @property {boolean} index.insert
 */
/** binary search in (where) RenderedVoxObjects 
 * @param {RenderedVoxObjects} where
 * @param {number} x tile position
 * @param {number} y tile position
 * @returns {index} index to insert or replace tile
*/
function binaryFindPos(where, x, y) {
  var bottom = 0, top = where.length - 1, middle;
  while (1) {
    if (bottom === top)
      break;
    middle = Math.floor((bottom + top + 1) / 2);
    if (x > where[middle].x || x === where[middle].x && y > where[middle].y)
      bottom = middle;
    else if (y === where[middle].y && x === where[middle].x)
      return {i: middle, insert: !1};
    else
      top = middle - 1;
  }
  middle = top + (x > where[top].x ||
    x === where[top].x && y > where[top].y);
  if (middle === where.length)
    return {i: middle, insert: !1};
  return {i: middle, insert: (y !== where[top].y || x !== where[top].x)};
}

var rendered = new RenderedVoxObjects([["building", "Wall", 0, 0, null]]);

function placeRandomTile(x, y) {
  var rand = Math.random() * 5 | 0, index = binaryFindPos(rendered, x, y);
  var name = "Wall,Scorer,Dynamo empty,Crate,Laser tile".split(",")[rand];
  var tile = new VoxTile("building", name, x, y, null);
  var i = index.i;
  if (index.insert)
    while (i < rendered.length && rendered[i])
      i++;
  if (i >= rendered.length)
    rendered.length++;
  if (index.insert)
    for (; i > index.i; i--)
      rendered[i] = rendered[i - 1];
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
  x = Math.floor((x - vX) / sc);
  y = Math.floor((y - vY) / sc);
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

  canvas.width = canvas.width;
  while (i-- > 0)
  // null in array rendered is empty position
  // unloaded images returns null, undefined image returns undefined
    if (r[i] && imageByName(r[i].name)) {
      ctx.drawImage(img, r[i].x * sc + vX, r[i].y * sc + vY, sc, sc);
    }
}

// voxorp-fun.js
function setRandomTile(x, y) {
  var rand = Math.random() * 5 | 0, index = binaryFindPos(rendered, x, y);
  var name = "Wall,Scorer,Dynamo empty,Crate,Laser tile".split(",")[rand];
  var tile = new VoxTile("building", name, x, y, null);
  var i = index.i;
  if (index.insert)
    while (i < rendered.length && rendered[i])
      i++;
  if (i >= rendered.length)
    rendered.length++;
  if (index.insert)
    for (; i > index.i; i--)
      rendered[i] = rendered[i - 1];
  rendered[i] = tile;
}
var lodBar = new RenderedVoxObjects([]);
function loadB() {
  sc = 40, vX = vY = 0;
  lodBar.push(new VoxTile("building", "Laser tile", lodBar.length, 0, null));
  var r = rendered;
  rendered = lodBar;
  render();
  rendered = r;
}
function tOut() {
if (tOut.f())
  setTimeout(tOut, 1000);
else
  console.warn("end of test");
}
function voxorpFun0() {
  var i = 65535
  tOut.f = function () {
    for (; i-- > 0 && (i & 0x0fff) !== 0x0fff; i)
      setRandomTile(i & 255, i >> 8);
    loadB(console.log(0));
    return i > 0 ? true : voxorpFun1();
  }
  tOut();
}
function voxorpFun1() {
  vX = vY = 0;
  render();
  var i = 0, arr = [1, 2, 4, 6, 8, 12, 16, 24, 32, 48, 64, 96, 129, 255, 432];
  tOut.f = function () {
    sc = 928 / arr[i++];
    render();
    if (i < arr.length)
      return (setTimeout(function () {
        sc = 40;
      }, 9000), !0);
    else
      return !1;
};
  tOut();
}

window.onkeydown = function (e) {
  if (e.key !== "F7")
    return;
  window.onkeydown = null;
  voxorpFun0();
};
var F7 = {valueOf: voxorpFun0};
