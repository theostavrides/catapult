
import "@babylonjs/loaders/glTF"
import { Scene } from "@babylonjs/core/scene"
import "@babylonjs/procedural-textures"
import { 
    MeshBuilder, 
    Vector2, 
    Vector3, 
    Color4, 
    StandardMaterial,
    PhysicsAggregate, 
    PhysicsShapeType, 
    FollowCamera,
    TransformNode,
    SceneLoader,
    AnimationGroup,
    Mesh,
    HemisphericLight,
    PointLight,
    Color3,
    CubeTexture,
    Texture,
} from "@babylonjs/core"

import { WaterMaterial } from "@babylonjs/materials"
import { GrassProceduralTexture } from "@babylonjs/procedural-textures"

import { AdvancedDynamicTexture, Control, Rectangle } from '@babylonjs/gui'


import "@babylonjs/core/Physics/physicsEngineComponent"

declare var __webpack_public_path__: string;
// If you don't need the standard material you will still need to import it since the scene requires it.
import "@babylonjs/core/Materials/standardMaterial"
import "@babylonjs/core/Materials/"
import { havokModule } from "../externals/havok"
import { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin"
import { type Game } from "../Game"
import { Catapult } from "../GameObjects/Catapult"
import InputController from "../InputController"
import Building from "../GameObjects/Building"

export interface Level {
    scene: Scene // The unique scene for the level
    game: Game
    assets: IAssets
    inputController: InputController
    gui?: GUI
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

interface GUI {
    power: Rectangle;
}

class TowerLevel implements Level {
    scene: Scene
    game: Game
    assets: IAssets
    inputController: InputController
    gui: GUI|undefined;

    constructor({ game, scene, assets, inputController } : ITowerLevelParams ){
        this.scene = scene
        this.game = game
        this.inputController = inputController
        this.assets = assets

        this._init()
    }

    private _initCamera(cameraTarget: Mesh){
        const camera = new FollowCamera("FollowCam", new Vector3(145, 22, -145), this.scene, cameraTarget)
        camera.fov = .6
        camera.rotationOffset = 180
        camera.heightOffset = 2
        camera.radius = 16
    }

    private _initLights(){
        const hl = new HemisphericLight("hl1", new Vector3(0, 1, 0), this.scene)
        hl.diffuse = new Color3(1,.9,.9);
        // hl.specular = new Color3(1,.9,.9);
        hl.intensity = 1.3

        
        const plPos = new Vector3(0,25,-60)
        const pl = new PointLight('pl1', plPos, this.scene)
        pl.specular = new Color3(.6, .1, .1);
        pl.diffuse = new Color3(.353,.145,.145);
        pl.intensity = 1.1

        const plPos2 = new Vector3(-20,60,60)
        const pl2 = new PointLight('pl1', plPos2, this.scene)
        pl2.specular = new Color3(.6, .1, .1);
        pl2.diffuse = new Color3(.353,.145,.145);
        pl2.intensity = 1.1
    }


    private _initEnvironment(){
        // Ground
        const groundRadius = 100
        const ground = MeshBuilder.CreateDisc("ground", {radius: groundRadius, tessellation: 7}, this.scene);
        ground.rotate(new Vector3(1,0,0), Math.PI/2)
        ground.rotate(new Vector3(0,0,1), Math.PI/1.4)
        ground.position.x = 5
        ground.scaling.x = .7
        ground.scaling.z = .7
        
        const material = new StandardMaterial("groundMaterial", this.scene)
        const col = new Color3(0.09, 0.11, 0.12)
        material.diffuseColor = col
        material.specularColor = col
        material.ambientColor = col
        ground.material = material

        new PhysicsAggregate(ground, PhysicsShapeType.MESH, {radius: groundRadius, mass: 0, }, this.scene);

        // Boulders

        const boulderMaterial = new StandardMaterial("boulderMaterial", this.scene)
        const boulderMatCol = new Color3(.2, 0.2, 0.3)
        boulderMaterial.diffuseColor = boulderMatCol

        const boulderData = [
            {
                scale: { height: 10, width: 20, depth: 10},
                position: new Vector3(55, -5.4, 0),
                rotation: new Vector3(.7,.2,.7),
                material: boulderMaterial
            },
            {
                scale: { height: 10, width: 10, depth: 10},
                position: new Vector3(-10, -5, -60),
                rotation: new Vector3(.7,0,.7),
                material: boulderMaterial
            },
            {
                scale: { height: 30, width: 30, depth: 30},
                position: new Vector3(-60, -8, -30),
                rotation: new Vector3(.4,.2,.7),
                material: boulderMaterial
            },
            {
                scale: { height: 60, width: 50, depth: 46},
                position: new Vector3(-60, -25, 40),
                rotation: new Vector3(.9,Math.PI/2,.6),
                material: boulderMaterial
            },
            {
                scale: { height: 50, width: 55, depth: 45},
                rotation: new Vector3(12,Math.PI/1.4,.6),
                position: new Vector3(-20, -10, 80),
                material: boulderMaterial
            },
            {
                scale: { height: 25, width: 25, depth: 25},
                rotation: new Vector3(-.5,.4,.1),
                position: new Vector3(30, -10, 70),
                material: boulderMaterial
            },
            {
                scale: { height: 25, width: 25, depth: 25},
                rotation: new Vector3(-.7,.3,.9),
                position: new Vector3(35, -14, -60),
                material: boulderMaterial
            },
            {
                scale: { height: 15, width: 20, depth: 20},
                rotation: new Vector3(2.3,Math.PI/5,.5),
                position: new Vector3(10, -10, -80),
                material: boulderMaterial
            },
            {
                scale: { height: 15, width: 15, depth: 15},
                rotation: new Vector3(Math.PI/4,-Math.PI/12,-Math.PI/16),
                position: new Vector3(-20, -3, -80),
                material: boulderMaterial
            },
            {
                scale: { height: 15, width: 15, depth: 15},
                rotation: new Vector3(Math.PI/8,Math.PI/8,Math.PI/8),
                position: new Vector3(80,-7,-20),
                material: boulderMaterial
            },
            {
                scale: { height: 15, width: 15, depth: 15},
                rotation: new Vector3(Math.PI/6,Math.PI/6,Math.PI/4),
                position: new Vector3(90,-8,40),
                material: boulderMaterial
            },
            {
                scale: { height: 50, width: 50, depth: 50},
                rotation: new Vector3(-Math.PI/5,-Math.PI/7,Math.PI/6),
                position: new Vector3(-240,-15,160),
                material: boulderMaterial
            },
            {
                scale: { height: 50, width: 50, depth: 50},
                rotation: new Vector3(-Math.PI/5,-Math.PI/1.3,Math.PI/6),
                position: new Vector3(60,-25,160),
                material: boulderMaterial
            }
        ]

        boulderData.forEach((b, index) => {
            const m = MeshBuilder.CreateBox("boulder" + index, { ...b.scale }, this.scene);
            m.position = b.position
            m.rotation = b.rotation
            m.material = b.material
            new PhysicsAggregate(m, PhysicsShapeType.MESH, { mass: 0, }, this.scene);
        })

        // Catapult stand

        const standMat = new StandardMaterial("boulderMaterial", this.scene)
        const standMatCol = new Color3(.2, 0.2, 0.3)
        standMat.diffuseColor = standMatCol
        standMat.specularColor = new Color3(.1,.1,.1)

        const s = MeshBuilder.CreateCylinder("stand", { height: 50, diameter: 7, tessellation: 32 }, this.scene)
        s.position = new Vector3(129.5,-10,-129.5)
        s.rotation = new Vector3(0,Math.PI/4,0)
        s.material = standMat
        new PhysicsAggregate(s, PhysicsShapeType.MESH, { mass: 0, }, this.scene);



        //Fog
        this.scene.fogMode = Scene.FOGMODE_EXP;
        this.scene.fogDensity = 0.0004;
        this.scene.fogColor = new Color3(0.9, 0.9, 0.85);
        this.scene.fogStart = 2000;
        this.scene.fogEnd = 3000.0;


        // Skybox
        var skybox = MeshBuilder.CreateBox("skyBox", {size:2000.0}, this.scene);
        skybox.rotate(new Vector3(0,0,1), Math.PI/8)
        skybox.position.y = 500
        var skyboxMaterial = new StandardMaterial("skyBox", this.scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new CubeTexture("skybox/skybox", this.scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
        skyboxMaterial.specularColor = new Color3(0, 0, 0);
        skybox.material = skyboxMaterial;		

        // Water
        const waterMesh = MeshBuilder.CreateDisc("waterMesh", {radius: 400}, this.scene);
        waterMesh.rotate(new Vector3(1,0,0), Math.PI/2)
        waterMesh.position.y = -0.1
        var water = new WaterMaterial("water", this.scene, new Vector2(512, 512));
        
        water.backFaceCulling = true;
        water.bumpTexture = new Texture("textures/waterbump.png", this.scene);
        water.windForce = -5;
        water.waveHeight = .1;
        water.bumpHeight = 1;
        water.windDirection = new Vector2(1, 1);
        water.waterColor = new Color3(0, 0, .2);
        water.colorBlendFactor = 0.2;
        water.addToRenderList(skybox);
        waterMesh.material = water;



    }

    private _initGUI(){
        var advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");

        // Power Bar Container
        var powerContainer = new Rectangle();
        powerContainer.width = "20px";
        powerContainer.height = "100%";
        powerContainer.cornerRadius = 0;
        const color = 'rgb(100, 110, 100)'
        powerContainer.color = color;
        powerContainer.background = color;
        powerContainer.zIndex = 1
        advancedTexture.addControl(powerContainer);   
    
        powerContainer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        powerContainer.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        advancedTexture.addControl(powerContainer);

        // Power Lines
        for (let i = 1; i < 11; i++) {
            const line = new Rectangle();
            line.height = "5px";
            line.width = "20px";
            line.top = `${i * 10}%`
            line.zIndex = 3
            line.color = 'rgb(130, 140, 130)';
            line.background = 'rgb(130, 140, 130)';
            line.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
            line.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
            advancedTexture.addControl(line);
        }

        // Power Bar
        var power = new Rectangle();
        power.width = "20px";
        power.height = "0%";
        power.cornerRadius = 0;
        power.color = 'rgb(0, 0, 0)';
        power.background = 'rgb(0, 0, 0)';
        power.zIndex = 2
        advancedTexture.addControl(power);   
    
        power.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        power.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        advancedTexture.addControl(power);

        this.gui = {
            power
        }
    }

    private _initDebugger(){
        window.addEventListener("keydown", (ev) => {
            if (ev.shiftKey && ev.key === 'I') {
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
        this._initEnvironment()
        this._initGUI()
        // this._initDebugger()

        this.scene.executeWhenReady(() => {
            // Controls (top right display)
            const controls = document.getElementById("controls")
            if (controls) {
                setTimeout(() => {
                    controls.style.display = "block"
                }, 100)
            }

            // Start Button display
            const startButton = document.getElementById("start-button-container")
            
            if (startButton) {
                startButton.style.visibility = 'visible'
            }

            const onDocClick = () => {
                if (startButton) {
                    startButton.style.display = 'none'
                    document.body.removeEventListener('click', onDocClick, true)
                }
            }

            document.body.addEventListener('click', onDocClick, true); 
        })




        new Building(this.scene, 'fort')
        new Building(this.scene, 'fortTower')
        new Building(this.scene, 'fort2')

        const catapult = new Catapult(this, new Vector3(130, 15,-130), new Vector3(0,-.75,0))


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
    await SceneLoader.AppendAsync(__webpack_public_path__,'catapult.glb', scene)

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



