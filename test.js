/* global describe, it, before, beforeEach, afterEach */
'use strict';

var Cache = require('./index');
var cache = new Cache.default();

// now just use the cache

var w = 0;

cache.put('foo', function() {
  w++;
  return w;
}, 100);

console.log(cache.get('foo'));

// that wasn't too interesting, here's the good part

cache.put('key', 'value', 100); // Time in ms
console.log('key has value: ' + cache.get('key'));

setTimeout(function() {
  console.log('key has value: ' + cache.get('key'));
}, 200);

var f = function() {
  let q = f;
  setTimeout(function() {
    console.log('key has value: ' + cache.get('foo'));
    q();
  }, 200);
};

// f();
