import os
import sys
import re
import argparse
import subprocess

# Add workspace root to path for imports to work
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
from src.services.tts_generator import LocalTTSGenerator
from src.services.influencer_generator import InfluencerGenerator

def format_ass_time(seconds):
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    c = int(round((seconds - int(seconds)) * 100))
    if c == 100:
        c = 99
    return f"{h}:{m:02d}:{s:02d}.{c:02d}"

def clean_sentence_for_subtitles(text):
    # Remove emoji, bracketed directions
    cleaned = re.sub(r'\(.*?\)', '', text)
    cleaned = re.sub(r'\[.*?\]', '', cleaned)
    cleaned = cleaned.strip()
    return cleaned

def split_into_sentences(text):
    # Split text by periods, exclamation marks, question marks, and newlines
    raw_sentences = re.split(r'(?<=[.!?\n])\s+', text)
    sentences = []
    for s in raw_sentences:
        s_clean = s.strip()
        if s_clean and len(clean_sentence_for_subtitles(s_clean)) > 2:
            sentences.append(s_clean)
    return sentences

def generate_talking_concat_list(duration, neutral_path, talk_path, blink_path, output_txt_path):
    cycle = [
        (neutral_path, 0.2),
        (talk_path, 0.2),
        (neutral_path, 0.15),
        (talk_path, 0.25),
        (neutral_path, 0.2),
        (talk_path, 0.2),
        (blink_path, 0.12)
    ]
    
    written_duration = 0.0
    with open(output_txt_path, "w", encoding="utf-8") as f:
        while written_duration < duration - 0.01:
            for img, dur in cycle:
                if written_duration + dur >= duration:
                    rem = duration - written_duration
                    if rem > 0.01:
                        f.write(f"file '{os.path.abspath(img)}'\n")
                        f.write(f"duration {rem:.3f}\n")
                        written_duration += rem
                    break
                else:
                    f.write(f"file '{os.path.abspath(img)}'\n")
                    f.write(f"duration {dur:.3f}\n")
                    written_duration += dur
        # final dummy repeat
        f.write(f"file '{os.path.abspath(neutral_path)}'\n")

