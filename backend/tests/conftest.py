import os
import sys

TESTS_DIR = os.path.dirname(__file__)
BACKEND_ROOT = os.path.abspath(os.path.join(TESTS_DIR, ".."))
APP_ROOT = os.path.join(BACKEND_ROOT, "app")

for path in (BACKEND_ROOT, APP_ROOT):
    if path not in sys.path:
        sys.path.insert(0, path)
