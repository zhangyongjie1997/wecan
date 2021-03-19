const MODULE_TYPES = {
    NORMAL: 1,
    CONCATFILE: 2,
}

class ModuleNode {
    type = ''
    id = null
    file = null
    constructor(id, file, type=MODULE_TYPES.NORMAL) {
        this.id = id
        this.file = file
        this.type = type
    }
}

class ModuleGraph {
    /**
     * @type {Map<string, ModuleNode>}
     */
    __modules = new Map()

    addModule(id, file) {
        let fileType
        if(typeof file === 'string'){
            fileType = MODULE_TYPES.NORMAL
        }else if(typeof file === 'object'){
            fileType = MODULE_TYPES.CONCATFILE
        }
        const module = new ModuleNode(id, file, fileType)
        this.__modules.set(id, module)
    }

    searchModuleById(id) {
        if(this.__modules.has(id)){
            return this.__modules.get(id).file
        }
        return null
    }
}

module.exports = {
    ModuleGraph,
    MODULE_TYPES
}
