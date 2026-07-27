#!/usr/bin/bash

url=$(curl http://data.gdeltproject.org/gdeltv2/lastupdate.txt | head -n 1 | grep -o 'http.*')

wget "$url"
filename=$(basename "$url")
unzip $filename
uncompressed_filename=$(grep -o '.*\.CSV' <<< $filename)

cat headers.tsv $uncompressed_filename > export.tsv

./tsv_to_json.py

rm ./export.tsv
rm *00.export.CSV*

mv ./export.json ../src/data/