def main():
    parser = argparse.ArgumentParser(description="High Quality Video Compiler")
    parser.add_argument("--script", required=True, help="Copywriting review script")
    parser.add_argument("--output", required=True, help="Output MP4 file path")
    parser.add_argument("--images", required=True, help="Comma-separated image paths")
    parser.add_argument("--voice", default="vi-VN-HoaiMyNeural", help="TTS voice model name")
    args = parser.parse_args()

    script = args.script
    if os.path.exists(script):
        with open(script, "r", encoding="utf-8") as f:
            script = f.read()
    output_path = args.output
    image_paths = [img.strip() for img in args.images.split(",") if os.path.exists(img.strip())]

    if not image_paths:
        print("[VideoRenderer] ⚠️ No valid images provided. Falling back to default assets...")
        # Check standard assets
        default_assets = [
            "assets/influencer_face.png",
            "assets/drill_review_broll.png",
            "assets/drill_closeup_dial.png",
            "assets/drill_action_wood.png",
            "assets/influencer_three_quarters.png"
        ]
        image_paths = [img for img in default_assets if os.path.exists(img)]
        if not image_paths:
            raise ValueError("No images found in assets directory to build video.")

    print(f"[VideoRenderer] Starting high-quality video compilation...")
    print(f"[VideoRenderer] Images to cycle: {image_paths}")
    
    # Split script into sentences
    sentences = split_into_sentences(script)
    if not sentences:
        print("[VideoRenderer] ⚠️ Script was empty or too short. Using fallback script.")
        sentences = ["Chào mọi người nha! Hôm nay mình sẽ review sản phẩm mới cực kỳ thú vị."]

    print(f"[VideoRenderer] Split script into {len(sentences)} scenes:")
    for idx, s in enumerate(sentences):
        print(f"  Scene {idx+1}: '{s}'")

    tts_generator = LocalTTSGenerator(voice=args.voice)
    influencer_generator = InfluencerGenerator()
    segments = []
    subtitles_entries = []
    current_time = 0.0

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    temp_files = []

    try:
        # Step 1: Generate each scene segment (TTS + Video Zoompan)
        for i, sentence in enumerate(sentences):
            print(f"\n[VideoRenderer] Rendering Scene {i+1}/{len(sentences)}...")
            
            # 1.1 Generate speech for this sentence
            temp_voice = f"assets/temp_voice_{i}.wav"
            tts_generator.speak(sentence, temp_voice)
            temp_files.append(temp_voice)
            
            if not os.path.exists(temp_voice):
                print(f"[VideoRenderer] ⚠️ Warning: Failed to generate audio for scene {i+1}. Skipping.")
                continue

            # 1.2 Get exact duration of audio using ffprobe
            ffprobe_cmd = [
                "ffprobe", "-v", "error", "-show_entries", "format=duration",
                "-of", "default=noprint_wrappers=1:nokey=1", temp_voice
            ]
            result = subprocess.run(ffprobe_cmd, capture_output=True, text=True, check=True)
            duration = float(result.stdout.strip())
            print(f"[VideoRenderer] Scene {i+1} audio duration: {duration:.2f}s")
            
            # 1.3 Choose image and check for talking face animation
            img_path = image_paths[i % len(image_paths)]
            
            is_influencer = "influencer_face" in os.path.basename(img_path)
            
            use_talking_lipsync = False
            temp_lipsync_video = None
            
            if is_influencer:
                temp_lipsync_video = f"assets/temp_lipsync_{i}.mp4"
                temp_files.append(temp_lipsync_video)
                try:
                    print(f"[VideoRenderer] Attempting real lipsync via ComfyUI for segment {i+1}...")
                    # Generate the lipsynced talking video
                    influencer_generator.run_lipsync_liveportrait(temp_voice, temp_lipsync_video)
                    # Verify the output is valid (size > 1KB)
                    if os.path.exists(temp_lipsync_video) and os.path.getsize(temp_lipsync_video) > 1000:
                        use_talking_lipsync = True
                        print(f"[VideoRenderer] Real lipsync generated successfully for segment {i+1}.")
                    else:
                        print(f"[VideoRenderer] ⚠️ Real lipsync output is invalid or mock. Falling back to old mechanism...")
                except Exception as e:
                    print(f"[VideoRenderer] ⚠️ Real lipsync failed: {e}. Falling back to old mechanism...")
            
            talk_img = os.path.join(os.path.dirname(img_path), "influencer_face_talk.png")
            blink_img = os.path.join(os.path.dirname(img_path), "influencer_face_blink.png")
            use_talking_animation = not use_talking_lipsync and is_influencer and os.path.exists(talk_img) and os.path.exists(blink_img)
            
            temp_raw_video = None
            if use_talking_animation:
                temp_txt = f"assets/temp_talk_{i}.txt"
                temp_files.append(temp_txt)
                generate_talking_concat_list(duration, img_path, talk_img, blink_img, temp_txt)
                
                temp_raw_video = f"assets/temp_raw_talk_{i}.mp4"
                temp_files.append(temp_raw_video)
                print(f"[VideoRenderer] Generating talking avatar animation for segment {i+1}...")
                subprocess.run([
                    "ffmpeg", "-y",
                    "-f", "concat", "-safe", "0",
                    "-i", temp_txt,
                    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-r", "25",
                    temp_raw_video
                ], capture_output=True, check=True)
            
            num_frames = int(round(duration * 25))
            if num_frames < 25:
                num_frames = 25 # Minimum 1s
                
            step = 0.35 / num_frames
            
            # Select from 8 distinct camera motion profiles
            motion_idx = i % 8
            if motion_idx == 0:
                # Zoom-In Center
                zoompan_expr = f"zoompan=z='min(zoom+{step:.6f},1.35)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1024x1024"
            elif motion_idx == 1:
                # Zoom-Out Center
                zoompan_expr = f"zoompan=z='max(1.35-{step:.6f}*on,1.0)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1024x1024"
            elif motion_idx == 2:
                # Pan Left-to-Right (at constant 1.35 zoom)
                zoompan_expr = f"zoompan=z=1.35:x='(iw-iw/1.35)*(on/{num_frames})':y='ih/2-(ih/zoom/2)':d=1:s=1024x1024"
            elif motion_idx == 3:
                # Pan Right-to-Left (at constant 1.35 zoom)
                zoompan_expr = f"zoompan=z=1.35:x='(iw-iw/1.35)*(1-on/{num_frames})':y='ih/2-(ih/zoom/2)':d=1:s=1024x1024"
            elif motion_idx == 4:
                # Pan Top-to-Bottom (at constant 1.35 zoom)
                zoompan_expr = f"zoompan=z=1.35:x='iw/2-(iw/zoom/2)':y='(ih-ih/1.35)*(on/{num_frames})':d=1:s=1024x1024"
            elif motion_idx == 5:
                # Pan Bottom-to-Top (at constant 1.35 zoom)
                zoompan_expr = f"zoompan=z=1.35:x='iw/2-(iw/zoom/2)':y='(ih-ih/1.35)*(1-on/{num_frames})':d=1:s=1024x1024"
            elif motion_idx == 6:
                # Diagonal Pan (Top-Left to Bottom-Right)
                zoompan_expr = f"zoompan=z=1.35:x='(iw-iw/1.35)*(on/{num_frames})':y='(ih-ih/1.35)*(on/{num_frames})':d=1:s=1024x1024"
            else:
                # Diagonal Pan (Bottom-Left to Top-Right)
                zoompan_expr = f"zoompan=z=1.35:x='(iw-iw/1.35)*(on/{num_frames})':y='(ih-ih/1.35)*(1-on/{num_frames})':d=1:s=1024x1024"

            # 1.4 Dynamic transitions (0.25s fade-in/out to black/silence)
            fade_dur = min(0.25, duration / 2.0)
            st_out = duration - fade_dur
            
            # Combine zoompan, vignette (PI/5), and fades
            video_filters = f"{zoompan_expr},vignette=PI/5,fade=t=in:st=0:d={fade_dur:.3f},fade=t=out:st={st_out:.3f}:d={fade_dur:.3f},format=yuv420p"
            audio_filters = f"afade=t=in:st=0:d={fade_dur:.3f},afade=t=out:st={st_out:.3f}:d={fade_dur:.3f}"

            # 1.5 Render the video and audio into a single clip segment
            temp_segment = f"assets/temp_segment_{i}.mp4"
            temp_files.append(temp_segment)
            
            if use_talking_lipsync:
                ffmpeg_cmd = [
                    "ffmpeg", "-y",
                    "-i", temp_lipsync_video,
                    "-i", temp_voice,
                    "-vf", video_filters,
                    "-af", audio_filters,
                    "-c:v", "libx264", "-r", "25",
                    "-c:a", "aac",
                    "-shortest",
                    temp_segment
                ]
            elif use_talking_animation:
                ffmpeg_cmd = [
                    "ffmpeg", "-y",
                    "-i", temp_raw_video,
                    "-i", temp_voice,
                    "-vf", video_filters,
                    "-af", audio_filters,
                    "-c:v", "libx264", "-r", "25",
                    "-c:a", "aac",
                    "-shortest",
                    temp_segment
                ]
            else:
                ffmpeg_cmd = [
                    "ffmpeg", "-y",
                    "-loop", "1", "-i", img_path,
                    "-i", temp_voice,
                    "-vf", video_filters,
                    "-af", audio_filters,
                    "-c:v", "libx264", "-r", "25",
                    "-c:a", "aac",
                    "-shortest",
                    temp_segment
                ]
            print(f"[VideoRenderer] Compiling segment {i+1}...")
            subprocess.run(ffmpeg_cmd, capture_output=True, check=True)
            segments.append(temp_segment)

            # 1.5 Save subtitle timings
            sub_text = clean_sentence_for_subtitles(sentence)
            end_time = current_time + duration
            subtitles_entries.append((current_time, end_time, sub_text))
            current_time = end_time

        # Step 2: Concat all segment clips together
        print(f"\n[VideoRenderer] Concatenating {len(segments)} segments...")
        concat_list_path = "assets/temp_concat_list.txt"
        temp_files.append(concat_list_path)
        with open(concat_list_path, "w", encoding="utf-8") as f:
            for s in segments:
                f.write(f"file '{os.path.abspath(s)}'\n")

        temp_unsubbed = "assets/temp_unsubbed.mp4"
        temp_files.append(temp_unsubbed)
        
        # Run concat from workspace root
        subprocess.run([
            "ffmpeg", "-y", "-f", "concat", "-safe", "0",
            "-i", concat_list_path, "-c", "copy", temp_unsubbed
        ], check=True, capture_output=True)

        # Step 3: Write ASS subtitle file
        print(f"[VideoRenderer] Writing styled ASS subtitle file...")
        ass_path = "assets/temp_subs.ass"
        temp_files.append(ass_path)
        
        ass_header = """[Script Info]
Title: Auto-generated UGC Subtitles
ScriptType: v4.00+
PlayResX: 1024
PlayResY: 1024

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,DejaVu Sans,30,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,3,1,2,10,10,100,1
"""
        with open(ass_path, "w", encoding="utf-8") as f:
            f.write(ass_header)
            f.write("\n[Events]\n")
            f.write("Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n")
            for start, end, text in subtitles_entries:
                f.write(f"Dialogue: 0,{format_ass_time(start)},{format_ass_time(end)},Default,,0,0,0,,{text}\n")

        # Step 4: Burn subtitles onto the final video
        print(f"[VideoRenderer] Burning subtitles onto final video...")
        subprocess.run([
            "ffmpeg", "-y", "-i", temp_unsubbed,
            "-vf", f"subtitles={ass_path}",
            output_path
        ], check=True, capture_output=True)

        print(f"[VideoRenderer] ✅ Success! High-quality video rendered at: {output_path}")

    except Exception as e:
        print(f"[VideoRenderer] ❌ Render Error: {e}")
        if isinstance(e, subprocess.CalledProcessError):
            print(f"[VideoRenderer] ffmpeg/ffprobe error output: {e.stderr}")
        raise e
    finally:
        # Clean up temporary files
        print(f"[VideoRenderer] Cleaning up {len(temp_files)} temporary files...")
        for tf in temp_files:
            if os.path.exists(tf):
                try:
                    os.remove(tf)
                except Exception as ex:
                    print(f"[VideoRenderer] Warning: Failed to clean up {tf}: {ex}")

if __name__ == "__main__":
    main()
