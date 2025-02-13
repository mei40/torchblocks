from modelCodeGen import CodeGenerator
from jsonLoader import process_json

num_tests = 1

for test_idx in range(1, num_tests+1):
    input_file = open(f"tests/inputs/input{test_idx}.json", "r")
    raw_json = input_file.read()
    json_dict = process_json(raw_json)
    print(json_dict)
    input_file.close()

    codegen_obj = CodeGenerator("PrimaryModel")
    codegen_obj.set_model_dict(json_dict)
    codegen_linelist = codegen_obj.codegen_model()
    codegen_str = codegen_obj.str_traversal_codegen(codegen_linelist)
    
    expected_file = open(f"tests/expected/expected{test_idx}.py", "r")
    expected_str = expected_file.read()
    print(f"Checking test {test_idx}...")
    if codegen_str.strip() != expected_str.strip():
        print(codegen_str)
        print(expected_str)
        print("Test failed! Generated code does not match expected result.")
    else:
        print("Test passed! Generated code matches expected result!")

