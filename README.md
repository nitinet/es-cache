# es-cache
A simple in-memory cache on ecmascript 6 and typescript.

## Installation

    npm install es-cache

## Usage

```javascript
var Cache = require('es-cache');
var cache = new Cache();

// now just use the cache

cache.put('foo', 'bar');
console.log(cache.get('foo'))

// that wasn't too interesting, here's the good part

cache.put('houdini', 'disappear', 100) // Time in ms
console.log('Houdini will now ' + cache.get('houdini'));

setTimeout(function() {
  console.log('Houdini is ' + cache.get('houdini'));
}, 200);
```

which should print

    bar
    Houdini will now disappear
    Houdini is null

## API

### put = function(key, value, time, callback)

* Simply stores a value
* If value is a function then function returned value is cached.
* If time isn't passed in, it is stored forever
* If time is passed then value is refreshed after the specified time using the specified function. Will actually remove the value in the specified time in ms (via `setTimeout`)
* executes the callback function when value is removed.
* Returns the cached value

### get = function(key)

* Retrieves a value for a given key
* If value isn't cached, returns `null`

### del = function(key)

* Deletes a key, returns a boolean specifying whether or not the key was deleted

### clear = function()

* Deletes all keys

### size = function()

* Returns the current number of entries in the cache

### keys = function()

* Returns all the cache keys


## Note on Patches/Pull Requests

* Fork the project.
* Make your feature addition or bug fix.
* Send me a pull request.
