import os
import time
import subprocess
from dotenv import load_dotenv
from google import genai
from google.genai import types
from google.oauth2.credentials import Credentials

load_dotenv()

def test_veo():
    try:
        # Get the gcloud access token dynamically
        token = subprocess.check_output(["gcloud", "auth", "print-access-token"]).decode().strip()
        credentials = Credentials(token)
        
        # Initialize the client for Vertex AI using project "gloud-mcp" with our credentials
        client = genai.Client(
            vertexai=True,
            project="gloud-mcp",
            location="us-central1",
            credentials=credentials
        )
    except Exception as err:
        print(f"❌ Failed to obtain gcloud credentials: {err}")
        return

    prompt = "A close-up vertical shot of a grey cordless hammer drill drilling into a piece of wood, dust flying, realistic, high detail, UGC style"
    print(f"Sending prompt to Veo 3.1 via Vertex AI with OAuth2 token: '{prompt}'...")
    
    try:
        operation = client.models.generate_videos(
            model="veo-3.1-generate-preview",
            prompt=prompt,
            config=types.GenerateVideosConfig(
                aspect_ratio="9:16",
                resolution="720p",
                duration_seconds=5
            ),
        )
        
        print("Operation started. Polling for completion...")
        while not operation.done:
            print("Still generating... waiting 10 seconds...")
            time.sleep(10)
            operation = client.operations.get(operation)
            
        print("Operation completed! Saving video...")
        generated_video = operation.response.generated_videos[0]
        # Download and save
        video_bytes = client.files.download(file=generated_video.video)
        out_path = "assets/test_veo_video.mp4"
        with open(out_path, "wb") as f:
            f.write(video_bytes)
        print(f"✅ Video saved successfully to {out_path}!")
    except Exception as e:
        print(f"❌ Error during generation: {e}")

if __name__ == "__main__":
    test_veo()
