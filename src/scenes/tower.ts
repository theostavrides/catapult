import { Engine } from "@babylonjs/core/Engines/engine";
import { Inspector } from '@babylonjs/inspector';
import { Scene } from "@babylonjs/core/scene";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import * as BABYLON from "@babylonjs/core";
import { MeshBuilder, Vector3 } from "@babylonjs/core";
import "@babylonjs/core/Physics/physicsEngineComponent";

// If you don't need the standard material you will still need to import it since the scene requires it.
import "@babylonjs/core/Materials/standardMaterial";
import { CreateSceneClass } from "../types/createScene";
import { havokModule } from "../externals/havok";
import { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";
import Game from "../Game/Game";

class TowerScene implements CreateSceneClass {
    preTasks = [havokModule];

    async createScene (game: Game): Promise<Scene> {
        const scene = new Scene(game.engine);
        // Inspector.Show(scene, {});

        scene.enablePhysics(null, new HavokPlugin(true, await havokModule));
        scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);
        
        const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(10, 5, 10), scene);
        camera.setTarget(new BABYLON.Vector3(0,0,0));
        camera.attachControl(game.canvas, true);

        
        const pl1 = new BABYLON.PointLight("pl1", new Vector3(0,10,0), scene)
        pl1.intensity = .5


            
        const initGround = () => {
            const ground = MeshBuilder.CreateGround("ground", {width: 1000, height: 1000}, scene);
            const material = new BABYLON.StandardMaterial("myMaterial", scene);
            ground.material = material
            material.diffuseColor = new BABYLON.Color3(.5, .6, .6);
            new BABYLON.PhysicsAggregate(ground, BABYLON.PhysicsShapeType.BOX, { mass: 0 }, scene);
        }

        const initBlock = () => {
            const block = BABYLON.MeshBuilder.CreateBox("box", {
                height: 1, 
                width: 1, 
                depth: 1,
            }, scene);
            
            const material = new BABYLON.StandardMaterial("myMaterial", scene);
            block.material = material
            material.diffuseColor = new BABYLON.Color3(.6, .515, .96);

            block.position.x = 0
            block.position.y = .5
            block.position.z = 0

            new BABYLON.PhysicsAggregate(block, BABYLON.PhysicsShapeType.BOX, { mass: 500, restitution:0.75}, scene);
            block.physicsBody?.setAngularVelocity(new BABYLON.Vector3(0, 0 , 0))
        }



        initGround()
        initBlock()

        return scene;
    }
}


export default new TowerScene()