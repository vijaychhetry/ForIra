from gtts import gTTS

wild_animals = [
    ("Lion", "शेर"),
    ("Tiger", "बाघ"),
    ("Elephant", "हाथी"),
    ("Giraffe", "जिराफ"),
    ("Monkey", "बंदर"),
    ("Zebra", "ज़ेबरा"),
    ("Bear", "भालू"),
    ("Wolf", "भेड़िया"),
    ("Fox", "लोमड़ी"),
    ("Deer", "हिरण"),
]

for i, (en, hi) in enumerate(wild_animals, start=1):
    tts = gTTS(text=hi, lang='hi')
    tts.save(f"{i:02d}_{en}.mp3") 