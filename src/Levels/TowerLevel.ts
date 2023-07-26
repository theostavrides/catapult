import { Inspector } from '@babylonjs/inspector';
import { Scene } from "@babylonjs/core/scene";
import * as BABYLON from "@babylonjs/core";
import { MeshBuilder, Vector3 } from "@babylonjs/core";
import "@babylonjs/core/Physics/physicsEngineComponent";

// If you don't need the standard material you will still need to import it since the scene requires it.
import "@babylonjs/core/Materials/standardMaterial";
import { havokModule } from "../externals/havok";
import { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";
import Game from "../Game";

class TowerLevel {
    scene: Scene;
    game: Game

    constructor({ game } : { game: Game } ){
        this.game = game
    }

    async preload(){
        return await Promise.all([havokModule])
    }

    async create() {
        this.scene = new Scene(this.game.engine);
        // Inspector.Show(scene, {});
    
        this.scene.enablePhysics(null, new HavokPlugin(true, await havokModule));
        this.scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);
        
        const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(10, 5, 10), this.scene);
        camera.setTarget(new BABYLON.Vector3(0,0,0));
        camera.attachControl(this.game.canvas, true);
    
        
        const pl1 = new BABYLON.PointLight("pl1", new Vector3(0,10,0), this.scene)
        pl1.intensity = .5
    
        const initGround = () => {
            const ground = MeshBuilder.CreateGround("ground", {width: 1000, height: 1000}, this.scene);
            const material = new BABYLON.StandardMaterial("myMaterial", this.scene);
            ground.material = material
            material.diffuseColor = new BABYLON.Color3(.5, .6, .6);
            new BABYLON.PhysicsAggregate(ground, BABYLON.PhysicsShapeType.BOX, { mass: 0 }, this.scene);
        }
    
        const initBlock = () => {
            const block = BABYLON.MeshBuilder.CreateBox("box", {
                height: 1, 
                width: 1, 
                depth: 1,
            }, this.scene);
            
            const material = new BABYLON.StandardMaterial("myMaterial", this.scene);
            block.material = material
            material.diffuseColor = new BABYLON.Color3(.6, .515, .96);
    
            block.position.x = 0
            block.position.y = .5
            block.position.z = 0
    
            new BABYLON.PhysicsAggregate(block, BABYLON.PhysicsShapeType.BOX, { mass: 500, restitution:0.75}, this.scene);
            block.physicsBody?.setAngularVelocity(new BABYLON.Vector3(0, 0 , 0))
        }
    
        initGround()
        initBlock()
    }

}

export default TowerLevel
