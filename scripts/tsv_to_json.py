#!/usr/bin/python

import csv
import json

input_file = "export.tsv"
output_file = "export.json"

with open(input_file, "r", encoding="utf-8", newline="") as tsvfile:
    reader = csv.DictReader(tsvfile, delimiter="\t")
    data = list(reader)

with open(output_file, "w", encoding="utf-8") as jsonfile:
    json.dump(data, jsonfile, indent=2)

print(f"Wrote {len(data)} records to {output_file}")
