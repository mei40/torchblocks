import torch, torchvision
from modelTrain import modelTrainer

import sys
import os

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
    trainer.train(device)
    trainer.test(device)