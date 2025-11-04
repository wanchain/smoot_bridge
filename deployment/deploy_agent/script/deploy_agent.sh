#!/bin/bash

# Get the directory where the script is physically located
THIS_SCRIPT_DIR=$(dirname "$(readlink -f "$0")")

# `grep -v '^$'` removes blank lines before counting, ensuring accuracy.
line_count=$(grep -v '^$' $THIS_SCRIPT_DIR/../secret/adds.txt | wc -l | awk '{print $1}')

# Check if line_count is empty or 0 (e.g., if adds.txt doesn't exist or is empty)
if [ -z "$line_count" ] || [ "$line_count" -eq 0 ]; then
    echo "Warning: adds.txt is empty or does not exist. Using default value 1."
    exit 0
fi

# Execute the start_container.sh script with the determined line count
./start_container.sh 1 "$line_count"
