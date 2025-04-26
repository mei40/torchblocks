cd ../
#python3 backend/antlr/compile_main.py frontend/build/model.json
mkdir -p backend/local/build
(echo Starting Code Generation...) > backend/local/build/model_run.log
python3 backend/antlr/compile_main.py frontend/build/model.json
(echo Code Generation Finished!) >> backend/local/build/model_run.log 
(echo Starting Model Training...) >> backend/local/build/model_run.log
(python3 backend/local/run_main.py 3) >> backend/local/build/model_run.log 2>&1
(echo Model Training Finished! Please check the evaluation results. ) >> backend/local/build/model_run.log