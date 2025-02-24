import torch
import torchvision
class PrimaryModel(torch.nn.Module):
    def __init__(self):
        super(PrimaryModel, self).__init__()
        self.train_dataset = torchvision.datasets.MNIST('build/data', train=True, download=True)
        self.test_dataset = torchvision.datasets.MNIST('build/data', train=False, download=True)
        self.loss_function = torch.nn.CrossEntropyLoss()
        self.optimizer = torch.optim.adam(self.parameters(), lr=0.001)
        self.layer1 = torch.nn.Linear(64, 5)
        self.layer2 = torch.nn.functional.relu
        self.layer3 = torch.nn.functional.log_softmax
    def forward(self, curr_tensor):
        curr_tensor = self.layer1(curr_tensor)
        curr_tensor = self.layer2(curr_tensor)
        curr_tensor = self.layer3(curr_tensor, -1)
        return curr_tensor
