import torch, torchvision
# from backend.local.modelTrain import modelTrainer # Assuming CWD is project root, this should work
from modelTrain import modelTrainer # If CWD is backend/local, this works. If CWD is project_root, backend.local.modelTrain is needed
                                  # Given main.js sets CWD to project_root, we'll use backend.local.modelTrain

import sys
import os
import json
import importlib

# Ensure the project root (which is the CWD set by main.js) is in sys.path
# so that 'from backend.local...' imports work.
project_root_cwd = os.getcwd()
if project_root_cwd not in sys.path:
    sys.path.insert(0, project_root_cwd)

# SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
# sys.path.append(os.path.dirname(SCRIPT_DIR)) # No longer needed if CWD is project root

# Dynamic import of PrimaryModel will replace this static import
# from build.PrimaryModel import PrimaryModel 

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("CALL ERROR: \nUsage: python run_main.py <epochs> <path_to_primary_model_py> <output_results_json_path>")
        sys.exit(1)

    num_epochs = int(sys.argv[1])
    primary_model_py_path = sys.argv[2]
    output_results_json_path = sys.argv[3]

    # Dynamically import PrimaryModel
    PrimaryModelClass = None
    try:
        model_module_dir = os.path.dirname(primary_model_py_path)
        model_module_name = os.path.splitext(os.path.basename(primary_model_py_path))[0] # Should be "PrimaryModel"
        
        original_sys_path = list(sys.path)
        if model_module_dir not in sys.path:
            sys.path.insert(0, model_module_dir)
        
        # Ensure __init__.py exists in model_module_dir (created by compile_main.py)
        # init_py_path = os.path.join(model_module_dir, "__init__.py")
        # if not os.path.exists(init_py_path):
        #     print(f"Warning: {init_py_path} not found. Dynamic import might fail or behave unexpectedly.")

        imported_module = importlib.import_module(model_module_name)
        importlib.reload(imported_module) # Reload in case it was changed
        PrimaryModelClass = getattr(imported_module, model_module_name)

    except Exception as e:
        print(f"Error dynamically importing PrimaryModel from {primary_model_py_path}: {e}")
        print(f"Current sys.path: {sys.path}")
        sys.exit(1)
    finally:
        if 'original_sys_path' in locals(): # Restore sys.path if it was modified
            sys.path = original_sys_path

    if PrimaryModelClass is None:
        print("Failed to load PrimaryModel class.")
        sys.exit(1)

    curr_model = PrimaryModelClass()
    
    # Adjust import for modelTrainer based on CWD being project_root
    # This assumes backend/__init__.py and backend/local/__init__.py exist to make them packages
    try:
        from backend.local.modelTrain import modelTrainer as ModelTrainerClass # Use alias to avoid conflict if needed
    except ImportError as e:
        print(f"Error importing modelTrainer: {e}. Ensure backend and backend/local have __init__.py files.")
        print(f"CWD is expected to be the project root. Current CWD: {os.getcwd()}")
        print(f"sys.path: {sys.path}")
        sys.exit(1)

    trainer = ModelTrainerClass(curr_model)
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    loss_history = [] # Renamed from loss to avoid conflict with loss module
    accs_history = [] # Renamed from accs
    
    # Ensure output directory for results.json exists
    os.makedirs(os.path.dirname(output_results_json_path), exist_ok=True)

    for epoch in range(num_epochs):
        # Pass a copy or ensure train modifies them safely if they are to be accumulated across epochs
        current_epoch_loss_history = list(loss_history) 
        current_epoch_accs_history = list(accs_history)

        # The train method seems to append to the passed lists and also return them.
        # Let's adjust to use what train returns, and then append test results.
        train_loss_returned, train_acc_returned = trainer.train(device, epoch, current_epoch_loss_history, current_epoch_accs_history, output_results_json_path)
        
        test_result = trainer.test(device)
        
        # Update history with results from this epoch's training and testing
        # Assuming train_loss_returned and train_acc_returned are the complete histories up to that point from train
        loss_history = train_loss_returned 
        accs_history = train_acc_returned
        loss_history.append((float(epoch + 1), test_result["loss"])) # Append test loss for this epoch
        accs_history.append((float(epoch + 1), test_result["accuracy"])) # Append test accuracy for this epoch
        
        with open(output_results_json_path, "w+") as outfile:
            jsondict = {"losses": loss_history, "accuracies": accs_history}
            outfile.write(json.dumps(jsondict, indent=4))
    print(f"Training finished. Results saved to {output_results_json_path}")
