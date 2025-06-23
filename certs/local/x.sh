#!/bin/bash

# Read all lines into one space-separated string
domains=$(tr '\n' ' ' < ips.txt)

# Temporary output filenames (mkcert uses domain-based names)
mkcert $domains

# Find the latest .pem files mkcert created
latest_cert=$(ls -t *.pem | grep -v 'key' | head -n1)
latest_key=$(ls -t *-key.pem | head -n1)

# Rename to cert.pem and key.pem
mv "$latest_cert" cert.pem
mv "$latest_key" key.pem

echo "✅ Generated cert.pem and key.pem"
