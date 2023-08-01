import { Scene } from "@babylonjs/core/scene";
import { 
    SceneLoader, Vector3, MeshBuilder, Mesh, Space, TransformNode, AnimationGroup, ISceneLoaderAsyncResult, setAndStartTimer
 } from '@babylonjs/core'
import InputController from "../InputController";

interface IAnimations {
    fire: AnimationGroup
    reload: AnimationGroup
}

export class Catapult {
    public transformNode: TransformNode
    public cameraTarget: Mesh
    private _input: InputController
    private _scene: Scene
    private _animations: IAnimations

    // Movement Variables
    private _deltaTime = 0
    private _movementZ = 0
    private _rotationY = 0
    private _moveDirection = new Vector3()
    private _inputAmt = 0

    // Action variables
    private _isFiring = false
    private _isReloading = false

    constructor(
        scene: Scene, 
        transformNode: TransformNode, 
        inputController: InputController,
        animations: IAnimations
    ){
        this.transformNode = transformNode
        this._scene = scene
        this._input = inputController
        this._animations = animations
        this.cameraTarget = MeshBuilder.CreateBox("cameraTarget", {size: .25 }, scene);
        this.cameraTarget.position = new Vector3(0, 4.75, 0);
        this.cameraTarget.parent = transformNode
        this.cameraTarget.visibility = 0

        this._registerLoop()        
    } 

    private async _fireCatapult(){
        if (this._isFiring === false && this._isReloading === false) {
            this._isFiring = true
            this._animations.fire.play()

            this._animations.fire.onAnimationGroupEndObservable.add(() => {
                this._isReloading = true
                this._isFiring = false

                setAndStartTimer({
                    timeout: 1000, 
                    contextObservable: this._scene.onBeforeRenderObservable,
                    onEnded: () => {
                        this._animations.reload.play()
        
                        this._animations.reload.onAnimationGroupEndObservable.add(() => {
                            this._isReloading = false
                        })
                    }
                })
            })

        }
    }

    private _updateFromControls(){
        this._deltaTime = this._scene.getEngine().getDeltaTime() / 1000.0;
        this._rotationY = this._input.rotation / 120 //right, x
        this._movementZ = this._input.forward / 7 //fwd, z
        
        // Catapult Translation
        if (this._input.forwardAxis !== 0) {
            this.transformNode.locallyTranslate(new Vector3(0,0,this._movementZ))
        }

        // Catapult Rotation
        if (this._input.rotationAxis !== 0) {
            const rotationDirection = this._input.forwardAxis >= 0 ? 1 : -1
            this.transformNode.rotate(new Vector3(0,1,0), rotationDirection * this._rotationY, Space.WORLD)
        }

        // Wheel Rotation
        if (this._input.forwardAxis === 0) {
            if (this._input.rotationAxis !== 0) {
                // Wheel Rotation when not moving forward or backwards but only turning
                
                const rotationAmount = this._input.rotationAxis * .015

                this.transformNode.getChildMeshes(false, (n) => n.name.startsWith("Wheel.")).filter(n => {
                    if (n.name === "Wheel.fr" || n.name === "Wheel.br") {
                        n.rotate(new Vector3(0,1,0), -1 * rotationAmount)
                    } else {
                        n.rotate(new Vector3(0,1,0), rotationAmount)
                    }
                })
            }
        } else {
            // Wheel Rotation when moving forward or backwards
            this.transformNode.getChildMeshes(false, (n) => n.name.startsWith("Wheel")).filter(n => {
                const rotationAmount = -1 * this._movementZ / 5
                n.rotate(new Vector3(0,1,0), rotationAmount)
            })
        }

 
        // Shoot
        if (this._input.shoot) {
            this._fireCatapult()
        }

    }


    private _registerLoop(){
        this._scene.registerBeforeRender(() => {
            this._updateFromControls()
        })
    }
}

// Reorganize imported animation groups to make them easy to use.
const reorganizeAnimationGroups = (result: ISceneLoaderAsyncResult, scene: Scene) : IAnimations => {
    const importedAnimationGroups = result.animationGroups

    const reloadAnimationGroup = new AnimationGroup('reload', scene)
    const fireAnimationGroup = new AnimationGroup('fire', scene)
   
    importedAnimationGroups.forEach(animG => {
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

    const animations = {
        reload: reloadAnimationGroup,
        fire: fireAnimationGroup,
    }

    return animations
}

export const createCatapult = async (scene: Scene, inputController: InputController) => {
    const result = await SceneLoader.ImportMeshAsync(["Catapult"],'models/', 'catapult.glb', scene)
    
    const transformNode = new TransformNode("CatapultTransformNode")
    const root = result.meshes[0]
    
    const catapultModel = root.getChildren().find(c => c.name === "Catapult")

    catapultModel!.parent = transformNode

    root.dispose()

    const animations = reorganizeAnimationGroups(result, scene)
 
    return new Catapult(scene, transformNode, inputController, animations)
}

export default createCatapult