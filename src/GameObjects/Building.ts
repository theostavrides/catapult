import { Color3, Mesh, MeshBuilder, PhysicsAggregate,  PhysicsShapeType, Scene, StandardMaterial, Vector3 } from '@babylonjs/core'
import blueprints from '../../public/blueprints.json'

export type BuildingName = string

class Building {
    constructor(scene: Scene, buildingName: BuildingName){
        const structure = blueprints[buildingName]

        const blocks: Mesh[] = []
        
        structure.forEach(block => {
            const { dimensions, location } = block

            // Create box
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
            
            // Physics 
            new PhysicsAggregate(box, PhysicsShapeType.BOX, { mass: dimensions.x * dimensions.y * dimensions.z * 50 }, scene)
        })
    }
}

export default Building