import { 
    Vector3, MeshBuilder, Mesh, Space, TransformNode, 
    AnimationGroup, setAndStartTimer, AbstractMesh, PhysicsShapeSphere, PhysicsAggregate, PhysicsShapeType, PhysicsViewer, PhysicsBody, PhysicsMotionType, Sound
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
    projectile: TransformNode|null = null
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
        level: Level,
        position: Vector3 = new Vector3(0,0,0),
        rotation: Vector3 = new Vector3(0,0,0),
    ){
        this.level = level

        this.transformNode = this.level.assets.catapult
        this.transformNode.position = position
        this.transformNode.rotation = rotation

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
        this._loadProjectile()

        this._initAnimationObservables()

        this._registerLoop()        
    } 

    private async _loadProjectile(){
        this.projectile = this.level.assets.clonables.rock.clone('rock', null)!
        this.projectile.parent = this.bucket
        this.projectile.position = new Vector3(0, -.12,-.128)
    }

    private async _initAnimationObservables(){
        this._animations.reload.onAnimationGroupEndObservable.add(() => {
            this._isReloading = false
            this._loadProjectile()
        })

        this._animations.fire.onAnimationGroupEndObservable.add(() => {                
            if (this.projectile){                    
                // const viewer = new PhysicsViewer(this.level.scene)
                
                const oldPosition = this.projectile.getAbsolutePosition()
                this.projectile.parent = null
                this.projectile.position = oldPosition.clone()
                
                const shape = new PhysicsShapeSphere(
                    new Vector3(0,0,0), // center of the sphere in local space
                    .2, // radius of the sphere
                    this.level.scene // containing scene
                );

                const body = new PhysicsBody(this.projectile, PhysicsMotionType.DYNAMIC, false, this.level.scene)
                body.shape = shape
                body.setMassProperties({ mass: 500 })
                
                const catapultRotation = this.transformNode.rotationQuaternion?.toEulerAngles() || this.transformNode.rotation

                const projectileSpeed = 50
                const velocityX = projectileSpeed * Math.sin(catapultRotation!.y)
                const velocityY = projectileSpeed * Math.cos(catapultRotation!.y)

                this.projectile.physicsBody?.setLinearVelocity(new Vector3(velocityX, 10, velocityY))
                this.projectile.physicsBody?.setAngularVelocity(new Vector3(Math.random() * 10, Math.random() * 10, Math.random() * 10))
                // viewer.showBody(this.projectile.physicsBody!);
                this.projectile = null
            }

            this._isReloading = true
            this._isFiring = false

            // Reload after 1 second pause
            setAndStartTimer({
                timeout: 1000, 
                contextObservable: this.level.scene.onBeforeAnimationsObservable,
                onEnded: () => {
                    this._animations.reload.play()
                }
            })
        })

    }

    private async _fireCatapult(){
        if (this._isFiring === false && this._isReloading === false) {
            this._isFiring = true
            this._animations.fire.play()

            const catapultFiringSound = new Sound("catapultFiringSound", "sound/catapult_firing_sound.mp3", this.level.scene, function () {
                catapultFiringSound.play();
            }, {
                playbackRate: 1.5,
                offset: .3
            });
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