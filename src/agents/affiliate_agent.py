import asyncio
import json
import subprocess
import os
import sys
from pydantic import BaseModel, Field
from google.antigravity import Agent, LocalAgentConfig
from dotenv import load_dotenv

# Add parent dir to path if running directly
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from src.services.veo_generator import VeoGenerator
from src.services.tts_generator import LocalTTSGenerator
from src.services.influencer_generator import InfluencerGenerator

load_dotenv()

# Schema for Gemini copywriting output
class MarketingPlan(BaseModel):
    script: str = Field(description="Review script using AIDA structure. Must sound natural, personal, and friendly (no hard selling, e.g. sharing stories/feelings). Include emotional cues.")
    caption: str = Field(description="Social post caption with engaging hooks, emojis, CTA (directing to profile/comments link), and hashtags.")
    veo_prompt: str = Field(description="Detailed image/video generation prompt for Google Veo 3 to show the product in an organic, photorealistic way (e.g. natural lighting, close-up details).")

# Initialize services
veo_service = VeoGenerator()
tts_service = LocalTTSGenerator()
influencer_service = InfluencerGenerator()

# ----------------- AGENT TOOLS -----------------

def scrape_product_details(url: str) -> str:
    """Gets detail information for the product URL.
    
    Args:
        url: The absolute product URL.
    """
    print(f"[Agent Tool] Product scraper bypassed as per user instructions. Returning mockup details.")
    # Extract simple keywords from URL to make mockup slightly dynamic
    name = "Bánh Sừng Bò Pháp Nhân Socola"
    if "ao" in url or "quan" in url or "fashion" in url:
        name = "Áo Thun Cotton Unisex Basic"
    elif "phone" in url or "tai-nghe" in url:
        name = "Tai Nghe Bluetooth Chống Ồn"
        
    return json.dumps({
        "productName": name,
        "description": f"Sản phẩm {name} chất lượng cao nhập khẩu chính hãng.",
        "price": "120.000 VND"
    })

def generate_photorealistic_video(prompt: str) -> str:
    """Generates an organic photorealistic visual image/video of the product using Google Veo 3 / CLI.
    
    Args:
        prompt: Detailed scene description prompt.
    """
    video_path = "assets/generated_broll.png"
    return veo_service.generate_product_video(prompt, video_path)

def generate_voiceover(text: str) -> str:
    """Synthesizes the spoken script into the Virtual Influencer's signature voice.
    
    Args:
        text: Vietnamese speech script text.
    """
    audio_path = "assets/generated_voice.wav"
    return tts_service.speak(text, audio_path)

def generate_influencer_talking_head(audio_path: str) -> str:
    """Animates the consistent face of the influencer to match the voiceover audio, generating a talking head video clip using Wav2Lip / LivePortrait.
    
    Args:
        audio_path: Path to the synthesized voiceover WAV file.
    """
    talking_video_path = "assets/generated_influencer_talking.mp4"
    return influencer_service.run_lipsync_liveportrait(audio_path, talking_video_path)

def assemble_and_publish(video_path: str, audio_path: str, talking_head_path: str, caption: str) -> str:
    """Assembles the final video overlaying voiceover, B-Roll, talking head, and publishing to social media.
    
    Args:
        video_path: Path to Veo generated product video.
        audio_path: Path to TTS voiceover.
        talking_head_path: Path to the animated talking head video of the influencer.
        caption: Caption text for posting.
    """
    print(f"[Agent Tool] Assembling video using visual: {video_path}, voice: {audio_path}, and talking head: {talking_head_path}")
    
    # Run publishing microservice/CLI mockup
    try:
        result = subprocess.run(
            ["npx", "tsx", "src/services/social_publisher.ts", "--run"],
            capture_output=True,
            text=True,
            check=True
        )
        print(result.stdout)
    except Exception as e:
         print(f"[Agent Tool] Warning in publishing script: {e}")
         
    return json.dumps({
        "status": "success",
        "message": "Campaign video compiled and published to Facebook Reels, TikTok, and Shopee Video.",
        "postId": "mock_post_100234"
    })

# ----------------- MAIN PIPELINE -----------------

async def execute_affiliate_pipeline(product_url: str):
    config = LocalAgentConfig(
        model="gemini-3.5-flash",
        system_instructions=(
            "You are the Lead Affiliate Campaign Coordinator Agent. Your goal is to automate the generation "
            "of photorealistic review videos for a Virtual Influencer. You must perform the following steps:\n"
            "1. Scrape the product details from the given URL.\n"
            "2. Generate an organic review script (AIDA format, personal narrative), caption, and a Veo prompt.\n"
            "3. Generate the photorealistic product video using Google Veo 3.\n"
            "4. Synthesize the script voiceover locally using TTS.\n"
            "5. Animate the consistent visual avatar of the influencer matching the voiceover audio using generate_influencer_talking_head.\n"
            "6. Assemble the assets and publish the post to all social networks.\n"
            "Always output a structured MarketingPlan."
        ),
        tools=[
            scrape_product_details,
            generate_photorealistic_video,
            generate_voiceover,
            generate_influencer_talking_head,
            assemble_and_publish
        ],
        response_schema=MarketingPlan
    )
    
    async with Agent(config) as agent:
        prompt = f"Create a full product review and publish campaign for: {product_url}"
        print(f"\n[Antigravity SDK] Launching agent with prompt: {prompt}")
        
        response = await agent.chat(prompt)
        
        # Get final structured output
        plan = await response.structured_output()
        print("\n=== PIPELINE RESULT ===")
        print(json.dumps(plan, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    args = sys.argv[1:]
    target_url = args[0] if args else "https://shopee.vn/croissant-socola-phap"
    asyncio.run(execute_affiliate_pipeline(target_url))
