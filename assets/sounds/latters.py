from gtts import gTTS

# List of selected Hindi letters and their words (from your hindiLetters.ts)
letters = [
    ("ल", "लट्टू"),
]

for i, (letter, word) in enumerate(letters, start=1):
    tts = gTTS(text=f"{letter}, {word}", lang='hi')
    tts.save(f"{i:02d}_{letter}.mp3")