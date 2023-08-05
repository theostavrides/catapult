
import "@babylonjs/loaders/glTF";
import { Scene } from "@babylonjs/core/scene";
import "@babylonjs/procedural-textures"
import { 
    MeshBuilder, Vector3, Color3, Color4, StandardMaterial,
    PhysicsAggregate, PhysicsShapeType, 
    FollowCamera,
    TransformNode,
    SceneLoader,
    AnimationGroup,
    Mesh,
    DirectionalLight,
    HemisphericLight,
    NoiseProceduralTexture,
} from "@babylonjs/core";

import { FireProceduralTexture, GrassProceduralTexture, MarbleProceduralTexture, StarfieldProceduralTexture, WoodProceduralTexture} from '@babylonjs/procedural-textures'
import "@babylonjs/core/Physics/physicsEngineComponent";

// If you don't need the standard material you will still need to import it since the scene requires it.
import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/Materials/";
import { havokModule } from "../externals/havok";
import { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";
import { type Game } from "../Game";
import { Catapult } from "../GameObjects/Catapult";
import InputController from "../InputController";
import BlockStructure, { createJengaTower } from "../GameObjects/BlockStructure";

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

    private _initCamera(cameraTarget: Mesh){
        const camera = new FollowCamera("FollowCam", new Vector3(0, 4, 0), this.scene, cameraTarget)
        camera.rotationOffset = 180
        camera.heightOffset = 0
        camera.radius = 13
    }

    private _initLights(){
        new HemisphericLight("hl1", new Vector3(0, 1, 0), this.scene)
        // const dl = new DirectionalLight("DirectionalLight", new Vector3(1, -1, 0), this.scene);
        // const dl2 = new DirectionalLight("DirectionalLight", new Vector3(-1, -1, 1), this.scene);
        // const dl3 = new DirectionalLight("DirectionalLight", new Vector3(0, -1, -1), this.scene);
        const dl4 = new DirectionalLight("DirectionalLight", new Vector3(0, -1, 1), this.scene);
        // [dl,dl2,dl3,dl4].forEach(l => l.intensity = 0.5)

    }


    private _initGround(){
        const ground = MeshBuilder.CreateGround("ground", {width: 200, height: 200}, this.scene);
        
        
        const material = new StandardMaterial("groundMaterial", this.scene)

        const texture =  new StarfieldProceduralTexture("perlin", 256 * 2 * 2, this.scene);
        // noise.octaves = 7
        // noise.persistence = .74
        // noise.animationSpeedFactor = -.35
        material.ambientTexture = texture;
        
        // material.specularColor = new Color3(.2 , .2, .2)
        // material.diffuseColor = new Color3(.2, .2, .2)
        // material.ambientColor = new Color3(.2, .2, .2)
        // material.roughness = 0.7

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

        createJengaTower({ scene: this.scene, levels: 12, z: 50 })

        createJengaTower({ scene: this.scene, levels: 10, z: 30, x: - 20 })
        
        createJengaTower({ scene: this.scene, levels: 8, z: 20, x: 20 })

        createJengaTower({ scene: this.scene, levels: 10, z: 20, x: 10 })

        createJengaTower({ scene: this.scene, levels: 6, z: 10, x: 0 })

        const catapult = new Catapult(this, new Vector3(0,0,-90), new Vector3(0,0,0))


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



