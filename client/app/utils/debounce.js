"use strict";

module.exports = function(func, wait, immediate) {

    var timeout;
    return function() {

        var context = this, args = arguments;

        return new Promise(function(resolve) {
            var later = function() {
                timeout = null;
                if (!immediate) resolve(func.apply(context, args));
            };

            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);

            if (callNow) resolve(func.apply(context, args));
        });
    };
};

