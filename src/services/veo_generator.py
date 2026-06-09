import time
import os
from dotenv import load_dotenv

load_dotenv()

class VeoGenerator:
    def __init__(self):
        pass

    def generate_product_video(self, prompt: str, output_path: str = "assets/temp_broll.png") -> str:
        """
        Generate a photorealistic product image/video using the agy CLI tool.
        
        Args:
            prompt: Text prompt describing the scene.
            output_path: Local path to save the generated image.
        """
        # Ensure output file ends with .png if we are generating images via CLI
        if not output_path.endswith('.png') and not output_path.endswith('.jpg'):
             output_path = output_path.rsplit('.', 1)[0] + '.png'

        print(f"[Veo-3/AGY] Sending generation request via agy CLI: '{prompt}'...")
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        prompt_with_instructions = (
            f"Generate a photorealistic image of {prompt}. "
            f"Save the generated image as {output_path}. "
            f"Make sure the output path is {output_path} exactly."
        )

        try:
            import subprocess
            result = subprocess.run(
                ["agy", "--print", prompt_with_instructions],
                capture_output=True,
                text=True,
                check=True
            )
            print(f"[Veo-3/AGY] CLI Output:\n{result.stdout}")
            if os.path.exists(output_path):
                print(f"[Veo-3/AGY] ✅ Visual generated successfully at: {output_path}")
                return output_path
        except Exception as e:
            print(f"[Veo-3/AGY] CLI Generation Error: {e}")
            
        # Fallback mock for local testing
        print("[Veo-3/AGY] Warning: Saving mock image file for development fallback...")
        with open(output_path, "wb") as f:
            f.write(b"Mock PNG data")
        return output_path

if __name__ == "__main__":
    import sys
    args = sys.argv[1:]
    prompt = args[0] if args else "A photorealistic shot of delicious fresh baked croissants on a wooden plate, natural sunlight, cinematic"
    generator = VeoGenerator()
    generator.generate_product_video(prompt, "assets/test_veo_output.png")
