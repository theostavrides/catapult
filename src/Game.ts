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

        // this.mainMenuScene = createStartMenuScene(this.engine, (level: LevelEnum) => {
        //     this._goToLevel(level)
        // })
        
        this._goToLevel(LevelEnum.TOWER)

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

            // const fps = document.getElementById('fps')
            // if (fps) {
            //     fps.innerHTML = this.engine.getFps().toFixed() + " fps";
            // }
        })

        const ak = document.getElementById('arrow_keys') as HTMLImageElement
        const sp = document.getElementById('spacebar') as HTMLImageElement
        if (ak && sp) {
            ak.src = __webpack_public_path__ + ak.src + 'arrow_keys.png'
            sp.src = __webpack_public_path__ + sp.src + 'spacebar.png'
        }
  
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