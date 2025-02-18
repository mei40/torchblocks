import torch
class PrimaryModel(torch.nn.Module):
    def __init__(self):
        super(PrimaryModel, self).__init__()
        self.layer1 = torch.nn.Linear(64, 5)
        self.layer2 = torch.nn.functional.relu
        self.layer3 = torch.nn.functional.log_softmax
    def forward(self, curr_tensor):
        curr_tensor = self.layer1(curr_tensor)
        curr_tensor = self.layer2(curr_tensor)
        curr_tensor = self.layer3(curr_tensor, -1)
        return curr_tensor
