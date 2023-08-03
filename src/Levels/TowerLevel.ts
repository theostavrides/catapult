
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
    Node,
    AbstractMesh,
    Mesh,
    PhysicsViewer,
} from "@babylonjs/core";

// import { FireProceduralTexture, GrassProceduralTexture, MarbleProceduralTexture, StarfieldProceduralTexture, WoodProceduralTexture} from '@babylonjs/procedural-textures'
import "@babylonjs/core/Physics/physicsEngineComponent";

// If you don't need the standard material you will still need to import it since the scene requires it.
import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/Materials/";
import { havokModule } from "../externals/havok";
import { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";
import { type Game } from "../Game";
import { Catapult } from "../GameObjects/Catapult";
import InputController from "../InputController";

export interface Level {
    scene: Scene // The unique scene for the level
    game: Game
    assets: IAssets
    inputController: InputController
}

interface ITowerLevelParams {
    game: Game
    scene: Scene
    assets: IAssets
    inputController: InputController
}

interface IAssets {
    catapult: TransformNode,
    clonables: {
        rock: TransformNode,
    }
}

class TowerLevel implements Level {
    scene: Scene
    game: Game
    assets: IAssets
    inputController: InputController

    constructor({ game, scene, assets, inputController } : ITowerLevelParams ){
        this.scene = scene
        this.game = game
        this.inputController = inputController
        this.assets = assets

        this._init()
    }

    private _initCamera(cameraTarget: any){
        const camera = new FollowCamera("FollowCam", new Vector3(0, 4, 0), this.scene, cameraTarget)
        camera.rotationOffset = 180
        camera.heightOffset = 0
        camera.radius = 13
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

    private _init(){
        this._initLights()        
        this._initGround()
        this._initDebugger()
        
        const catapult = new Catapult(this)

        this._initCamera(catapult.cameraTarget)
    }
}

const createTowerLevel = async ({ game } : { game: Game }) => {
    const scene = new Scene(game.engine)
    scene.enablePhysics(new Vector3(0, -9.81, 0), new HavokPlugin(true, await havokModule));
    scene.clearColor = new Color4(0, 0, 0, 1);

    const inputController = new InputController(scene)
        
    const loadTowerLevelModules = async () => {
        return Promise.all([havokModule])
    }

    const [ assets ] = await Promise.all([
        importAssets(scene),
        loadTowerLevelModules
    ])
        

    return new TowerLevel({ 
        game, 
        scene, 
        assets,
        inputController,
    })
}

const importAssets = async (scene: Scene) => {
    // Add models to the existing scene.
    await SceneLoader.AppendAsync('models/','catapult.glb', scene)

    const addCleanAnimationGroupsToScene = () => {  
        // Create new animation groups in the scene  
        const fireAnimationGroup = new AnimationGroup('fire_clean', scene)
        const reloadAnimationGroup = new AnimationGroup('reload_clean', scene)
       
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
        })

        scene.animationGroups
            .filter(ag => !ag.name.endsWith('_clean'))
            .forEach(ag => ag.dispose())
    }

    const reorganizeModels = () => {
        const root = scene.meshes[0]

        // Non-clonables

        const catapult = new TransformNode("Catapult", scene)
        const catapultModel = root.getChildren().find(c => c.name === "Catapult")
        catapultModel!.parent = catapult
        
        // Clonables

        const rock = new TransformNode("RockForCloning", scene)
        const rockModel = root.getChildren().find(c => c.name === "Rock")
        rockModel!.parent = rock
        rock?.setEnabled(false) // Disable this object as it will just be used for cloning


        root.dispose()

        return {
            catapult,
            clonables: {
                rock,
            }
        }
    }

    const models = reorganizeModels()
    addCleanAnimationGroupsToScene()

    return models
}

export default createTowerLevel



