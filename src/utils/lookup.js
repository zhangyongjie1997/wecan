const fs = require('fs')
const path = require('path')
class Lookup {
    constructor(root, rExcludes, rIncludes) {
        this.root = root || []
        this.rExcludes = rExcludes || []
        this.rIncludes = rIncludes || []
        this.results = []
    }
    /**
     * 向上查找
     * @param {*} formats
     * @param {*} pathOnly
     * @returns
     */
    lookdown() {
        this.__walkdown(this.root)
        return this.results
    }
    /**
     * 向下查找
     * @param {*} formats
     * @param {*} pathOnly
     * @returns
     */
    lookup(formats, pathOnly) {
        this.__walkup(this.root, formats, pathOnly)
        return this.results
    }

    __walkup(dir, formats, pathOnly = false) {
        for (const format of formats) {
            const fullPath = path.join(dir, format)
            if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
                this.results = pathOnly ? fullPath : fs.readFileSync(fullPath, 'utf-8')
                return
            }
        }
        const parentDir = path.dirname(dir)
        if (parentDir !== dir) {
            return this.__walkup(parentDir, formats, pathOnly)
        }
    }

    __walkdown(root) {
        const dirs = fs.readdirSync(root)

        if (!dirs.length) return

        dirs.forEach((dir) => {
            dir = path.join(root, dir)

            const isExcluded = this.rExcludes.some((r) => {
                if (dir.match(r)) {
                    return true
                }
            })
            if (isExcluded) return

            this.rIncludes.some((r) => {
                if (dir.match(r)) {
                    this.results.push(dir)
                    return true
                }
            })

            const stat = fs.statSync(dir)
            if (stat && stat.isDirectory()) {
                this.__walkdown(dir)
            }
        })
    }
}

/**
 *
 * @param {*} root
 * @param {*} rExcludes
 * @param {*} rIncludes
 * @returns
 */
const lookdown = function (root, rExcludes, rIncludes) {
    return new Lookup(root, rExcludes, rIncludes).lookdown()
}

const lookup = function (root, formats, pathOnly) {
    return new Lookup(root).lookup(formats, pathOnly)
}

exports.lookup = lookup
exports.lookdown = lookdown