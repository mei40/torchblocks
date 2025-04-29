cd ../
mkdir -p backend/local/build
(echo Starting Code Generation...) > backend/local/build/model_run.log
(python3 backend/antlr/compile_main.py frontend/build/model.json) >> backend/local/build/model_run.log 2>&1
(echo Code Generation Finished!) >> backend/local/build/model_run.log
(echo Starting Notebook Generation...) >> backend/local/build/model_run.log
python3 backend/google/gen_notebook.py
(echo Notebook Generation Finished!) >> backend/local/build/model_run.log

python3 backend/google/gen_clientsecrets.py
python3 backend/google/file_uploader.py backend/google/build/PrimaryModel.ipynb