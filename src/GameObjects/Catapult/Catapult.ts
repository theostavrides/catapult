import { Scene } from "@babylonjs/core/scene";
import { 
    SceneLoader, AbstractMesh, Vector3, MeshBuilder, Mesh, Space, TransformNode
 } from '@babylonjs/core'
import InputController from "../../InputController";



export class Catapult {
    public transformNode: TransformNode
    public cameraTarget: Mesh
    private _input: InputController
    private _scene: Scene

    // Movement Variables
    private _deltaTime = 0
    private _movementZ = 0
    private _rotationY = 0
    private _moveDirection = new Vector3()
    private _inputAmt = 0

    constructor(scene: Scene, transformNode: TransformNode, inputController: InputController){
        this.transformNode = transformNode
        this._scene = scene
        this._input = inputController
        this.cameraTarget = MeshBuilder.CreateBox("cameraTarget", {size: .25 }, scene);
        this.cameraTarget.position = new Vector3(0, 4.75, 0);
        this.cameraTarget.parent = transformNode
        this.cameraTarget.visibility = 0

        this._registerLoop()        
    }

    private _updateFromControls(){
        this._deltaTime = this._scene.getEngine().getDeltaTime() / 1000.0;
        this._rotationY = this._input.rotation / 100 //right, x
        this._movementZ = this._input.forward / 4 //fwd, z
        this.transformNode.rotate(new Vector3(0,1,0), this._rotationY, Space.WORLD)
        // console.log(this.mesh.rotation.)
        // this._moveDirection.set(this._movementZ * this._rotationY,0, this._movementZ * this._rotationY) 
        // this.mesh.moveWithCollisions(this._moveDirection)
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
    const transformNode = new TransformNode("CatapultTransformNode")
    const catapultChildren = result.meshes[0].getChildren()
    catapultChildren.forEach(c => c.parent = transformNode)
    // catapultMesh.scaling = new Vector3(-1,1,1)
    // catapultMesh.rotation = new Vector3(0,0,0)

    // catapultMesh.name = "catapultContainer"
    return new Catapult(scene, transformNode, inputController)
}

export default createCatapult