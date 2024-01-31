# Use this in the blender python console
# Run this command (change filepath as necessary): 
# exec(compile(open(filename).read(), '/Users/theostavrides/Desktop/misc/Tzatziki_Studios/catapult/public/blueprints.json', 'exec'))

import json

json_file_path = "/Users/theostavrides/Desktop/misc/Tzatziki_Studios/catapult/public/blueprints.json"

def parse_xyz(obj, include_w=False):
    parsed = {
        "x": round(obj.x, 3),
        "y": round(obj.z, 3),
        "z": round(obj.y, 3),
    }

    if include_w == True:
        parsed["w"] = obj.w

    return parsed

def generate_data(blenderObjectName):
    data = []

    for obj in bpy.data.objects:
        if (hasattr(obj, "parent") and hasattr(obj.parent, "name")):
            if (obj.parent.name == blenderObjectName):
                block = {
                    "location": parse_xyz(obj.location),
                    "dimensions": parse_xyz(obj.dimensions),
                    # "quaternion": parse_xyz(obj.rotation_euler.to_quaternion(), True)
                }
                
                data.append(block)

    return data

def write_data_to_json_file():
    data = {
        "fort2": generate_data("Fort2"),
        "fort": generate_data("Fort"),
        "fortTower": generate_data("FortTower"),
    }
    out_file = open(json_file_path, "w")
    json.dump(data, out_file)
    out_file.close

write_data_to_json_file()

print(f"Success: output written to {json_file_path}")