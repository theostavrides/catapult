// import { Inspector } from '@babylonjs/inspector';

import "@babylonjs/loaders/glTF";
import { Scene } from "@babylonjs/core/scene";
import { 
    MeshBuilder, Vector3, Color3, Color4, StandardMaterial,
    PhysicsAggregate, PhysicsShapeType, 
    HemisphericLight, DirectionalLight,
    FollowCamera,
} from "@babylonjs/core";
import "@babylonjs/core/Physics/physicsEngineComponent";

// If you don't need the standard material you will still need to import it since the scene requires it.
import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/Materials/";
import { havokModule } from "../externals/havok";
import { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";
import { type Game } from "../Game";
import { type Catapult, createCatapult } from "../GameObjects/Catapult/Catapult";
import InputController from "../InputController";

export interface Level {
    scene: Scene // The unique scene for the level
}

interface ITowerLevelAssets {
    catapult: Catapult
}

interface ITowerLevelParams {
    game: Game,
    scene: Scene,
    assets: ITowerLevelAssets
    inputController: InputController
}

class TowerLevel implements Level {
    scene: Scene
    game: Game
    catapult: Catapult
    private _input: InputController

    constructor({ game, scene, assets, inputController } : ITowerLevelParams ){
        this.scene = scene
        this.game = game
        this.catapult = assets.catapult
        this._input = inputController

        this._initCamera()
        this._initLights()        
        this._initGround()
        this._initDebugger()
    }

    private _initCamera(){
        const camera = new FollowCamera("FollowCam", new Vector3(0, 4, 0), this.scene, this.catapult.cameraTarget)
        // camera.maxCameraSpeed = 100; 
        // camera.cameraAcceleration = 1;
        camera.rotationOffset = 180
        camera.heightOffset = 0
        camera.radius = 13
    }

    private _initLights(){
        new HemisphericLight("hl1", new Vector3(0, 1, 0), this.scene)
        new DirectionalLight("DirectionalLight", new Vector3(0, -1, 0), this.scene);
    }


    private _initGround(){
        const ground = MeshBuilder.CreateGround("ground", {width: 20, height: 20}, this.scene);
        const material = new StandardMaterial("myMaterial", this.scene);
        ground.material = material
        material.diffuseColor = new Color3(.5, .6, .6);
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
    
    const getTowerLevelAssets = async (scene: Scene) : Promise<ITowerLevelAssets> => {
        const tasks = [createCatapult(scene, inputController)]
        
        const [catapult] = await Promise.all(tasks)
            
        return {
            catapult
        }
    }
    
    const loadTowerLevelModules = async () => {
        return Promise.all([havokModule])
    }

    const [assets] = await Promise.all([
        getTowerLevelAssets(scene), 
        loadTowerLevelModules
    ])

    return new TowerLevel({ 
        game, 
        scene, 
        assets,
        inputController,
    })
}

export default createTowerLevel