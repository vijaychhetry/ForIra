from gtts import gTTS

pet_animals = [
    ("Dog", "कुत्ता"),
    ("Cat", "बिल्ली"),
    ("Rabbit", "खरगोश"),
    ("Parrot", "तोता"),
    ("Fish", "मछली"),
    ("Turtle", "कछुआ"),
    ("Hamster", "हैम्स्टर"),
    ("Guinea Pig", "गिनी पिग"),
    ("Bird", "चिड़िया"),
    ("Mouse", "चूहा"),
]

for i, (en, hi) in enumerate(pet_animals, start=1):
    tts = gTTS(text=hi, lang='hi')
    tts.save(f"{i:02d}_{en}.mp3") 