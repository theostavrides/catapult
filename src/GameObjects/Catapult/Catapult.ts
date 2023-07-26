import { Scene } from "@babylonjs/core/scene";
import { SceneLoader, Node } from '@babylonjs/core'



export class Catapult {
    node: Node

    constructor(catapultNode: Node){
        this.node = catapultNode
    }
}

export const createCatapult = async (scene: Scene) => {
    const result = await SceneLoader.ImportMeshAsync(["Catapult"],'models/', 'catapult.glb', scene)
    const catapultNode = result.meshes[0].getChildren()[0]
    catapultNode.parent = null
    result.meshes[0].dispose()
    return new Catapult(catapultNode)
}

export default createCatapult