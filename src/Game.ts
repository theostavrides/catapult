import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";

import { Scene } from "@babylonjs/core";
import { Engine, EngineFactory } from "@babylonjs/core";
import createStartMenuScene from "./menus/createMainMenu";

export enum Level { NONE = 0, TOWER = 0, BARRACKS = 2 }

class Game {
    public _engine: Engine
    private _mainMenuScene: Scene
    private _mainMenuOpen = true
    private _scene: Scene
    private _canvas: HTMLCanvasElement
    private _level: Level = Level.NONE;

    constructor(){
        this._canvas = document.getElementById('renderCanvas') as HTMLCanvasElement
        
        this._init()
    }

    private async _init(): Promise<void> {
        this._engine = (await EngineFactory.CreateAsync(this._canvas, {})) as Engine
        this._scene = new Scene(this._engine)
        this._engine.displayLoadingUI()

        window.addEventListener("keydown", (ev) => {
            if (ev.shiftKey && ev.ctrlKey && ev.key === 'A') {
                if (this._scene.debugLayer.isVisible()) {
                    this._scene.debugLayer.hide();
                } else {
                    this._scene.debugLayer.show();
                }
            }
        })

        await this._goToStartMenu();

        this._engine.runRenderLoop(() => {
            this._scene.render()

            if (this._mainMenuScene && this._mainMenuOpen) {
                this._mainMenuScene.render()
            } 
        });
    }

    public async _goToLevel(level: Level): Promise<void> {
        this._scene.detachControl()
        this._engine.displayLoadingUI()

        switch (level) {
            case Level.TOWER:
                // 
                break
            case Level.BARRACKS:
                break
            default:
                break
        }
        this._scene = createStartMenuScene(this);
        this._engine.hideLoadingUI()
        
    }

    private async _goToStartMenu(): Promise<void> {
        this._engine.displayLoadingUI()
        this._scene.detachControl()

        this._scene = createStartMenuScene(this);
        this._engine.hideLoadingUI()
        
    }
}

export default Game