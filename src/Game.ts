import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";

import { Scene, Vector3, FreeCamera } from "@babylonjs/core";
import {AdvancedDynamicTexture, Button, Control, StackPanel} from '@babylonjs/gui'
import { Engine, EngineFactory } from "@babylonjs/core";
// import createStartMenuScene from "./menus/createMainMenu";
import TowerLevel from "./Levels/TowerLevel";

export enum Level { NONE = 0, TOWER = 0, BARRACKS = 2 }

class Game {
    public engine: Engine
    public canvas: HTMLCanvasElement
    private _mainMenuScene: Scene
    private _mainMenuOpen = true
    private _gameScene: Scene
    private _level: Level = Level.NONE;

    constructor(){
        this.canvas = document.getElementById('renderCanvas') as HTMLCanvasElement
        
        this._init()
    }

    private async _init(): Promise<void> {
        this.engine = (await EngineFactory.CreateAsync(this.canvas, {})) as Engine
        this.initMainMenu()

        this.engine.runRenderLoop(() => {
            if (this._gameScene){
                this._gameScene.render()
            }

            if (this._mainMenuScene && this._mainMenuOpen) {
                this._mainMenuScene.render()
            } 
        })
    }

    initMainMenu(){
        this._mainMenuScene = new Scene(this.engine);
        // this._mainMenuScene.autoClear = false;
        
        new FreeCamera("guiCamera", new Vector3(0,0,0), this._mainMenuScene);
    
        const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, this._mainMenuScene);
    
        const createSceneButton = (name) => {
            const button = Button.CreateSimpleButton(name, name);
    
            button.width = "200px";
            button.height = "40px";
            button.color = "white";
            button.background = "green";
            advancedTexture.addControl(button);

            return button
        }
    
        const panel = new StackPanel();    
        advancedTexture.addControl(panel);   
        
        panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER
        panel.horizontalAlignment = Control.VERTICAL_ALIGNMENT_CENTER
        panel.height = '200px'
    
        const towerButton = createSceneButton("Tower")
        
        towerButton.onPointerUpObservable.add(() => {
            this._mainMenuOpen = false
            this._mainMenuScene.dispose()
            this._goToTowerLevel()
        })
        
        panel.addControl(towerButton)
    }

    public async _goToTowerLevel(): Promise<void> {
        const towerLevel = new TowerLevel({ game: this })
        await towerLevel.preload()
        await towerLevel.create()   
        this._gameScene = towerLevel.scene     
    }

}

export default Game