import torch
import torchvision
class PrimaryModel(torch.nn.Module):
    def __init__(self):
        super(PrimaryModel, self).__init__()
        self.train_dataset = torchvision.datasets.MNIST('build/data', train=True, download=True, transform=torchvision.transforms.ToTensor())
        self.test_dataset = torchvision.datasets.MNIST('build/data', train=False, download=True, transform=torchvision.transforms.ToTensor())
        self.loss_function = torch.nn.CrossEntropyLoss()
        self.layer2 = torch.nn.Linear(784, 10)
        self.layer3 = torch.nn.functional.relu
        self.layer4 = torch.nn.functional.log_softmax
        self.optimizer = torch.optim.Adam(self.parameters(), lr=0.001)
    def forward(self, curr_tensor):
        curr_tensor = curr_tensor.view(-1, 784)
        curr_tensor = self.layer2(curr_tensor)
        curr_tensor = self.layer3(curr_tensor)
        curr_tensor = self.layer4(curr_tensor, -1)
        return curr_tensor
