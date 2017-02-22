"use strict"

Function.prototype.bindArgs = function(...boundArgs) {
    /*
     * Bind without setting this
    */

    var context = this;
    return function(...args) {
        return context.call(this, ...boundArgs, ...args)
    }
}

Function.prototype.bindNull = function(...boundArgs) {
    /*
     * Bind with null as first arg
    */

   return this.bind(null, ...boundArgs)
}

export function callPromise(f, cb) {
    /*
     * Assumes a node-style cb with (err, result) args
     * Also, assumes f is curried to accept a cb only
    */
    return new Promise(function(resolve, reject) {
        f(function(err, result) {
            if (err)
                return reject(err)

            return resolve(result)
        })
    })
}

export function wrapPromise(f) {
    /*
     * Assumes a node-style cb with (err, result) args
     * Also, assumes f is curried to accept a cb only
    */

    return (...args) => {
        return callPromise(f.bindArgs(...args))
    }
}

