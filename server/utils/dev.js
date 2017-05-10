/*
 * Handy dev methods
*/

/*
 * For use with promises
*/

function printTrace(x) {
    console.error(x.stack)
    return x
}

function print(x) {
    console.log(x);
    return x
}

module.exports = {
    printTrace,
    print
}
