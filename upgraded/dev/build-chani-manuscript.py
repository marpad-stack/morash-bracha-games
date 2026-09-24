"""Compatibility entry point: rebuild both explicitly authored editions."""
import runpy
from pathlib import Path
runpy.run_path(str(Path(__file__).with_name("build-story-manuscript.py")),run_name="__main__")
