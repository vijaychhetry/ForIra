from gtts import gTTS

shapes = [
    ("Circle", "वृत्त"),
    ("Square", "वर्ग"),
    ("Triangle", "त्रिभुज"),
    ("Rectangle", "आयत"),
    ("Star", "तारा"),
    ("Heart", "दिल"),
    ("Diamond", "हीरा"),
    ("Oval", "अंडाकार"),
    ("Pentagon", "पंचभुज"),
    ("Hexagon", "षट्भुज"),
]

for i, (en, hi) in enumerate(shapes, start=1):
    tts = gTTS(text=hi, lang='hi')
    tts.save(f"{i:02d}_{en}.mp3") 