#!/bin/sh
# Render individual frames for comparison: scripts/frames.sh 60 150 ...
cd "$(dirname "$0")/.."
mkdir -p output/check
for f in "$@"; do
  node scripts/render.mjs --from $f --to $f --scale 0.5 --name f$f 2>&1 | grep -E "error|Error" ;
  cp output/f$f/$(printf '%06d' $f).jpeg output/check/$(printf '%04d' $f).jpg && rm -rf output/f$f
done
