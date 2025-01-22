import random

# Generating confirm code to verify new user's email
def generate_confirm_code():
    return random.randint(100000, 999999)

