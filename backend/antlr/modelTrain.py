import torch

class modelTrainer():
    def __init__(self, p_model):
        self.model = p_model
        self.train_loader = torch.utils.data.DataLoader(p_model.train_dataset, batch_size=64, shuffle=True)
        self.test_loader = torch.utils.data.DataLoader(p_model.train_dataset, batch_size=1000, shuffle=False)
    
    def test(self, device):
        test_loss = 0
        num_correct = 0
        total_num = len(self.model.test_loader.dataset)
        preds = []
        with torch.no_grad():
            for images, targets in self.test_loader:
                test_output = self.model(images.to(device))
                test_loss += self.model.loss_fn(test_output, targets.to(device)).item()
                pred = test_output.data.max(1, keepdim=True)[1]
                num_correct += pred.eq(targets.to(device).data.view_as(pred)).sum()
                preds += pred
        test_stat = {"loss": test_loss / total_num, "accuracy": num_correct / total_num, "prediction": torch.tensor(preds)}
        print(f"Test result: total sample: {total_num}, Avg loss: {test_stat['loss']:.3f}, Acc: {100*test_stat['accuracy']:.3f}%")
        # ----------- <Your code> ---------------
        # dictionary should include loss, accuracy and prediction
        assert "loss" and "accuracy" and "prediction" in test_stat.keys()
        # "prediction" value should be a 1D tensor
        assert len(test_stat["prediction"]) == len(self.test_loader.dataset)
        assert isinstance(test_stat["prediction"], torch.Tensor)
        return test_stat
    
    def train(self, device):
        self.model.train()
        train_loss = []
        last_print_batch_idx = 0
        for batch_idx, (images, targets) in enumerate(self.train_loader):
            images = images.to(device)
            targets = targets.to(device)
            self.model.optimizer.zero_grad()
            train_output = self.model(images)
            loss = self.model.loss_function(train_output, targets)
            loss.backward()
            self.optimizer.step()
            train_loss.append(loss.item())

            if (batch_idx - last_print_batch_idx > (len(self.train_loader) / 9)):
                last_print_batch_idx = batch_idx
                print(f'Current Epoch: [{batch_idx*len(images)}/{len(self.train_loader.dataset)}] Loss: {loss.item():.3f}')


        # ----------- <End Your code> ---------------
        assert len(train_loss) == len(self.train_loader)
        return train_loss