/*
 * Handy dev methods
*/

/*
 * For use with promises
*/

export function printTrace(x) {
    console.error(x.stack)
    return x
}

export function print(x) {
    console.log(x);
    return x
}
