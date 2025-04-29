import torch
import json

class modelTrainer():
    def __init__(self, p_model):
        self.model = p_model
        self.train_loader = torch.utils.data.DataLoader(p_model.train_dataset, batch_size=64, shuffle=True)
        self.test_loader = torch.utils.data.DataLoader(p_model.train_dataset, batch_size=1000, shuffle=False)
    
    def test(self, device):
        test_loss = 0
        num_correct = 0
        total_num = len(self.test_loader.dataset)
        num_batches = len(self.test_loader)
        preds = []
        self.model = self.model.to(device)
        with torch.no_grad():
            for images, targets in self.test_loader:
                test_output = self.model(images.to(device))
                test_loss += self.model.loss_function(test_output, targets.to(device)).item()
                pred = test_output.data.max(1, keepdim=True)[1]
                num_correct += pred.eq(targets.to(device).data.view_as(pred)).sum().item()
                preds += pred
        test_stat = {"loss": test_loss / num_batches, "accuracy": num_correct / total_num, "prediction": torch.tensor(preds)}
        # print(f"Test result: total samples: {total_num}, Avg loss: {test_stat['loss']:.3f}, Accuracy: {100*test_stat['accuracy']:.3f}%")
        return test_stat
    
    def train(self, device, epoch, train_loss, train_acc, out_filename, divs=10):
        self.model.train()
        self.model = self.model.to(device)
        last_print_batch_idx = 0
        for batch_idx, (images, targets) in enumerate(self.train_loader):
            images = images.to(device)
            targets = targets.to(device)
            self.model.optimizer.zero_grad()
            train_output = self.model(images)
            loss = self.model.loss_function(train_output, targets)
            loss.backward()
            self.model.optimizer.step()
            # train_loss.append(loss.item())

            if (batch_idx - last_print_batch_idx > (len(self.train_loader) / divs)):
                last_print_batch_idx = batch_idx
                curr_progress = epoch + (batch_idx*len(images)) / (len(self.train_loader.dataset))
                test_stat = self.test(device=device)
                curr_loss = test_stat["loss"]
                curr_acc = test_stat["accuracy"]
                train_loss.append((curr_progress, curr_loss))
                train_acc.append((curr_progress, curr_acc))
                with open(out_filename, "w+") as outfile:
                    jsondict = {"losses": train_loss, "accuracies": train_acc}
                    outfile.write(json.dumps(jsondict, indent=4))
                # print(f'Current Epoch: Progress: [{batch_idx*len(images)}/{len(self.train_loader.dataset)}], Current Loss: {loss.item():.3f}')

        return train_loss, train_acc