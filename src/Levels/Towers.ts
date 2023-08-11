
import "@babylonjs/loaders/glTF";
import { Scene } from "@babylonjs/core/scene";
import "@babylonjs/procedural-textures"
import { 
    MeshBuilder, Vector3, Color4, StandardMaterial,
    PhysicsAggregate, PhysicsShapeType, 
    FollowCamera,
    TransformNode,
    SceneLoader,
    AnimationGroup,
    Mesh,
    DirectionalLight,
    HemisphericLight,
} from "@babylonjs/core";

import {  WoodProceduralTexture} from '@babylonjs/procedural-textures'
import "@babylonjs/core/Physics/physicsEngineComponent";

// If you don't need the standard material you will still need to import it since the scene requires it.
import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/Materials/";
import { havokModule } from "../externals/havok";
import { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";
import { type Game } from "../Game";
import { Catapult } from "../GameObjects/Catapult";
import InputController from "../InputController";
import { createJengaTower } from "../GameObjects/BlockStructure";

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

        const texture =  new WoodProceduralTexture("woodmat", 2**10, this.scene)
        // texture.woodColor = new Color3(0.49, 0.25, 0)
        // texture.ampScale = .9
        
        material.diffuseTexture = texture
        material.ambientTexture = texture

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

        createJengaTower({ scene: this.scene, levels: 12, z: 30, x: -18 })
        createJengaTower({ scene: this.scene, levels: 8, z: 30, x: -10 })
        createJengaTower({ scene: this.scene, levels: 10, z: 30, x: 0 })
        createJengaTower({ scene: this.scene, levels: 12, z: 30, x: 8 })
        createJengaTower({ scene: this.scene, levels: 10, z: 30, x: 17 })

        createJengaTower({ scene: this.scene, levels: 6, z: 20, x: 23 })
        createJengaTower({ scene: this.scene, levels: 8, z: 20, x: 15 })
        createJengaTower({ scene: this.scene, levels: 10, z: 20, x: 5 })
        createJengaTower({ scene: this.scene, levels: 12, z: 20, x: -2 })
        createJengaTower({ scene: this.scene, levels: 10, z: 20, x: -24 })

        createJengaTower({ scene: this.scene, levels: 4, z: 10, x: 23 })
        createJengaTower({ scene: this.scene, levels: 8, z: 10, x: 13 })
        createJengaTower({ scene: this.scene, levels: 3, z: 10, x: 3 })
        createJengaTower({ scene: this.scene, levels: 10, z: 10, x: -3 })
        createJengaTower({ scene: this.scene, levels: 6, z: 10, x: -13 })

        createJengaTower({ scene: this.scene, levels: 3, z: 0, x: 19 })
        createJengaTower({ scene: this.scene, levels: 5, z: 0, x: 11 })
        createJengaTower({ scene: this.scene, levels: 4, z: 0, x: 4 })
        createJengaTower({ scene: this.scene, levels: 2, z: 0, x: -10 })
        createJengaTower({ scene: this.scene, levels: 5, z: 0, x: -18 })


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



