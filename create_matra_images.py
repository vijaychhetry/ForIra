from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

# Hindi matras with their corresponding examples
matras = [
    ('ा', 'आ की मात्रा', 'का'),
    ('ि', 'इ की मात्रा', 'कि'),
    ('ी', 'ई की मात्रा', 'की'),
    ('ु', 'उ की मात्रा', 'कु'),
    ('ू', 'ऊ की मात्रा', 'कू'),
    ('ृ', 'ऋ की मात्रा', 'कृ'),
    ('े', 'ए की मात्रा', 'के'),
    ('ै', 'ऐ की मात्रा', 'कै'),
    ('ो', 'ओ की मात्रा', 'को'),
    ('ौ', 'औ की मात्रा', 'कौ'),
    ('ं', 'अं की मात्रा', 'कं'),
    ('ः', 'अः की मात्रा', 'कः'),
]

def create_matra_image(matra, filename, example):
    """Create a simple placeholder image for a Hindi matra"""
    try:
        # Create a 200x200 image with light purple background
        img = Image.new('RGB', (200, 200), color='#f3e5f5')
        draw = ImageDraw.Draw(img)
        
        # Try to use a font that supports Hindi
        try:
            # Try different font options
            font_options = [
                "arial.ttf",
                "C:/Windows/Fonts/arial.ttf",
                "C:/Windows/Fonts/calibri.ttf",
                "C:/Windows/Fonts/tahoma.ttf"
            ]
            
            font = None
            for font_path in font_options:
                try:
                    font = ImageFont.truetype(font_path, 80)
                    break
                except:
                    continue
            
            if font is None:
                font = ImageFont.load_default()
                
        except:
            font = ImageFont.load_default()
        
        # Draw the matra in the center
        draw.text((100, 80), matra, fill='#9c27b0', font=font, anchor='mm')
        
        # Draw the example below
        try:
            small_font = ImageFont.truetype("arial.ttf", 20)
        except:
            small_font = ImageFont.load_default()
        
        draw.text((100, 140), example, fill='#424242', font=small_font, anchor='mm')
        
        # Add a border
        draw.rectangle([0, 0, 199, 199], outline='#9c27b0', width=2)
        
        img.save(filename)
        print(f"✅ Created: {filename}")
        return True
    except Exception as e:
        print(f"❌ Failed to create {filename}: {e}")
        return False

def main():
    # Create assets/images directory if it doesn't exist
    images_dir = Path("assets/images")
    images_dir.mkdir(parents=True, exist_ok=True)
    
    print("🖼️  Creating Hindi matra placeholder images...")
    print("=" * 50)
    
    success_count = 0
    total_count = len(matras)
    
    for matra, description, example in matras:
        # Create a filename based on the matra
        matra_name = f"matra_{ord(matra[0])}.png"
        image_path = images_dir / matra_name
        
        if image_path.exists():
            print(f"⏭️  Skipping {matra_name} (already exists)")
            success_count += 1
            continue
        
        if create_matra_image(matra, image_path, example):
            success_count += 1
    
    print("=" * 50)
    print(f"📊 Summary: {success_count}/{total_count} matra images created successfully")
    
    if success_count == total_count:
        print("🎉 All Hindi matra images are ready!")
    else:
        print("⚠️  Some images failed. Check the errors above.")

if __name__ == "__main__":
    main() 