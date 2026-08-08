import pandas as pd
import json
import os

# File paths
excel_file = os.path.join("data", "Nutrition_Database.xlsx")
json_file = os.path.join("data", "nutrition_database.json")

# Read Excel
df = pd.read_excel(excel_file)

# Replace empty values
df = df.fillna("")

# Convert to JSON
foods = df.to_dict(orient="records")

# Save JSON
with open(json_file, "w", encoding="utf-8") as f:
    json.dump(foods, f, indent=4, ensure_ascii=False)

print("✅ Database converted successfully!")
print(f"Total Foods: {len(foods)}")
print(f"Saved as: {json_file}")