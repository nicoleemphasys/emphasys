#!/bin/sh
# Encode a rendered sequence to H.264 (CRF 18) with film grain, plus the
# 10 s loop-point check (frames 2190–2249 then 0–239).
# Usage: [CRF=18] scripts/encode.sh <name>   (frames in output/<name>/)
set -e
cd "$(dirname "$0")/.."
NAME=${1:-preview}
EXT=$(ls output/$NAME | head -1 | sed 's/.*\.//')
mkdir -p renders
# ~14% grain: temporal noise on luma only.
GRAIN="noise=c0s=14:c0f=t+u,format=yuv420p"
ffmpeg -y -loglevel error -framerate 30 -i output/$NAME/%06d.$EXT -vf "$GRAIN" \
  -c:v libx264 -crf ${CRF:-18} -preset slow -pix_fmt yuv420p -movflags +faststart renders/$NAME.mp4
ffmpeg -y -loglevel error \
  -framerate 30 -start_number 2190 -i output/$NAME/%06d.$EXT \
  -framerate 30 -start_number 0 -i output/$NAME/%06d.$EXT \
  -filter_complex "[0:v]trim=end_frame=60,setpts=PTS-STARTPTS[a];[1:v]trim=end_frame=240,setpts=PTS-STARTPTS[b];[a][b]concat=n=2:v=1[v];[v]$GRAIN[out]" \
  -map "[out]" -c:v libx264 -crf ${CRF:-18} -preset slow -movflags +faststart renders/$NAME-loopcheck.mp4
for f in renders/$NAME.mp4 renders/$NAME-loopcheck.mp4; do
  echo "$f: $(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames,width,height -of csv=p=0 $f) $(du -h $f | cut -f1)"
done
