import os
try:
    os.getcwd()
except Exception:
    os.getcwd = lambda: "/Users/ankanghosh/Desktop/projects/ATSlens"
