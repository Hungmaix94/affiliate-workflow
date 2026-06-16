import os
import subprocess
from google import genai
from google.genai import types
from google.oauth2.credentials import Credentials

projects = [
    "festive-cogency-tfj37",
    "gen-lang-client-0522535978",
    "gen-lang-client-0735323412",
    "gen-lang-client-0949907475",
    "gloud-mcp",
    "project-57f73e4e-99d4-4d2c-b66"
]

prompt = "A photorealistic shot of delicious fresh baked croissants on a wooden plate, natural sunlight, cinematic"

try:
    token = subprocess.check_output(["gcloud", "auth", "print-access-token"]).decode().strip()
    credentials = Credentials(token)
except Exception as err:
    print(f"❌ Failed to obtain gcloud credentials: {err}")
    exit(1)

for project in projects:
    print(f"Testing project: {project}...")
    try:
        client = genai.Client(
            vertexai=True,
            project=project,
            location="us-central1",
            credentials=credentials
        )
        
        # We try a very simple generate_videos or check if the API is enabled/accessible
        operation = client.models.generate_videos(
            model="veo-3.1-generate-preview",
            prompt=prompt,
            config=types.GenerateVideosConfig(
                aspect_ratio="16:9",
                resolution="720p",
                duration_seconds=5
            ),
        )
        print(f"✅ SUCCESS starting operation in project {project}!")
        print(f"Operation ID: {operation.name}")
        # Wait a bit or print success
        exit(0)
    except Exception as e:
        error_msg = str(e)
        if "billing" in error_msg.lower():
            print(f"❌ Project {project} failed: Billing disabled.")
        elif "apiplatform.googleapis.com" in error_msg.lower():
            print(f"❌ Project {project} failed: Vertex AI API not enabled/authorized.")
        else:
            print(f"❌ Project {project} failed with error: {error_msg}")
