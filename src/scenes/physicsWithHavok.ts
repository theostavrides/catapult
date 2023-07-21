import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Quaternion, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { CreateSphere } from "@babylonjs/core/Meshes/Builders/sphereBuilder";
import { CreateGround } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import "@babylonjs/core/Physics/physicsEngineComponent";

// If you don't need the standard material you will still need to import it since the scene requires it.
import "@babylonjs/core/Materials/standardMaterial";
import { CreateSceneClass } from "../createScene";
import { havokModule } from "../externals/havok";
import { PhysicsShapeBox, PhysicsShapeSphere } from "@babylonjs/core/Physics/v2/physicsShape";
import { PhysicsBody } from "@babylonjs/core/Physics/v2/physicsBody";
import { PhysicsMotionType } from "@babylonjs/core/Physics/v2/IPhysicsEnginePlugin";
import { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";

class PhysicsSceneWithAmmo implements CreateSceneClass {
    preTasks = [havokModule];

    createScene = async (engine: Engine, canvas: HTMLCanvasElement): Promise<Scene> => {
        const scene = new Scene(engine);
        scene.enablePhysics(null, new HavokPlugin(true, await havokModule));
        
        const camera = new ArcRotateCamera("my first camera", 0, Math.PI / 3, 10, new Vector3(0, 0, 0), scene);
        camera.setTarget(Vector3.Zero());
        camera.attachControl(canvas, true);

        const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
        light.intensity = 0.7;

        const initCubes = () => {
            const sphereShape = new PhysicsShapeSphere(
                new Vector3(0, 0, 0),
                1, 
                scene
            )
            sphereShape.material = { friction: 0.2, restitution: 0.6 };
            
            const sphere = CreateSphere("sphere", { diameter: 2, segments: 32 }, scene);
            sphere.position.y = 4;
    
            const sphereBody = new PhysicsBody(sphere, PhysicsMotionType.DYNAMIC, false, scene);        
            sphereBody.shape = sphereShape;
            sphereBody.setMassProperties({ mass: 1 });
        }
        
        const initGround = () => {
            const ground = CreateGround("ground", { width: 10, height: 10 }, scene);
            const groundShape = new PhysicsShapeBox(new Vector3(0, 0, 0)
                , Quaternion.Identity()
                , new Vector3(10, 0.1, 10)
                , scene)
            const groundBody = new PhysicsBody(ground, PhysicsMotionType.STATIC, false, scene)
            groundShape.material = { friction: 0.2, restitution: 0.8 }
            groundBody.shape = groundShape
            groundBody.setMassProperties({ mass: 0 });
        }

        initGround()
        initCubes()

        return scene;
    };
}

export default new PhysicsSceneWithAmmo();
