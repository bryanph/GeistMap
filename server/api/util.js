
export function handleError(error, res) {
    if (error.stack) {
        console.error(error.stack)
    }
    else {
        console.error(error)
    }

    // TODO: handle better the error here - 2018-04-30
    res(error)
}

export function handleSuccess(result, res) {
    res(null, result)
}


export function applyInSequence(actions=[], res) {
    /*
     * Apply a sequence of actions in
    */
}

