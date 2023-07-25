import { Scene } from "@babylonjs/core/scene";
import { FreeCamera, Vector3 } from "@babylonjs/core";
import {AdvancedDynamicTexture, Button, Control, StackPanel} from '@babylonjs/gui'
import Game from "../Game/Game";

import "@babylonjs/core/Materials/standardMaterial";
import { CreateSceneClass } from "../types/createScene";


class StartMenuScene implements CreateSceneClass {
    async createScene (game: Game): Promise<Scene> {
        const guiScene = new Scene(game.engine);

        // Mark the GUI scene auto clear as false so it doesn't erase the currently rendering scene
        guiScene.autoClear = false;
        
        new FreeCamera("guiCamera", new Vector3(0,0,0), guiScene);

        const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, guiScene);



        const createSceneButton = (sceneName: string) => {
            const button = Button.CreateSimpleButton(sceneName, sceneName);
            button.width = "200px";
            button.height = "40px";
            button.color = "white";
            button.background = "green";
            advancedTexture.addControl(button);
            button.onPointerUpObservable.add(() => {
                game.handleChangeSceneClick(sceneName)
            });
            return button
        }

        const panel = new StackPanel();    
        advancedTexture.addControl(panel);   
        
        panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER
        panel.horizontalAlignment = Control.VERTICAL_ALIGNMENT_CENTER
        panel.top = '100px'


        const towerButton = createSceneButton('tower')
        const barracksButton = createSceneButton('barracks')
        
        panel.addControl(towerButton)
        panel.addControl(barracksButton)
        
        return guiScene;
    }
}


export default new StartMenuScene()