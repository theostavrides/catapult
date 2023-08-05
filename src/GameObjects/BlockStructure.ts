import { Color3, Color4, MeshBuilder, StandardMaterial, type Scene, Vector3, PhysicsAggregate, PhysicsShapeType } from "@babylonjs/core"

interface IParams {
    scene: Scene,
    x?: number,
    y?: number,
    z?: number,
    width?: number,
    height?: number,
    depth?: number,
    numX?: number,
    numY?: number,
    numZ?: number,
    xGapMultiplier?: number,
    zGapMultiplier?: number,
    blockMass?: number,
}

export class BlockStructure {
    constructor({
        scene,
        x = 0,
        y = 0,
        z = 0,
        width = 1,
        height = 1,
        depth = 1,
        numX = 5,
        numY = 5,
        numZ = 5,
        xGapMultiplier = 1,
        zGapMultiplier = 1,
        blockMass = 100,
    }: IParams) {
        const box = MeshBuilder.CreateBox("box", { height, depth, width }, scene)
        const material = new StandardMaterial("boxMat", scene)
        box.registerInstancedBuffer("instanceColor", 4)
        box.instancedBuffers.instanceColor = new Color4(0,0,0,1)
        material.diffuseColor = Color3.Random()
        box.material = material
        box.setEnabled(false)
        
        for (let x0 = 0; x0 < numX; x0++) {
            for (let y0 = 0; y0 < numY; y0++) {
                for (let z0 = 0; z0 < numZ; z0++) {
                    const boxInstance = box.createInstance(`box-${x0}${y0}${z0}`)
                    
                    boxInstance.position = new Vector3(
                        x + (x0 * width * xGapMultiplier), 
                        y + ((y0 * height) + (height*.5)), 
                        z + (z0 * depth * zGapMultiplier)
                    )
                    
                    new PhysicsAggregate(boxInstance, PhysicsShapeType.BOX, { mass: blockMass }, scene)
    
                    boxInstance.instancedBuffers.instanceColor = new Color4(
                        Math.random(), 
                        Math.random(), 
                        Math.random(), 
                        1
                    )
                }
            }
        }
    }

}

interface ICreateJengaTower {
    scene: Scene,
    x?: number,
    y?: number,
    z?: number,
    levels: number, 
}

export const createJengaTower = ({ 
    scene, 
    x = 0,
    y = 0,
    z = 0,
    levels = 5,
} : ICreateJengaTower) => {

    for (let i = 0; i < levels; i++) {
        new BlockStructure({ 
            scene, 
            x: x + 0,
            y: y + i * 5,
            z: z + 0,

            numX: 2,
            numY: 1,
            numZ: 2,

            width: 1,
            height: 4,
            depth: 1,

            xGapMultiplier: 2,
            zGapMultiplier: 2,
        })

        new BlockStructure({ 
            scene, 

            x: x + 1,
            y: y + 4 + (i * 5),
            z: z + 1,

            numX: 1,
            numY: 1,
            numZ: 1,

            width: 3,
            height: 1,
            depth: 3,
        })
    }
}



export default BlockStructure


// boxInstance.physicsBody?.setCollisionCallbackEnabled(true)

// boxInstance.physicsBody?.getCollisionObservable().add((eventData) => {
//     if (eventData.distance > 1) {
//         const soundNumber = Math.floor(Math.random() * 6 + 1)
//         const catapultFiringSound = new Sound("crash", `sound/crash/${soundNumber}.wav`, this.scene, function () {
//             catapultFiringSound.play();
//         }, {
//             playbackRate: Math.random() + 0.5,
//             // offset: .3
//             volume: eventData.distance / 7
//         });
//     }
// });
// boxInstance.checkCollisions = true

// boxInstance.onCollideObservable