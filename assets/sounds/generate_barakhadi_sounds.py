from gtts import gTTS
import os

# Barakhadi combinations - consonant + vowel pairs
barakhadi_combinations = [
    # क (ka) combinations
    ("क", "क"),
    ("का", "का"),
    ("कि", "कि"),
    ("की", "की"),
    ("कु", "कु"),
    ("कू", "कू"),
    ("कृ", "कृ"),
    ("के", "के"),
    ("कै", "कै"),
    ("को", "को"),
    ("कौ", "कौ"),
    ("कं", "कं"),
    ("कः", "कः"),
    
    # ख (kha) combinations
    ("ख", "ख"),
    ("खा", "खा"),
    ("खि", "खि"),
    ("खी", "खी"),
    ("खु", "खु"),
    ("खू", "खू"),
    ("खृ", "खृ"),
    ("खे", "खे"),
    ("खै", "खै"),
    ("खो", "खो"),
    ("खौ", "खौ"),
    ("खं", "खं"),
    ("खः", "खः"),
    
    # ग (ga) combinations
    ("ग", "ग"),
    ("गा", "गा"),
    ("गि", "गि"),
    ("गी", "गी"),
    ("गु", "गु"),
    ("गू", "गू"),
    ("गृ", "गृ"),
    ("गे", "गे"),
    ("गै", "गै"),
    ("गो", "गो"),
    ("गौ", "गौ"),
    ("गं", "गं"),
    ("गः", "गः"),
    
    # घ (gha) combinations
    ("घ", "घ"),
    ("घा", "घा"),
    ("घि", "घि"),
    ("घी", "घी"),
    ("घु", "घु"),
    ("घू", "घू"),
    ("घृ", "घृ"),
    ("घे", "घे"),
    ("घै", "घै"),
    ("घो", "घो"),
    ("घौ", "घौ"),
    ("घं", "घं"),
    ("घः", "घः"),
    
    # ङ (nga) combinations
    ("ङ", "ङ"),
    ("ङा", "ङा"),
    ("ङि", "ङि"),
    ("ङी", "ङी"),
    ("ङु", "ङु"),
    ("ङू", "ङू"),
    ("ङृ", "ङृ"),
    ("ङे", "ङे"),
    ("ङै", "ङै"),
    ("ङो", "ङो"),
    ("ङौ", "ङौ"),
    ("ङं", "ङं"),
    ("ङः", "ङः"),
]

def generate_barakhadi_sounds():
    """Generate audio files for all Barakhadi combinations"""
    
    # Create barakhadi sounds directory if it doesn't exist
    output_dir = "barakhadi_sounds"
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    print("🔊 Generating Barakhadi sounds...")
    print("=" * 50)
    
    success_count = 0
    total_count = len(barakhadi_combinations)
    
    for i, (syllable, word) in enumerate(barakhadi_combinations, start=1):
        try:
            # Create filename with proper numbering
            filename = f"{i:02d}_{syllable}.mp3"
            filepath = os.path.join(output_dir, filename)
            
            # Generate TTS for the syllable
            tts = gTTS(text=syllable, lang='hi')
            tts.save(filepath)
            
            print(f"✅ Generated: {filename} - {syllable}")
            success_count += 1
            
        except Exception as e:
            print(f"❌ Failed to generate {syllable}: {e}")
    
    print("=" * 50)
    print(f"📊 Summary: {success_count}/{total_count} Barakhadi sounds generated successfully")
    
    if success_count == total_count:
        print("🎉 All Barakhadi sounds are ready!")
        print(f"📁 Files saved in: {output_dir}/")
    else:
        print("⚠️  Some sounds failed. Check the errors above.")

if __name__ == "__main__":
    generate_barakhadi_sounds() 