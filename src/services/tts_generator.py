import os
import subprocess
from gtts import gTTS
from dotenv import load_dotenv

load_dotenv()

class LocalTTSGenerator:
    def __init__(self, voice: str = "vi-VN-HoaiMyNeural", voice_model_path: str = "models/vieneu_tts.onnx"):
        self.voice = voice
        self.voice_model_path = voice_model_path
        print(f"[local-TTS] Using realistic neural voice: {self.voice}")

    def speak(self, text: str, output_wav: str = "assets/temp_voice.wav") -> str:
        """
        Synthesize text into a Vietnamese audio wave file using edge-tts.
        """
        os.makedirs(os.path.dirname(output_wav), exist_ok=True)
        
        # 1. Generate MP3 using edge-tts
        temp_mp3 = output_wav + ".mp3"
        
        # Clean text slightly (remove voice/stage directions in brackets)
        clean_text = text
        import re
        clean_text = re.sub(r'\(.*?\)', '', clean_text)  # Remove bracketed descriptions
        clean_text = re.sub(r'\[.*?\]', '', clean_text)
        clean_text = clean_text.strip()
        
        print(f"[local-TTS] Synthesizing speech: '{clean_text[:50]}...'")
        
        try:
            # Generate speech via edge-tts CLI tool
            subprocess.run(
                ["edge-tts", "--voice", self.voice, "--text", clean_text, "--write-media", temp_mp3],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                check=True
            )
        except Exception as e:
            print(f"[local-TTS] edge-tts error: {e}. Falling back to gTTS (female)...")
            try:
                from gtts import gTTS
                tts = gTTS(text=clean_text, lang='vi', slow=False)
                tts.save(temp_mp3)
            except Exception as fallback_err:
                print(f"[local-TTS] gTTS fallback failed: {fallback_err}")
                return output_wav
        
        # 2. Convert MP3 to WAV using ffmpeg
        try:
            subprocess.run(
                ["ffmpeg", "-y", "-i", temp_mp3, "-ar", "22050", output_wav],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                check=True
            )
            print(f"[local-TTS] ✅ Audio file synthesized successfully at: {output_wav}")
        except Exception as e:
            print(f"[local-TTS] Error converting MP3 to WAV: {e}")
            # If ffmpeg conversion fails, just rename it so we have a file
            if os.path.exists(temp_mp3):
                os.rename(temp_mp3, output_wav)
        finally:
            if os.path.exists(temp_mp3):
                try:
                    os.remove(temp_mp3)
                except:
                    pass
                
        return output_wav

if __name__ == "__main__":
    import sys
    text = sys.argv[1] if len(sys.argv) > 1 else "Bánh sừng bò Pháp siêu thơm ngon cả nhà ơi!"
    output_path = sys.argv[2] if len(sys.argv) > 2 else "assets/test_tts_output.wav"
    generator = LocalTTSGenerator()
    generator.speak(text, output_path)
