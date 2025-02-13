import json

def parse_json(json_str):
    result = json.loads(json_str)
    return result
    

def load_model_json(json_dict):
    assert(json_dict["packet_type"] == "model_params")
    return json_dict["model"]

def process_json(json_str):
    json_dict = parse_json(json_str)
    if json_dict["packet_type"] == "model_params":
        return load_model_json(json_dict)
    else:
        raise Exception("Unrecognized JSON packet received")