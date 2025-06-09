from gtts import gTTS

weekdays = [
    ("Monday", "सोमवार"),
    ("Tuesday", "मंगलवार"),
    ("Wednesday", "बुधवार"),
    ("Thursday", "गुरुवार"),
    ("Friday", "शुक्रवार"),
    ("Saturday", "शनिवार"),
    ("Sunday", "रविवार"),
]

for i, (en, hi) in enumerate(weekdays, start=1):
    tts = gTTS(text=hi, lang='hi')
    tts.save(f"{i:02d}_{en}.mp3")
