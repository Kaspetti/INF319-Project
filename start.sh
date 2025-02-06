#!/bin/bash

npm run build
python3 _app.py "$@"
