const path = require('path')
const jade = require('jade')



export const createLoadTemplate = (app) => {

    const mainViewDir = app.get('views')
    const viewEngine = app.get('views')

    return (relativePath, thisProject=true) => {
        /*
         * load template relative to views/ directory
         */

        const prefixPath = thisProject ? '../views/' : mainViewDir
        const templatePath = require.resolve(path.join(prefixPath, relativePath))
        return jade.compileFile(templatePath)
    }
}
