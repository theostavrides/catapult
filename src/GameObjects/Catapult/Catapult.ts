import { Scene } from "@babylonjs/core/scene";
import { SceneLoader, AbstractMesh, Vector3, MeshBuilder, Mesh } from '@babylonjs/core'



export class Catapult {
    mesh: AbstractMesh
    cameraTarget: Mesh

    constructor(scene: Scene, mesh: AbstractMesh){
        this.mesh = mesh
        
        this.cameraTarget = MeshBuilder.CreateBox("cameraTarget", {size: .25 }, scene);
        this.cameraTarget.position = new Vector3(0, 4.75, 0);
        this.mesh.addChild(this.cameraTarget)   
        this.cameraTarget.visibility = 0
    }
}

export const createCatapult = async (scene: Scene) => {
    const result = await SceneLoader.ImportMeshAsync(["Catapult"],'models/', 'catapult.glb', scene)
    const catapultMesh = result.meshes[0]
    catapultMesh.scaling = new Vector3(-1,1,1)
    catapultMesh.rotation = new Vector3(0,0,0)

    catapultMesh.name = "catapultContainer"

    return new Catapult(scene, catapultMesh)
}

export default createCatapult