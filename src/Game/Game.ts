import { Scene } from "@babylonjs/core";
import { Engine } from "@babylonjs/core/Engines/engine";
import { CreateSceneClass } from "../types/createScene";


export default class Game {
    canvas: HTMLCanvasElement
    engine: Engine
    activeScene: Scene|null = null
    
    constructor(){
        this.canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
        this.engine = new Engine(this.canvas, true);
        
        this.engine.runRenderLoop(() => {
            if (this.activeScene) {
                this.activeScene.render()
            }
        })

        window.addEventListener("resize", () => this.engine.resize())
    }

    private async loadScene(name: string){
        const sceneModule = await import(`../scenes/${name}`)
            .then((module: { default: CreateSceneClass; }) => module.default)
        await Promise.all(sceneModule.preTasks || []);
        const scene = await sceneModule.createScene(this)
        return scene
    }

    public async handleChangeSceneClick(name: string){
        const nextScene = await this.loadScene(name)
        this.activeScene = nextScene
    }

    async start(){
        const s = await this.loadScene('tower')
        this.activeScene = s
    }
}