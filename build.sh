#!/bin/bash

postcss --use autoprefixer main.css -o main-prefixed.css
babel main.js -o main-es5.js
