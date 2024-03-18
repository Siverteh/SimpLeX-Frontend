#!/bin/sh
# compile.sh

# Navigate to the working directory (where your LaTeX file is expected to be)
cd /data

# Run the LaTeX compiler on document.tex
pdflatex document.tex

# Keep the container running after compilation (if desired)
tail -f /dev/null
