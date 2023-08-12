import { Color3, Mesh, MeshBuilder, PhysicsAggregate, PhysicsBody, PhysicsMotionType, PhysicsShapeBox, PhysicsShapeType, PhysicsViewer, Quaternion, Scene, StandardMaterial, TransformNode, Vector3 } from '@babylonjs/core'
import blueprints from '../../public/models/blueprints.json'


class Castle {
    constructor(scene: Scene){
        const { castle } = blueprints
        const blocks: Mesh[] = []
        // const physicsViewer = new PhysicsViewer(scene)
        
        castle.forEach(block => {
            const { dimensions, location } = block

            const box = MeshBuilder.CreateBox("box", { 
                width: dimensions.x,
                height: dimensions.y, 
                depth: dimensions.z, 
            }, scene)
            
            box.position.addInPlace(new Vector3(location.x,location.y,location.z))

            // Material
            const material = new StandardMaterial("boxMat", scene)

            const v = .4 + (Math.random() * .05)
            material.diffuseColor = new Color3(v,v,v)
            
            box.material = material

            blocks.push(box)            
            
            // physicsViewer.showBody(body)
            new PhysicsAggregate(box, PhysicsShapeType.BOX, { mass: 200 }, scene)
        })
        

    }
}

export default Castle