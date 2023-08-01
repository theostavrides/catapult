import { Scene } from "@babylonjs/core/scene";
import { SceneLoader, TransformNode } from '@babylonjs/core'

export class Rock {
    public transformNode: TransformNode
    private _scene: Scene

    constructor(
        scene: Scene, 
        transformNode: TransformNode, 
    ){
        this.transformNode = transformNode
        this._scene = scene
    
    }
}

export const createRock = async (scene: Scene) => {
    const result = await SceneLoader.ImportMeshAsync(["Rock"],'models/', 'catapult.glb', scene)
    
    const transformNode = new TransformNode("Rock")
    const root = result.meshes[0]
    
    const rockModel = root.getChildren().find(c => c.name === "Rock")

    rockModel!.parent = transformNode

    root.dispose()
 
    return new Rock(scene, transformNode)
}

export default createRock