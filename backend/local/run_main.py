import torch, torchvision
from modelTrain import modelTrainer

import sys
import os
import json

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
#print(SCRIPT_DIR)
sys.path.append(os.path.dirname(SCRIPT_DIR))

from build.PrimaryModel import PrimaryModel

# WARNING:
# This file REQUIRES compile_main.py to be run before execution.
# This is such that build/PrimaryModel.py exists and is up-to-date. 
if __name__ == "__main__":
    curr_model = PrimaryModel()
    trainer = modelTrainer(curr_model)
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    loss = []
    accs = []
    out_filename = "backend/local/build/local_results.json"
    model_filename = "backend/local/build/model_params.txt"
    for epoch in range(int(sys.argv[1])):
        train_loss, train_acc = trainer.train(device, epoch, loss, accs, out_filename)
        test_result = trainer.test(device)
        loss += train_loss
        accs += train_acc
        loss.append((float(epoch+1), test_result["loss"]))
        accs.append((float(epoch+1), test_result["accuracy"]))
        with open(out_filename, "w+") as outfile:
            jsondict = {"losses": loss, "accuracies": accs}
            outfile.write(json.dumps(jsondict, indent=4))
