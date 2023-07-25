import { Scene } from "@babylonjs/core/scene";
import { FreeCamera, Vector3 } from "@babylonjs/core";
import {AdvancedDynamicTexture, Button, Control, StackPanel} from '@babylonjs/gui'
import { Level } from "../Game";

import "@babylonjs/core/Materials/standardMaterial";
import Game from "../Game";

const createStartMenuScene = (game: Game) => {
    const scene = new Scene(game._engine);

    // Mark the GUI scene auto clear as false so it doesn't erase the currently rendering scene
    scene.autoClear = false;
    
    new FreeCamera("guiCamera", new Vector3(0,0,0), scene);

    const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);

    const createSceneButton = (level: Level) => {
        const buttonData = {
            [Level.TOWER]: "Tower",
            [Level.BARRACKS]: "Barracks"
        }
        const button = Button.CreateSimpleButton(buttonData[level], buttonData[level]);
        
        button.width = "200px";
        button.height = "40px";
        button.color = "white";
        button.background = "green";
        advancedTexture.addControl(button);
        button.onPointerUpObservable.add(() => {
            game._goToLevel(level)
        });
        return button
    }

    const panel = new StackPanel();    
    advancedTexture.addControl(panel);   
    
    panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER
    panel.horizontalAlignment = Control.VERTICAL_ALIGNMENT_CENTER
    panel.top = '100px'


    const towerButton = createSceneButton(Level.TOWER)
    const barracksButton = createSceneButton(Level.BARRACKS)
    
    panel.addControl(towerButton)
    panel.addControl(barracksButton)
        
    return scene
}

export default createStartMenuScene
