import { Scene } from "@babylonjs/core/scene";
import { Engine, FreeCamera, Vector3 } from "@babylonjs/core";
import {AdvancedDynamicTexture, Button, Control, StackPanel} from '@babylonjs/gui'

import "@babylonjs/core/Materials/standardMaterial";
import { LevelEnum } from "../Game";

const createStartMenuScene = (
    engine: Engine, 
    onLevelClick: (level: LevelEnum) => void
) => {
    const scene = new Scene(engine);
    scene.autoClear = false;
    
    new FreeCamera("guiCamera", new Vector3(0,0,0), scene);

    const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);

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
        onLevelClick(LevelEnum.TOWER)
    })
    
    panel.addControl(towerButton)

    return scene
}

export default createStartMenuScene
