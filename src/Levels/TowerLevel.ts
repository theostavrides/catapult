// import { Inspector } from '@babylonjs/inspector';

import "@babylonjs/loaders/glTF";
import { Scene } from "@babylonjs/core/scene";
import { 
    MeshBuilder, Vector3, Color3, Color4, StandardMaterial,
    PhysicsAggregate, PhysicsShapeType, 
    HemisphericLight,
    FollowCamera,
    TransformNode,
    SceneLoader,
    AssetContainer,
    FreeCamera,
    AnimationGroup,
    UniversalCamera,
} from "@babylonjs/core";

// import { FireProceduralTexture, GrassProceduralTexture, MarbleProceduralTexture, StarfieldProceduralTexture, WoodProceduralTexture} from '@babylonjs/procedural-textures'
import "@babylonjs/core/Physics/physicsEngineComponent";

// If you don't need the standard material you will still need to import it since the scene requires it.
import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/Materials/";
import { havokModule } from "../externals/havok";
import { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";
import { type Game } from "../Game";
import { type Catapult } from "../GameObjects/Catapult";
import InputController from "../InputController";

export interface Level {
    scene: Scene // The unique scene for the level
}

interface ITowerLevelParams {
    game: Game
    scene: Scene
    inputController: InputController
}

class TowerLevel implements Level {
    scene: Scene
    game: Game
    private _input: InputController

    constructor({ game, scene, inputController } : ITowerLevelParams ){
        this.scene = scene
        this.game = game
        this._input = inputController

        this._initCamera()
        this._initLights()        
        this._initGround()
        this._initDebugger()
    }

    private _initCamera(){
        const camera = new UniversalCamera('fc', new Vector3(10,1,10), this.scene)
        camera.attachControl(this.game.canvas, true);
        // const camera = new FollowCamera("FollowCam", new Vector3(0, 4, 0), this.scene, this.catapult.cameraTarget)
        // camera.rotationOffset = 180
        // camera.heightOffset = 0
        // camera.radius = 13
    }

    private _initLights(){
        new HemisphericLight("hl1", new Vector3(0, 1, 0), this.scene)
        // new DirectionalLight("DirectionalLight", new Vector3(0, -1, 0), this.scene);
    }


    private _initGround(){
        const ground = MeshBuilder.CreateGround("ground", {width: 100, height: 100}, this.scene);
        const material = new StandardMaterial("groundMaterial", this.scene)

        material.diffuseColor = new Color3(.5, .5, .5);
        material.ambientColor = new Color3(0.23, 0.98, 0.53);
        ground.material = material

        new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0 }, this.scene);

    }

    private _initDebugger(){
        window.addEventListener("keydown", (ev) => {
            if (ev.shiftKey && ev.ctrlKey && ev.key === 'I') {
                if (this.scene.debugLayer.isVisible()) {
                    this.scene.debugLayer.hide();
                } else {
                    this.scene.debugLayer.show();
                }
            }
        })
    }
}

const createTowerLevel = async ({ game } : { game: Game }) => {
    const scene = new Scene(game.engine)
    scene.enablePhysics(null, new HavokPlugin(true, await havokModule));
    scene.clearColor = new Color4(0, 0, 0, 1);

    const inputController = new InputController(scene)
        
    const loadTowerLevelModules = async () => {
        console.log('i is call')
        return Promise.all([havokModule])
    }

    await Promise.all([
        importModelsAndAnimations(scene),
        loadTowerLevelModules
    ])
        
    return new TowerLevel({ 
        game, 
        scene, 
        inputController,
    })
}

const importModelsAndAnimations = async (scene: Scene) => {
    // Add models to the existing scene.
    await SceneLoader.AppendAsync('models/','catapult.glb', scene)

    const reorganizeModels = () => {
        const root = scene.meshes[0]

        const catapultTransformNode = new TransformNode("CatapultModel", scene)
        const rockTransformNode = new TransformNode("RockModel", scene)

        const catapultModel = root.getChildren().find(c => c.name === "Catapult")
        catapultModel!.parent = catapultTransformNode

        const rockModel = root.getChildren().find(c => c.name === "Rock")
        rockModel!.parent = rockTransformNode
    
        // Disable the mesh as we will only use this as a reference to clone
        const disableModel = (node: TransformNode) => {
            node.getChildMeshes().forEach(m => m.setEnabled(false))
        }

        // disableModel(catapultTransformNode)
        // disableModel(rockTransformNode)

        root.dispose()
    }

    const reorganizeAnimationGroups = () => {    
        const fireAnimationGroup = new AnimationGroup('fire_clean', scene)
        const reloadAnimationGroup = new AnimationGroup('reload_clean', scene)
       
        const toDispose: AnimationGroup[] = []

        scene.animationGroups.forEach(ag => {
            if (ag.name === 'Reload' || ag.name.startsWith("Reload.")){
                ag.targetedAnimations.forEach(targetedAnimation => {
                    reloadAnimationGroup.addTargetedAnimation(targetedAnimation.animation, targetedAnimation.target)
                })  
            }
            if (ag.name === 'Fire' || ag.name.startsWith("Fire.")){
                ag.targetedAnimations.forEach(targetedAnimation => {
                    fireAnimationGroup.addTargetedAnimation(targetedAnimation.animation, targetedAnimation.target)
                })  
            }

            if (!ag.name.endsWith('_clean')) {
                toDispose.push(ag)
            }
        })

        toDispose.forEach(ag => ag.dispose())

        // scene.animationGroups.forEach(animG => {
        //     if (!animG.name.endsWith('_clean')){
        //         animG.dispose()
        //     }
        // })

        // scene.animationGroups.push(fireAnimationGroup)
        // scene.animationGroups.push(reloadAnimationGroup)

        console.log(scene.animationGroups)
    }

    reorganizeAnimationGroups()
    // reorganizeModels()

}

export default createTowerLevel