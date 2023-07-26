import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";

import { Scene } from "@babylonjs/core";
import { Engine, EngineFactory } from "@babylonjs/core";
import createStartMenuScene from "./menus/createMainMenu";
import TowerLevel, { Level } from "./Levels/TowerLevel";

export enum LevelEnum { TOWER = 1 }
class Game {
    canvas: HTMLCanvasElement
    engine: Engine|null = null
    level: Level|null = null
    mainMenuScene: Scene|null = null
    mainMenuOpen = true

    constructor(){
        this.canvas = document.getElementById('renderCanvas') as HTMLCanvasElement
        
        this._init()
    }

    private async _init(): Promise<void> {
        this.engine = (await EngineFactory.CreateAsync(this.canvas, {})) as Engine

        this.mainMenuScene = createStartMenuScene(this.engine, (level: LevelEnum) => {
            this._handleLevelChange(level)
        })
        
        this.engine.runRenderLoop(() => {
            if (this.level?.scene){
                this.level.scene.render()
            }
            
            if (this.mainMenuScene && this.mainMenuOpen) {
                this.mainMenuScene.render()
            } 
        })
    }

    private async _handleLevelChange(level: LevelEnum){
        if (level === LevelEnum.TOWER) {
            const towerLevel = new TowerLevel({ game: this })
            await towerLevel.preload()
            await towerLevel.create()   
            this.level = towerLevel 
        }

        this.mainMenuOpen = false
    }
}

export default Game