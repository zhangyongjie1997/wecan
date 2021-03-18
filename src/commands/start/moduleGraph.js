class ModuleNode {
    type = ''
    id = null
    file = null
    constructor(){}
}

class ModuleGraph {
    /**
     * @type {Map<string, ModuleNode>}
     */
    __modules = new Map();

    addModule(id, module){

    }

    searchModuleById(id){
        return this.__modules.get(id);
    }
}

module.exports = {
    ModuleGraph
}