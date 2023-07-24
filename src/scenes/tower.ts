import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import * as BABYLON from "@babylonjs/core";
import { MeshBuilder } from "@babylonjs/core";
import "@babylonjs/core/Physics/physicsEngineComponent";

// If you don't need the standard material you will still need to import it since the scene requires it.
import "@babylonjs/core/Materials/standardMaterial";
import { CreateSceneClass } from "../createScene";
import { havokModule } from "../externals/havok";
import { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";

class PhysicsSceneWithAmmo implements CreateSceneClass {
    preTasks = [havokModule];

    createScene = async (engine: Engine, canvas: HTMLCanvasElement): Promise<Scene> => {
        const scene = new Scene(engine);
        scene.enablePhysics(null, new HavokPlugin(true, await havokModule));
        
        // const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(20, 15, -60), scene);
        // camera.setTarget(new BABYLON.Vector3(-30,250,0));
        // camera.attachControl(canvas, true);

        const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(-60, 300, -60), scene);
        camera.setTarget(new BABYLON.Vector3(-30,0,0));
        camera.attachControl(canvas, true);

        const light = new HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
        light.intensity = 0.7;
        
        const initGround = () => {
            const ground = MeshBuilder.CreateGround("ground", {width: 1000, height: 1000}, scene);
            const groundAggregate = new BABYLON.PhysicsAggregate(ground, BABYLON.PhysicsShapeType.BOX, { mass: 0 }, scene);
        }

        const initBlocks = () => {
            // for (let x = 0; x < 15; x++) { 
            //     for (let y = 0; y < 6; y++) {
            //         for (let z = 0; z < 2; z++) {
            //             const x0 = x * 2 
            //             const y0 = y * 1 + .5
            //             const z0 = z * 1
        
            //             const block = BABYLON.MeshBuilder.CreateBox("box", {height: 1, width: 2, depth: 1}, scene);
            //             block.position.x = x0
            //             block.position.y = y0
            //             block.position.z = z0
            //             new BABYLON.PhysicsAggregate(block, BABYLON.PhysicsShapeType.BOX, { mass: 10, restitution:0.75}, scene);
            //         }            
            //     }   
            // }

            for (let x = 0; x < 1; x++) { 
                for (let y = 0; y < 2000; y++) {
                    for (let z = 0; z < 1; z++) {
                        const x0 = x * 10 - 30
                        const y0 = y * 5 + .5
                        const z0 = z * 5 + 3
        
                        const block = BABYLON.MeshBuilder.CreateBox("box", {height: 4.999, width: 9.999, depth: 4.999}, scene);
                        block.position.x = x0
                        block.position.y = y0
                        block.position.z = z0
                        new BABYLON.PhysicsAggregate(block, BABYLON.PhysicsShapeType.BOX, { mass: 500, restitution:0.75}, scene);
                    }            
                }   
            }
        }

        setTimeout(() => {
            setInterval(() => {
                const block = BABYLON.MeshBuilder.CreateBox("box", {height: 1.5, width: 1.5, depth: 1.5}, scene);
                block.position.x = 20
                block.position.y = 5
                block.position.z = -60
                
                new BABYLON.PhysicsAggregate(block, BABYLON.PhysicsShapeType.BOX, { mass: 250, restitution:0.75}, scene); 
                
                block.physicsBody?.setLinearVelocity(new BABYLON.Vector3(
                    0 + (-40 * Math.random() + 20),
                    10 + (-2 * Math.random() + 0.5),
                    50
                ))
    
                block.physicsBody?.setAngularVelocity(new BABYLON.Vector3(Math.random()*10,Math.random()*10,Math.random()*10))
            }, 3000)
        }, 2000)



        initGround()
        initBlocks()

        return scene;
    };
}

export default new PhysicsSceneWithAmmo();
