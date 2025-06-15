from gtts import gTTS

fruits = [
    ("Apple", "सेब"),
    ("Banana", "केला"),
    ("Orange", "संतरा"),
    ("Mango", "आम"),
    ("Grapes", "अंगूर"),
    ("Pineapple", "अनानास"),
    ("Watermelon", "तरबूज"),
    ("Pomegranate", "अनार"),
    ("Guava", "अमरूद"),
    ("Papaya", "पपीता"),
]

for i, (en, hi) in enumerate(fruits, start=1):
    tts = gTTS(text=hi, lang='hi')
    tts.save(f"{i:02d}_{en}.mp3") 