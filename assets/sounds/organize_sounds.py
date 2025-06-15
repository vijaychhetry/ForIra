import os
import shutil

# Define the categories and their corresponding files
categories = {
    'Colors': [f"{i:02d}_{color}.mp3" for i, color in enumerate(['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink', 'Brown', 'Black', 'White'], 1)],
    'Fruits': [f"{i:02d}_{fruit}.mp3" for i, fruit in enumerate(['Apple', 'Banana', 'Orange', 'Mango', 'Grapes', 'Pineapple', 'Watermelon', 'Pomegranate', 'Guava', 'Papaya'], 1)],
    'Numbers': [f"{i:02d}_{num}.mp3" for i, num in enumerate(['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'], 1)],
    'PetAnimals': [f"{i:02d}_{animal}.mp3" for i, animal in enumerate(['Dog', 'Cat', 'Rabbit', 'Parrot', 'Fish', 'Turtle', 'Hamster', 'Guinea Pig', 'Bird', 'Mouse'], 1)],
    'Shapes': [f"{i:02d}_{shape}.mp3" for i, shape in enumerate(['Circle', 'Square', 'Triangle', 'Rectangle', 'Star', 'Heart', 'Diamond', 'Oval', 'Pentagon', 'Hexagon'], 1)],
    'Vegetables': [f"{i:02d}_{veg}.mp3" for i, veg in enumerate(['Potato', 'Tomato', 'Onion', 'Carrot', 'Cucumber', 'Cabbage', 'Cauliflower', 'Brinjal', 'Spinach', 'Peas'], 1)],
    'WildAnimals': [f"{i:02d}_{animal}.mp3" for i, animal in enumerate(['Lion', 'Tiger', 'Elephant', 'Giraffe', 'Monkey', 'Zebra', 'Bear', 'Wolf', 'Fox', 'Deer'], 1)],
}

def organize_files():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Create category directories if they don't exist
    for category in categories:
        category_dir = os.path.join(base_dir, category)
        if not os.path.exists(category_dir):
            os.makedirs(category_dir)
    
    # Move files to their respective directories
    for category, files in categories.items():
        category_dir = os.path.join(base_dir, category)
        for file in files:
            source = os.path.join(base_dir, file)
            if os.path.exists(source):
                destination = os.path.join(category_dir, file)
                shutil.move(source, destination)
                print(f"Moved {file} to {category} folder")

if __name__ == "__main__":
    organize_files() 