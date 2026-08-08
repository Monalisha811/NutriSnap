from services.detector import detect_food

with open("test.jpg", "rb") as f:
    result = detect_food(f.read())

print(result)