from gtts import gTTS

numbers = [
    ("One", "एक"),
    ("Two", "दो"),
    ("Three", "तीन"),
    ("Four", "चार"),
    ("Five", "पांच"),
    ("Six", "छह"),
    ("Seven", "सात"),
    ("Eight", "आठ"),
    ("Nine", "नौ"),
    ("Ten", "दस"),
]

for i, (en, hi) in enumerate(numbers, start=1):
    tts = gTTS(text=hi, lang='hi')
    tts.save(f"{i:02d}_{en}.mp3") 