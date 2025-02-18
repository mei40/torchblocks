ANTLR_SCRIPT := backend/antlr/modelParser.g4

compiler:
	@echo "building antlr parser"
	antlr4 -o build -Dlanguage=Python3 $(ANTLR_SCRIPT)

compilertest:
	@echo "testing compiler..."
	cd backend/antlr; python3 codeGenTester.py

clean:
	@echo "Removing temporary files"
	@echo "Deleting build files..."
	rm -rf build
	@echo "Done!"
