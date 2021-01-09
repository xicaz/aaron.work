#!/bin/bash
cd "$(dirname "$0")"
open "loader.html"
python -m SimpleHTTPServer
