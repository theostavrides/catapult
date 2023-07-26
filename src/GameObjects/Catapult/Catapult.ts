import { Scene } from "@babylonjs/core/scene";
import { SceneLoader, AbstractMesh, Vector3 } from '@babylonjs/core'



export class Catapult {
    mesh: AbstractMesh

    constructor(scene: Scene, mesh: AbstractMesh){
        this.mesh = mesh

        this.mesh.rotate(new Vector3(0,1,0), Math.PI,)

    }
}

export const createCatapult = async (scene: Scene) => {
    const result = await SceneLoader.ImportMeshAsync(["Catapult"],'models/', 'catapult.glb', scene)
    const catapultMesh = result.meshes[0]
    // catapultNode.parent = null
    // result.meshes[0].dispose()
    return new Catapult(scene, catapultMesh)
}

export default createCatapult