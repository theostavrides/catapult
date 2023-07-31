import { Scene } from "@babylonjs/core/scene";
import { 
    SceneLoader, Vector3, MeshBuilder, Mesh, Space, TransformNode, AnimationGroup, ISceneLoaderAsyncResult
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

    // Action variables
    private _isFiring = false
    private _isReloading = false

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

    private _fireCatapult(){
        if (this._isFiring === false && this._isReloading === false) {
            
        }
    }

    private _updateFromControls(){
        this._deltaTime = this._scene.getEngine().getDeltaTime() / 1000.0;
        this._rotationY = this._input.rotation / 120 //right, x
        this._movementZ = this._input.forward / 7 //fwd, z
        
        // Translation
        this.transformNode.locallyTranslate(new Vector3(0,0,this._movementZ))
        
        // Rotation
        const rotationDirection = this._input.forwardAxis >= 0 ? 1 : -1
        this.transformNode.rotate(new Vector3(0,1,0), rotationDirection * this._rotationY, Space.WORLD)

        if (this._input.shoot) {
            this._fireCatapult()
        }

    }


    private _registerLoop(){
        this._scene.registerBeforeRender(() => {
            this._updateFromControls();
            // this._updateCamera();
        })
    }
}

// Reorganize imported animation groups to make them easy to use.
const reorganizeAnimationGroups = (result: ISceneLoaderAsyncResult, scene: Scene) => {
    const animationGroups = result.animationGroups

    const reloadAnimationGroup = new AnimationGroup('Reload', scene)
    const fireAnimationGroup = new AnimationGroup('Fire', scene)
   
    animationGroups.forEach(animG => {
        if (animG.name.startsWith("Reload")){
            animG.targetedAnimations.forEach(targetedAnimation => {
                reloadAnimationGroup.addTargetedAnimation(targetedAnimation.animation, targetedAnimation.target)
           })  
       }
        if (animG.name.startsWith("Fire")){
            animG.targetedAnimations.forEach(targetedAnimation => {
                fireAnimationGroup.addTargetedAnimation(targetedAnimation.animation, targetedAnimation.target)
            })  
        }

        // Get rid of original animation group
        animG.dispose()
    })

    // Set catapult in fully ready position so it can fire.
    reloadAnimationGroup.play(false)
    reloadAnimationGroup.goToFrame(reloadAnimationGroup.to)
}

export const createCatapult = async (scene: Scene, inputController: InputController) => {
    const result = await SceneLoader.ImportMeshAsync(["Catapult"],'models/', 'catapult.glb', scene)
    const transformNode = new TransformNode("CatapultTransformNode")
    const catapultChildren = result.meshes[0].getChildren()
    catapultChildren.forEach(c => c.parent = transformNode)

    reorganizeAnimationGroups(result, scene)
 
    return new Catapult(scene, transformNode, inputController)
}

export default createCatapult