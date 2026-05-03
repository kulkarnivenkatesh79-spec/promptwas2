@echo off
echo Starting ElectED Local Server...
start "" "http://localhost:8000/index (1).html"
python -m http.server 8000
