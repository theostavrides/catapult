// import { Inspector } from '@babylonjs/inspector';

import "@babylonjs/loaders/glTF";
import { Scene } from "@babylonjs/core/scene";
import { 
    MeshBuilder, Vector3, Color3, Color4, StandardMaterial,
    PhysicsAggregate, PhysicsShapeType, HemisphericLight, DirectionalLight,
    FollowCamera,
    FreeCamera,
    UniversalCamera, 
} from "@babylonjs/core";
import "@babylonjs/core/Physics/physicsEngineComponent";

// If you don't need the standard material you will still need to import it since the scene requires it.
import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/Materials/";
import { havokModule } from "../externals/havok";
import { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";
import { type Game } from "../Game";
import { type Catapult, createCatapult } from "../GameObjects/Catapult/Catapult";

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
}

class TowerLevel implements Level {
    scene: Scene
    game: Game
    catapult: Catapult

    constructor({ game, scene, assets } : ITowerLevelParams ){
        this.scene = scene
        this.game = game
        this.catapult = assets.catapult
        this._init()
    }

    private _initCamera(){
        const camera = new FollowCamera("FollowCam", new Vector3(0, 4, 0), this.scene, this.catapult.cameraTarget)
        camera.rotationOffset = 180
        camera.heightOffset = 0
        camera.radius = 13
        // const camera = new UniversalCamera("freeCam", new Vector3(10,1,10), this.scene)
        // camera.attachControl(this.game.canvas, true);
        // camera.setTarget(Vector3.Zero());
    }

    private _initLights(){
        new HemisphericLight("hl1", new Vector3(0, 1, 0), this.scene)
        new DirectionalLight("DirectionalLight", new Vector3(0, -1, 0), this.scene);
    }


    private _initGround(){
        const ground = MeshBuilder.CreateGround("ground", {width: 1000, height: 1000}, this.scene);
        const material = new StandardMaterial("myMaterial", this.scene);
        ground.material = material
        material.diffuseColor = new Color3(.5, .6, .6);
        new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0 }, this.scene);
    }
    
    private async _init() {    
        this.scene.enablePhysics(null, new HavokPlugin(true, await havokModule));
        this.scene.clearColor = new Color4(0, 0, 0, 1);

        window.addEventListener("keydown", (ev) => {
            if (ev.shiftKey && ev.ctrlKey && ev.key === 'I') {
                if (this.scene.debugLayer.isVisible()) {
                    this.scene.debugLayer.hide();
                } else {
                    this.scene.debugLayer.show();
                }
            }
        })

        this._initCamera()
        this._initLights()        
        this._initGround()
    }
}

const createTowerLevel = async ({ game } : { game: Game }) => {
    const scene = new Scene(game.engine)
    
    const getTowerLevelAssets = async (scene: Scene) : Promise<ITowerLevelAssets> => {
        const tasks = [createCatapult(scene)]
        
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

    return new TowerLevel({ game, scene, assets })
}

export default createTowerLevel


        // Inspector.Show(scene, {});
// const initBlock = () => {
//     const block = MeshBuilder.CreateBox("box", {
//         height: 1, 
//         width: 1, 
//         depth: 1,
//     }, this.scene);
    
//     const material = new StandardMaterial("myMaterial", this.scene);
//     block.material = material
//     material.diffuseColor = new Color3(.6, .515, .96);

//     block.position.x = 0
//     block.position.y = .5
//     block.position.z = 0

//     new PhysicsAggregate(block, PhysicsShapeType.BOX, { mass: 500, restitution:0.75}, this.scene);
//     block.physicsBody?.setAngularVelocity(new Vector3(0, 0 , 0))
// }