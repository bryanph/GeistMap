
function parseSize(size, defaultSize=100) {
    let userSize = parseInt(size)
    if (userSize < 1 || userSize > 100) {
        return defaultSize
    }

    return size
}

function parsePage(page) {
    return parseInt(page)
}

function parseOffset(size, page) {
    return size * (page - 1)
}

