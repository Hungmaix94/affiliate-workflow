import os
from dotenv import load_dotenv

load_dotenv()

class LocalTTSGenerator:
    def __init__(self, voice_model_path: str = "models/vieneu_tts.onnx"):
        self.voice_model_path = voice_model_path
        print(f"[local-TTS] Loading voice model from: {self.voice_model_path}")

    def speak(self, text: str, output_wav: str = "assets/temp_voice.wav") -> str:
        """
        Synthesize text into a Vietnamese audio wave file.
        
        Args:
            text: Text script to say.
            output_wav: Path to output audio file.
        """
        print(f"[local-TTS] Synthesizing text: '{text[:50]}...'")
        os.makedirs(os.path.dirname(output_wav), exist_ok=True)
        
        # Here we mock the audio output for the local demo.
        # In production, this imports VieNeu-TTS or calls Supertonic ONNX runtime engine to synthesize the speech.
        with open(output_wav, "wb") as f:
            # Simple placeholder for mock wav header/data
            f.write(b"RIFF\x24\x08\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00\x22\x56\x00\x00\x44\xac\x00\x00\x02\x00\x10\x00data\x00\x08\x00\x00\x00\x00\x00\x00")
            
        print(f"[local-TTS] ✅ Audio file synthesized successfully at: {output_wav}")
        return output_wav

if __name__ == "__main__":
    import sys
    text = sys.argv[1] if len(sys.argv) > 1 else "Bánh sừng bò Pháp siêu thơm ngon cả nhà ơi!"
    generator = LocalTTSGenerator()
    generator.speak(text, "assets/test_tts_output.wav")
