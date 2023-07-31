import { Scene, ActionManager, ExecuteCodeAction, Scalar } from '@babylonjs/core';

class InputController {
    private _scene: Scene
    
    public inputMap: any
    public rotation = 0;
    public forward = 0;
    public rotationAxis = 0;
    public forwardAxis = 0;
    public shoot = false

    constructor(scene: Scene) {
        this._scene = scene

        //scene action manager to detect inputs
        this._scene.actionManager = new ActionManager(this._scene)
        this.inputMap = {}

        this._scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (evt) => {
            this.inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        }))
        this._scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (evt) => {
            this.inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        }))

        scene.onBeforeRenderObservable.add(() => {
            this._updateFromKeyboard();
        })
    }

    private _updateFromKeyboard(){
        //forward - backwards movement
        if (this.inputMap["ArrowUp"]) {
            this.forwardAxis = 1;
            this.forward = Scalar.Lerp(this.forward, 1, 0.2);

        } else if (this.inputMap["ArrowDown"]) {
            this.forward = Scalar.Lerp(this.forward, -1, 0.2);
            this.forwardAxis = -1;
        } else {
            this.forward = 0;
            this.forwardAxis = 0;
        }

        //left - right movement
        if (this.inputMap["ArrowLeft"]) {
            this.rotation = Scalar.Lerp(this.rotation, -1, 0.2);
            this.rotationAxis = -1;

        } else if (this.inputMap["ArrowRight"]) {
            this.rotation = Scalar.Lerp(this.rotation, 1, 0.2);
            this.rotationAxis = 1;
        } else {
            this.rotation = 0;
            this.rotationAxis = 0;
        }

        // fire catapult
        if (this.inputMap["Space"]) {
            this.shoot = true;
        } else {
            this.shoot = false;
        }
    }
}

export default InputController