#!/bin/bash
cd "$(dirname "$0")"
open "index.html"
python -m SimpleHTTPServer
