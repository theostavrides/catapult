import { Scene } from "@babylonjs/core/scene";
import { AssetContainer, Mesh, SceneLoader, TransformNode } from '@babylonjs/core'

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

export const createRockContainer = async (scene: Scene) => {
    const result = await SceneLoader.ImportMeshAsync(["Rock"],'models/', 'catapult.glb', scene)
    
    const container = new AssetContainer(scene)

    const root = result.meshes[0]
    
    const rockModel = root.getChildren().find(c => c.name === "Rock")

    if (rockModel instanceof Mesh) {
        container.meshes.push(rockModel)
    }

    root.dispose()
 
    return container
}

export default createRockContainer