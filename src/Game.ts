import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";

import { Scene } from "@babylonjs/core";
import { Engine, EngineFactory } from "@babylonjs/core";
import createStartMenuScene from "./menus/createMainMenu";
import { type Level } from "./Levels/TowerLevel";
import createTowerLevel from "./Levels/TowerLevel";

export enum LevelEnum { TOWER = 1 }
export class Game {
    canvas: HTMLCanvasElement
    engine: Engine
    level: Level|null = null
    mainMenuScene: Scene|null = null
    mainMenuOpen = true

    constructor(canvas: HTMLCanvasElement, engine: Engine){
        this.canvas = canvas
        this.engine = engine
        
        this._init()
    }

    private async _init(): Promise<void> {
        this.engine = (await EngineFactory.CreateAsync(this.canvas, {})) as Engine

        this.mainMenuScene = createStartMenuScene(this.engine, (level: LevelEnum) => {
            this._goToLevel(level)
        })
        
        window.addEventListener('resize', () => {
            this.engine.resize();
        });

        
        this.engine.runRenderLoop(() => {
            if (this.level?.scene){
                this.level.scene.render()
            }
            
            if (this.mainMenuScene && this.mainMenuOpen) {
                this.mainMenuScene.render()
            } 
        })
    }

    private async _goToLevel(level_id: LevelEnum){        
        if (level_id === LevelEnum.TOWER) {
            if (this.level) {
                this.level.scene.dispose()
            }
            this.level = await createTowerLevel({ game: this })
        }

        
        this.mainMenuOpen = false
    }
}

export const createGame = async() => {
    const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement
    const engine =  (await EngineFactory.CreateAsync(canvas, {})) as Engine
    return new Game(canvas, engine)
}

export default createGame