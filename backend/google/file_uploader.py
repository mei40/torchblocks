#!/usr/bin/python
# Copyright 2022 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.


"""Google Drive Quickstart in Python.

This script uploads a single file to Google Drive.
"""

import googleapiclient.http
import httplib2
import oauth2client.client
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

import sys
import time
import json
import io

# OAuth 2.0 scope that will be authorized.
# Check https://developers.google.com/drive/scopes for all available scopes.
OAUTH2_SCOPE = "https://www.googleapis.com/auth/drive.file"

# Location of the client secrets.
# This was generated from Brandon Mei's Google Account. 
# Please contact him (brandonymei@gmail.com) for any inquiries. 
CLIENT_SECRETS = "backend/google/build/client_secrets.json"
AUTHINFO_FILE = "backend/google/build/authinfo.json"
AUTHINFO_SKELETON = "backend/google/SkeletonAuth.json"
RESULTS_FILE = "backend/local/build/local_results.json"

# Path to the file to upload.
FILENAME = sys.argv[1]

# Metadata about the file.
MIMETYPE = "text/plain"
MAIN_FOLDER = "torchblocks"
TITLE = "PrimaryModel.ipynb"
DESCRIPTION = "Main Jupyter Notebook"

with open(AUTHINFO_FILE, "rb") as auth_fp:
    self_authinfo = json.load(auth_fp)

# Perform OAuth2.0 authorization flow.
# flow = oauth2client.client.flow_from_clientsecrets(CLIENT_SECRETS, OAUTH2_SCOPE)
# flow.redirect_uri = "http://localhost:3000/"
# authorize_url = flow.step1_get_authorize_url()
# print(authorize_url)
# print(self_authinfo["auth_link"])
# self_authinfo["auth_link"] = authorize_url
code = ""
while not code:
    with open(AUTHINFO_FILE, "rb") as auth_fp:
        self_authinfo = json.load(auth_fp)
        code = self_authinfo["auth_code"]
    if not code:
        time.sleep(1)
# self_authinfo["auth_code"] = code
# credentials = flow.step2_exchange(code)

# Extract the redirect URI from the auth_link in the authinfo.json file
# for not relying only on localhost:3000
try:
    auth_link = self_authinfo.get("auth_link", "")
    redirect_uri = "http://localhost:3000/"  # Default fallback
    
    # Try to extract the redirect_uri from the auth_link
    if auth_link:
        import re
        redirect_match = re.search(r"redirect_uri=([^&]+)", auth_link)
        if redirect_match:
            import urllib.parse
            redirect_uri = urllib.parse.unquote(redirect_match.group(1))
            print(f"Found redirect URI in auth_link: {redirect_uri}")
except Exception as e:
    print(f"Error extracting redirect URI: {e}")
    redirect_uri = "http://localhost:3000/"  # Fallback to default

print(f"Using redirect URI: {redirect_uri}")

credentials = oauth2client.client.credentials_from_clientsecrets_and_code(
        CLIENT_SECRETS,
        [OAUTH2_SCOPE],
        code,
        redirect_uri=redirect_uri
    )

# Create an authorized Drive API client.
http = httplib2.Http()
credentials.authorize(http)
drive_service = build("drive", "v3", http=http)

file_metadata = {
        "name": "TorchBlocks",
        "mimeType": "application/vnd.google-apps.folder",
    }

# pylint: disable=maybe-no-member
folderfile = drive_service.files().create(body=file_metadata, fields="id").execute()

folder_id = folderfile.get("id")
print(f"Folder ID: {folder_id}")

# Insert a file. Files are comprised of contents and metadata.
# MediaFileUpload abstracts uploading file contents from a file on disk.
media_body = googleapiclient.http.MediaFileUpload(
    FILENAME, mimetype=MIMETYPE, resumable=True
)
# The body contains the metadata for the file.
body = {
    "name": TITLE,
    "parents": [folder_id],
    "description": DESCRIPTION,
}

# Perform the request and print the result.
try:
    new_file = (
      drive_service.files().create(body=body, media_body=media_body).execute()
    )
    print(f"File ID: {new_file.get('id')}")
    colab_link = "https://colab.research.google.com/drive/" + new_file.get("id")
    self_authinfo["colab_link"] = colab_link
    with open(AUTHINFO_FILE, "wb") as auth_fp:
        auth_fp.write(json.dumps(self_authinfo).encode("utf-8"))

except HttpError as error:
  # TODO(developer) - Handle errors from drive API.
  print(f"An error occurred: {error}")

# First, insert json file to the folder.
JSON_FILENAME = "backend/google/SkeletonResults.json"
media_body = googleapiclient.http.MediaFileUpload(
    JSON_FILENAME, mimetype=MIMETYPE, resumable=True
)
# The body contains the metadata for the file.
body = {
    "name": "output_results.json",
    "parents": [folder_id],
    "description": "Execution results",
}

# Perform the request and print the result.
try:
    new_file = (
      drive_service.files().create(body=body, media_body=media_body).execute()
    )
    print(f"JSON File ID: {new_file.get('id')}")
    json_file_id = new_file.get("id")

except HttpError as error:
  # TODO(developer) - Handle errors from drive API.
  print(f"An error occurred: {error}")


# Then, check for updated results.
while True:
    request = drive_service.files().get_media(fileId=json_file_id)
    file = io.BytesIO()
    downloader = googleapiclient.http.MediaIoBaseDownload(file, request)
    done = False
    while done is False:
        status, done = downloader.next_chunk()
    with open(RESULTS_FILE, "wb") as results_fp:
        results_fp.write(file.getvalue())
    time.sleep(5)