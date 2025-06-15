from gtts import gTTS

vegetables = [
    ("Potato", "आलू"),
    ("Tomato", "टमाटर"),
    ("Onion", "प्याज"),
    ("Carrot", "गाजर"),
    ("Cucumber", "खीरा"),
    ("Cabbage", "पत्तागोभी"),
    ("Cauliflower", "फूलगोभी"),
    ("Brinjal", "बैंगन"),
    ("Spinach", "पालक"),
    ("Peas", "मटर"),
]

for i, (en, hi) in enumerate(vegetables, start=1):
    tts = gTTS(text=hi, lang='hi')
    tts.save(f"{i:02d}_{en}.mp3") 