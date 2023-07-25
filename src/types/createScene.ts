import type { Scene } from "@babylonjs/core/scene";
import Game from '../Game/Game'

export interface CreateSceneClass {
    createScene: (game: Game) => Promise<Scene>;
    preTasks?: Promise<unknown>[];
}
