import cryptography
import cryptography.fernet
import hashlib, base64

keyword = base64.urlsafe_b64encode(hashlib.md5("torchblocks".encode()).hexdigest().encode())

f = cryptography.fernet.Fernet(keyword)

filename = "backend/google/client_secrets.dat"
outfile = "backend/google/build/client_secrets.json"

with open(filename, "rb") as f1:
    f_data = f1.read()

f_enc = f.decrypt(f_data)

with open(outfile, "wb") as f1:
    f1.write(f_enc)
