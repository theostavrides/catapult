
# Important!!!: Run this file with "npm run export:blendermodels"

import bpy
import json


json_file_path = "public/models/blueprints.json"
blender_file_path = "blender/catapult.blend"

bpy.ops.wm.open_mainfile(filepath=blender_file_path)

def parse_xyz(obj, include_w=False):
    parsed = {
        "x": round(obj.x, 3),
        "y": round(obj.z, 3),
        "z": round(obj.y, 3),
    }

    if include_w == True:
        parsed["w"] = obj.w

    return parsed

def generate_castle_data():
    castleData = []

    # print all objects
    for obj in bpy.data.objects:
        if (hasattr(obj, "parent") and hasattr(obj.parent, "name")):
            if (obj.parent.name == "Castle"):
                block = {
                    "location": parse_xyz(obj.location),
                    "dimensions": parse_xyz(obj.dimensions),
                    # "quaternion": parse_xyz(obj.rotation_euler.to_quaternion(), True)
                }
                
                castleData.append(block)

    return castleData

def write_data_to_json_file():
    data = {
        "castle": generate_castle_data()
    }
    out_file = open(json_file_path, "w")
    json.dump(data, out_file)
    out_file.close

write_data_to_json_file()

print(f"Success: output written to {json_file_path}")