from modelCodeGen import CodeGenerator
from jsonLoader import process_json
import sys
import json
import importlib
import os

def main():
    if len(sys.argv) != 3:
        print("CALL ERROR: \nUsage: python compile_main.py <input_json_path> <output_model_py_path>")
        return -1
    
    input_json_path = sys.argv[1]
    output_model_py_path = sys.argv[2]

    # Ensure output directory exists (defensive, main.js should also do this)
    output_model_dir = os.path.dirname(output_model_py_path)
    os.makedirs(output_model_dir, exist_ok=True)

    # Create an __init__.py in the output directory to make it a package
    # This helps with the dynamic import later.
    init_py_path = os.path.join(output_model_dir, "__init__.py")
    if not os.path.exists(init_py_path):
        with open(init_py_path, "w") as f:
            f.write("# Automatically generated __init__.py\n")

    with open(input_json_path, "r") as json_file:
        json_str = json_file.read()

    json_dict = process_json(json_str=json_str)
    # Assuming model name is derived from the output filename, e.g., PrimaryModel.py -> PrimaryModel
    module_name_for_class = os.path.splitext(os.path.basename(output_model_py_path))[0]
    gen_obj = CodeGenerator(module_name_for_class) # Pass the base name like "PrimaryModel"
    gen_obj.set_model_dict(json_dict)
    gen_str = gen_obj.str_traversal_codegen(gen_obj.codegen_model())

    with open(output_model_py_path, "w+") as model_file:
        model_file.write(gen_str)
    print(f"Generated model written to: {output_model_py_path}")

    # Parameter counting import
    try:
        # Temporarily add the output directory to sys.path to import the generated module directly
        original_sys_path = list(sys.path)
        if output_model_dir not in sys.path:
            sys.path.insert(0, output_model_dir)
        
        # The module to import is the filename without .py extension
        # module_name_for_import = os.path.splitext(os.path.basename(output_model_py_path))[0]
        # Since output_model_dir is in sys.path, and it contains PrimaryModel.py (and __init__.py)
        # we should be able to import PrimaryModel directly if PrimaryModel.py is the module.
        # However, if output_model_dir is like .../dynamic_data/build, and it contains PrimaryModel.py
        # and __init__.py, then we should add .../dynamic_data to sys.path and import build.PrimaryModel
        # Let's simplify: add output_model_dir (e.g. .../build) to sys.path and import PrimaryModel (the file name)

        imported_module = importlib.import_module(module_name_for_class)
        
        # Refresh the module if it was imported before (e.g. in a loop or previous run)
        importlib.reload(imported_module)
        
        model_class = getattr(imported_module, module_name_for_class)
        curr_model = model_class()
        print(f"Total parameters: {sum(p.numel() for p in curr_model.parameters())} parameters")

    except ModuleNotFoundError as e:
        print(f"Error importing generated model for parameter count: {e}")
        print(f"Attempted to import '{module_name_for_class}' from directory '{output_model_dir}'. Check paths and __init__.py.")
        print(f"Current sys.path: {sys.path}")
    except AttributeError as e:
        print(f"Error getting class '{module_name_for_class}' from module or instantiating it: {e}")
    except Exception as e:
        print(f"An unexpected error occurred during parameter count: {e}")
    finally:
        # Restore original sys.path
        sys.path = original_sys_path

if __name__ == "__main__":
    main()