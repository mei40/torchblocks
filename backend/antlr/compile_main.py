from modelCodeGen import CodeGenerator
from jsonLoader import process_json
import sys
import json
import importlib

def main():
    if len(sys.argv) != 2:
        print("CALL ERROR: \nUsage: python3 compile_main.py path_to_json_file")
        return -1
    json_filename = sys.argv[1]
    model_filename = "backend/local/build/PrimaryModel.py"
    with open(json_filename, "r") as json_file:
        json_str = json_file.read()

    json_dict = process_json(json_str=json_str)
    gen_obj = CodeGenerator("PrimaryModel")
    gen_obj.set_model_dict(json_dict)
    gen_str = gen_obj.str_traversal_codegen(gen_obj.codegen_model())
    #print(gen_str)

    with open(model_filename, "w+") as model_file:
        model_file.write(gen_str)

    model_filename2 = "backend/antlr/build/PrimaryModel.py"
    with open(model_filename2, "w+") as model_file:
        model_file.write(gen_str)

    #get parameter count
    # import build.PrimaryModel as model
    primaryModule = importlib.import_module("build.PrimaryModel")
    curr_model = primaryModule.PrimaryModel()
    print(f"Total parameters: {sum(p.numel() for p in curr_model.parameters())} parameters")
    

if __name__ == "__main__":
    main()