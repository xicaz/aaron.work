#!/bin/bash
cd "$(dirname "$0")"
open "http://localhost:8000/tab1"
python -m SimpleHTTPServer
