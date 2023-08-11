import { Color3, Mesh, MeshBuilder, PhysicsAggregate, PhysicsBody, PhysicsMotionType, PhysicsShapeBox, PhysicsShapeType, PhysicsViewer, Quaternion, Scene, StandardMaterial, TransformNode, Vector3 } from '@babylonjs/core'
import blueprints from '../../public/models/blueprints.json'


class Castle {
    constructor(scene: Scene){
        const { castle } = blueprints
        const blocks: Mesh[] = []
        const physicsViewer = new PhysicsViewer(scene)
        
        castle.forEach(block => {
            const { dimensions, location } = block

            const box = MeshBuilder.CreateBox("box", { 
                width: dimensions.x,
                height: dimensions.y, 
                depth: dimensions.z, 
            }, scene)
            
            box.position.addInPlace(new Vector3(location.x,location.y,location.z))

            const material = new StandardMaterial("boxMat", scene)
            material.diffuseColor = new Color3(.4,.4,.5)
            box.material = material

            blocks.push(box)            
            
            // const body = new PhysicsBody(box, PhysicsMotionType.DYNAMIC, false, scene)
            
            // body.setMassProperties({ mass: dimensions.x * dimensions.y * dimensions.z * 100 })
            
            // body.shape = new PhysicsShapeBox(
            //     new Vector3(0,0,0), 
            //     new Quaternion(0,0,0,1), 
            //     new Vector3(dimensions.x, dimensions.y, dimensions.z), 
            //     scene
            // )
            
            
            // physicsViewer.showBody(body)
            new PhysicsAggregate(box, PhysicsShapeType.BOX, { mass: 200 }, scene)
        })
        

    }
}

export default Castle