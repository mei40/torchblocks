class CodeGenerator():
    def __init__(self, name):
        self.name = name
        self.model_dict = None
    
    def set_model_dict(self, json_dict):
        self.model_dict = json_dict

    def str_traversal_codegen(self, linelist): 
        # This function converts a linelist into a single printable string of Python code
        return self.recursive_traversal_codegen(linelist, 0)
    def recursive_traversal_codegen(self, linelist, depth):
        final_str = ""
        for elem in linelist:
            if type(elem) is str:
                final_str += (" " * (4 * depth)) + elem + "\n"
            else:
                final_str += self.recursive_traversal_codegen(elem, depth+1)
        return final_str
    
    def codegen_model_dependencies(self):
        # Any needed imports will be 
        linelist = ["import torch",
                    "import torchvision"]
        return linelist
    
    def codegen_model(self):
        # Cumulative generator that creates a linelist for a complete file
        linelist = self.codegen_model_dependencies()
        linelist += self.codegen_model_class()
        return linelist

    def codegen_model_class(self):
        # Generates the init and forward functions of the class
        linelist = [f"class {self.name}(torch.nn.Module):"]
        linelist.append(self.codegen_model_init())
        linelist.append(self.codegen_model_forward())
        return linelist
    
    def codegen_model_init(self):
        linelist = ["def __init__(self):"]
        layerlist = [f"super({self.name}, self).__init__()"]
        curr_layer = 1
        # initialize hyperparameters of the model
        dataset = self.model_dict["dataset"]
        loss_function = self.model_dict["loss_function"]
        optimizer = self.model_dict["optimizer"]
        if dataset == "mnist":
            layerlist.append("self.train_dataset = torchvision.datasets.MNIST('build/data', train=True, download=True, transform=torchvision.transforms.ToTensor())")
            layerlist.append("self.test_dataset = torchvision.datasets.MNIST('build/data', train=False, download=True, transform=torchvision.transforms.ToTensor())")

        if loss_function == "crossentropyloss":
            layerlist.append("self.loss_function = torch.nn.CrossEntropyLoss()")

        # Initializes all specified layers
        for layer in self.model_dict["layers"]:
            if layer["layer_type"] == "linear":
                in_shape = layer["in_shape"]
                out_shape = layer["out_shape"]
                layerlist.append(f"self.layer{curr_layer} = torch.nn.Linear({in_shape}, {out_shape})")
            elif layer["layer_type"] == "relu":
                layerlist.append(f"self.layer{curr_layer} = torch.nn.functional.relu")
            elif layer["layer_type"] == "log_softmax":
                layerlist.append(f"self.layer{curr_layer} = torch.nn.functional.log_softmax")
            #more layer types should be added here
            curr_layer += 1

        if optimizer["name"] == "adam":
            learning_rate = float(optimizer["lr"])
            layerlist.append(f"self.optimizer = torch.optim.Adam(self.parameters(), lr={learning_rate})")

        linelist.append(layerlist)
        return linelist
    
    def codegen_model_forward(self):
        # Generates the forward method for the neural network
        # Backwards method/gradient descent is superseded within the nn.Module class
        linelist = ["def forward(self, curr_tensor):"]
        layerlist = []
        curr_layer = 1
        for layer in self.model_dict["layers"]:
            if layer["layer_type"] == "log_softmax":
                layerlist.append(f"curr_tensor = self.layer{curr_layer}(curr_tensor, -1)")
            # more layer edge cases should be added here
            else:
                layerlist.append(f"curr_tensor = self.layer{curr_layer}(curr_tensor)")
            curr_layer += 1
        layerlist.append("return curr_tensor")
        linelist.append(layerlist)
        return linelist
