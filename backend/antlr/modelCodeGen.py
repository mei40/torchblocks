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
        dataset = self.model_dict["dataset"]["type"]
        loss_function = self.model_dict["loss_function"]
        optimizer = self.model_dict["optimizer"]
        #Handle dataset:
        if dataset == "mnist":
            layerlist.append("self.train_dataset = torchvision.datasets.MNIST('build/data', train=True, download=True, transform=torchvision.transforms.ToTensor())")
            layerlist.append("self.test_dataset = torchvision.datasets.MNIST('build/data', train=False, download=True, transform=torchvision.transforms.ToTensor())")

        #Handle loss function:
        if loss_function["type"] == "crossentropyloss":
            layerlist.append("self.loss_function = torch.nn.CrossEntropyLoss()")
        elif loss_function["type"] == "mseloss":
            layerlist.append("self.loss_function = torch.nn.MSELoss()")

        # Initializes all specified layers
        for layer in self.model_dict["model"]["layers"]:
            # Layer blocks:
            if layer["layer_type"] == "linear":
                in_shape = layer["in_shape"]
                out_shape = layer["out_shape"]
                layerlist.append(f"self.layer{curr_layer} = torch.nn.Linear({in_shape}, {out_shape})")
            if layer["layer_type"] == "conv2d":
                in_channels = layer["in_channels"]
                out_channels = layer["out_channels"]
                kernel_size = layer["kernel_size"]
                stride = layer["stride"]
                padding = layer["padding"]
                layerlist.append(f"self.layer{curr_layer} = torch.nn.Conv2d({in_channels}, {out_channels}, kernel_size={kernel_size}, stride={stride}, padding={padding})")

            # Activation Functions:
            elif layer["layer_type"] == "relu":
                layerlist.append(f"self.layer{curr_layer} = torch.nn.functional.relu")
            elif layer["layer_type"] == "sigmoid":
                layerlist.append(f"self.layer{curr_layer} = torch.nn.functional.sigmoid")
            elif layer["layer_type"] == "tanh":
                layerlist.append(f"self.layer{curr_layer} = torch.nn.functional.tanh")

            # Other blocks:
            elif layer["layer_type"] == "log_softmax":
                layerlist.append(f"self.layer{curr_layer} = torch.nn.functional.log_softmax")
            elif layer["layer_type"] == "view":
                pass #handle within forward function

            curr_layer += 1

        #Handle optimizer:
        if optimizer["type"] == "adam":
            learning_rate = float(optimizer["parameters"]["learning_rate"])
            layerlist.append(f"self.optimizer = torch.optim.Adam(self.parameters(), lr={learning_rate})")
        elif optimizer["type"] == "sgd":
            learning_rate = float(optimizer["lr"])
            momentum = float(optimizer["momentum"])
            layerlist.append(f"self.optimizer = torch.optim.SGD(self.parameters(), lr={learning_rate}, momentum={momentum})")

        linelist.append(layerlist)
        return linelist
    
    def codegen_model_forward(self):
        # Generates the forward method for the neural network
        # Backwards method/gradient descent is superseded within the nn.Module class
        linelist = ["def forward(self, curr_tensor):"]
        layerlist = []
        curr_layer = 1
        for layer in self.model_dict["model"]["layers"]:

            if layer["layer_type"] == "log_softmax":
                layerlist.append(f"curr_tensor = self.layer{curr_layer}(curr_tensor, -1)")

            elif layer["layer_type"] == "view":
                shape1 = layer["out_shape"]
                layerlist.append(f"curr_tensor = curr_tensor.view(-1, {shape1})") #parentheses are added

            elif layer["layer_type"] == "maxpool2d":
                kernel_size = int(layer["kernel_size"])
                layerlist.append(f"curr_tensor = torch.nn.functional.max_pool2d(curr_tensor, kernel_size={kernel_size})") #parentheses are added
            # more layer edge cases should be added here

            else:
                layerlist.append(f"curr_tensor = self.layer{curr_layer}(curr_tensor)")
            curr_layer += 1
        layerlist.append("return curr_tensor")
        linelist.append(layerlist)
        return linelist
