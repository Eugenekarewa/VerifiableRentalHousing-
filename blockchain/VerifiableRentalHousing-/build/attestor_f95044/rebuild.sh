#!/bin/bash
# Rebuild the attestor image

set -euo pipefail

cd "$(dirname "$0")" || exit 1

if ! docker buildx build \
    --platform linux/amd64,linux/arm64 \
    -t docker.io/th3jackal/attestor-verifiablerentals:latest \
    --push \
    .; then
    echo "❌ Failed to rebuild attestor"
    exit 1
fi

echo "✅ Attestor rebuilt: docker.io/th3jackal/attestor-verifiablerentals:latest"
