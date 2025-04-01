import json

nb_filename = "backend/google/build/PrimaryModel.ipynb"
#generate cells:
main_entry = dict()
cells_entry = []
#generate model cell
model_entry = dict()
model_entry["cell_type"] = "code"
model_entry["execution_count"] = 0
model_entry["metadata"] = {"id": "123456781234"}
model_entry["outputs"] = []
model_source = []
#retrieve code from PrimaryModel.py
model_filename = "backend/local/build/PrimaryModel.py"
with open(model_filename, "r") as model_file:
    model_strs = model_file.readlines()
    for line in model_strs:
        model_source.append(line)
model_entry["source"] = model_source
cells_entry.append(model_entry)


#generate training class code cell
train_entry = dict()
train_entry["cell_type"] = "code"
train_entry["execution_count"] = 0
train_entry["metadata"] = {"id": "876543218765"}
train_entry["outputs"] = []
train_source = []
#retrieve code from modelTrain.py
train_filename = "backend/local/modelTrain.py"
with open(train_filename, "r") as train_file:
    train_strs = train_file.readlines()[2:]
    for line in train_strs:
        train_source.append(line)
train_entry["source"] = train_source
cells_entry.append(train_entry)


#generate run cell
run_entry = dict()
run_entry["cell_type"] = "code"
run_entry["execution_count"] = 0
run_entry["metadata"] = {"id": "727072707270"}
run_entry["outputs"] = []
run_source = []
#retrieve code from PrimaryModel.py
run_filename = "backend/local/run_main.py"
with open(run_filename, "r") as run_file:
    run_strs = run_file.readlines()[16:]
    for line in run_strs:
        run_source.append(line)
run_entry["source"] = run_source
cells_entry.append(run_entry)


#generate metadata
metadata_entry = {
    "accelerator": "GPU",
    "colab": {
        "gpuType": "T4",
        "provenance": []
    },
    "kernelspec": {
        "display_name": "Python 3",
        "name": "python3"
    },
    "language_info": {
        "codemirror_mode": {
            "name": "ipython",
            "version": 3
        },
        "file_extension": ".py",
        "mimetype": "text/x-python",
        "name": "python",
        "nbconvert_exporter": "python",
        "pygments_lexer": "ipython3",
        "version": "3.12.1"
    },
    "vscode": {
        "interpreter": {
            "hash": "b0fa6594d8f4cbf19f97940f81e996739fb7646882a419484c72d19e05852a7e"
        }
    }
}


#finish json and output to ipynb
main_entry["cells"] = cells_entry
main_entry["metadata"] = metadata_entry
main_entry["nbformat"] = 4
main_entry["nbformat_minor"] = 0

gen_str = json.dumps(main_entry)
with open(nb_filename, "w") as nb_file:
    nb_file.write(gen_str)