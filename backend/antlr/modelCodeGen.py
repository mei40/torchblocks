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
        linelist = ["import torch"\
                    ]
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
        return linelist
    
    def codegen_model_init(self):
        # Initializes all specified layers
        linelist = ["def __init__(self):"]
        layerlist = [f"super({self.name}, self).__init__()"]
        curr_layer = 1
        for layer in self.model_dict["layers"]:
            if layer["layer_type"] == "linear":
                layerlist.append(f"self.layer{curr_layer} = torch.nn.Linear({layer["in_shape"]}, {layer["out_shape"]})")
            elif layer["layer_type"] == "relu":
                layerlist.append(f"self.layer{curr_layer} = torch.nn.functional.relu")
            elif layer["layer_type"] == "log_softmax":
                layerlist.append(f"self.layer{curr_layer} = torch.nn.functional.log_softmax")
            curr_layer += 1
        linelist.append(layerlist)
        return linelist
