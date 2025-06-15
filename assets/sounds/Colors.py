from gtts import gTTS

colors = [
    ("Red", "लाल"),
    ("Blue", "नीला"),
    ("Green", "हरा"),
    ("Yellow", "पीला"),
    ("Purple", "बैंगनी"),
    ("Orange", "नारंगी"),
    ("Pink", "गुलाबी"),
    ("Brown", "भूरा"),
    ("Black", "काला"),
    ("White", "सफेद"),
]

for i, (en, hi) in enumerate(colors, start=1):
    tts = gTTS(text=hi, lang='hi')
    tts.save(f"{i:02d}_{en}.mp3") 