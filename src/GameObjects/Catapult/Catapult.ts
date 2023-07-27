import { Scene } from "@babylonjs/core/scene";
import { SceneLoader, AbstractMesh, Vector3, MeshBuilder, Mesh } from '@babylonjs/core'
import InputController from "../../InputController";



export class Catapult {
    public mesh: AbstractMesh
    public cameraTarget: Mesh
    private _input: InputController
    private _scene: Scene

    // Movement Variables
    private _deltaTime = 0
    private _h = 0
    private _v = 0
    private _moveDirection = new Vector3()
    private _inputAmt = 0

    constructor(scene: Scene, mesh: AbstractMesh, inputController: InputController){
        this.mesh = mesh
        this._scene = scene
        this._input = inputController
        this.cameraTarget = MeshBuilder.CreateBox("cameraTarget", {size: .25 }, scene);
        this.cameraTarget.position = new Vector3(0, 4.75, 0);
        this.mesh.addChild(this.cameraTarget)   
        this.cameraTarget.visibility = 0

        this._registerLoop()        
    }

    private _updateFromControls(){
        this._deltaTime = this._scene.getEngine().getDeltaTime() / 1000.0;
        this._moveDirection = Vector3.Zero();
        this._h = this._input.horizontal; //right, x
        this._v = this._input.vertical; //fwd, z
        console.log(this._h)
        this._moveDirection = new Vector3(this._h/2, 0, this._v/2)
        this.mesh.moveWithCollisions(this._moveDirection)
    }

    private _registerLoop(){
        this._scene.registerBeforeRender(() => {
            this._updateFromControls();
            // this._updateCamera();
        })
    }
}

export const createCatapult = async (scene: Scene, inputController: InputController) => {
    const result = await SceneLoader.ImportMeshAsync(["Catapult"],'models/', 'catapult.glb', scene)
    const catapultMesh = result.meshes[0]
    catapultMesh.scaling = new Vector3(-1,1,1)
    catapultMesh.rotation = new Vector3(0,0,0)

    catapultMesh.name = "catapultContainer"

    return new Catapult(scene, catapultMesh, inputController)
}

export default createCatapult