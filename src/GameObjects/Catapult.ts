import { Scene } from "@babylonjs/core/scene";
import { 
    Vector3, MeshBuilder, Mesh, Space, TransformNode, 
    AnimationGroup, setAndStartTimer, AbstractMesh
 } from '@babylonjs/core'
import { Level } from "../Levels/TowerLevel";

interface IAnimations {
    fire: AnimationGroup
    reload: AnimationGroup
}

export class Catapult {
    level: Level
    transformNode: TransformNode
    bucket: AbstractMesh
    cameraTarget: Mesh
    
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
        level: Level
    ){
        this.level = level

        this.transformNode = this.level.assets.catapult
        this.bucket = this.transformNode.getChildMeshes().find(m => m.name === "Bucket")!

        // Set up follow camera
        this.cameraTarget = MeshBuilder.CreateBox("cameraTarget", {size: .25 }, this.level.scene)
        this.cameraTarget.position = new Vector3(0, 4.75, 0);
        this.cameraTarget.parent = this.transformNode
        this.cameraTarget.visibility = 0

        // Pull animation groups from scene into an easy to use object
        this._animations = {
            fire: this.level.scene.animationGroups.find(ag => ag.name === "fire_clean")!,
            reload: this.level.scene.animationGroups.find(ag => ag.name === "reload_clean")!,
        }

        // Put catapult into firing position
        this._animations.reload.play()
        this._animations.reload.goToFrame(this._animations.reload.to)
        this._animations.reload.stop()

        // Load rock into bucket
        this._loadRock()

        this._registerLoop()        
    } 

    private async _loadRock(){
        const rock = this.level.assets.clonables.rock.clone('rock', null)!
        rock.parent = this.bucket
        rock.position = new Vector3(0, -.12,-.128)
        // const bucketPos = this.bucket.getAbsolutePosition()
        // rock.position = this.bucket.getAbsolutePosition().clone()
        // rock.position.y += 0.5
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
                    contextObservable: this.level.scene.onBeforeRenderObservable,
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
        this._deltaTime = this.level.scene.getEngine().getDeltaTime() / 1000.0;
        this._rotationY = this.level.inputController.rotation / 120 //right, x
        this._movementZ = this.level.inputController.forward / 7 //fwd, z
        
        // Catapult Translation
        if (this.level.inputController.forwardAxis !== 0) {
            this.transformNode.locallyTranslate(new Vector3(0,0,this._movementZ))
        }

        // Catapult Rotation
        if (this.level.inputController.rotationAxis !== 0) {
            const rotationDirection = this.level.inputController.forwardAxis >= 0 ? 1 : -1
            this.transformNode.rotate(new Vector3(0,1,0), rotationDirection * this._rotationY, Space.WORLD)
        }

        // Wheel Rotation
        if (this.level.inputController.forwardAxis === 0) {
            if (this.level.inputController.rotationAxis !== 0) {
                // Wheel Rotation when not moving forward or backwards but only turning
                
                const rotationAmount = this.level.inputController.rotationAxis * .015

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
        if (this.level.inputController.shoot) {
            this._fireCatapult()
        }

    }


    private _registerLoop(){
        this.level.scene.registerBeforeRender(() => {
            this._updateFromControls()
        })
    }
}



export default Catapult