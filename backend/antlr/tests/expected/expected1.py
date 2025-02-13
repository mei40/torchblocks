import torch
class PrimaryModel(torch.nn.Module):
    def __init__(self):
        super(PrimaryModel, self).__init__()
        self.layer1 = torch.nn.Linear(64, 5)
        self.layer2 = torch.nn.functional.relu
        self.layer3 = torch.nn.functional.log_softmax
