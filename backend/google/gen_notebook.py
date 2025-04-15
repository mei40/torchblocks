import json

nb_filename = "backend/google/build/PrimaryModel.ipynb"
skeleton_filename = "backend/google/SkeletonNotebook.json"

#generate cells:
with open(skeleton_filename, "r") as skeleton_file:
    main_entry = json.load(fp=skeleton_file)

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

main_entry["cells"][2] = model_entry


#finish json and output to ipynb
main_entry["nbformat"] = 4
main_entry["nbformat_minor"] = 0

gen_str = json.dumps(main_entry)
with open(nb_filename, "w") as nb_file:
    nb_file.write(gen_str)