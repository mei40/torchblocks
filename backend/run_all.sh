cd ../
#python3 backend/antlr/compile_main.py frontend/build/model.json
mkdir -p backend/local/build
python3 backend/antlr/compile_main.py backend/antlr/tests/inputs/input1.json
(python3 backend/local/run_main.py) &> backend/local/build/model_run.log