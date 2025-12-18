FROM ghcr.io/krnl-labs/attestor-base:latest AS builder

WORKDIR /app

COPY config.json constr.key ./

RUN CGO_ENABLED=1 go build \
    -buildmode=c-shared \
    -ldflags='-w -s' -trimpath \
    -o attestor.so \
    *.go

# Final stage - create minimal runtime image with shared library
FROM gcr.io/distroless/base-debian12

# Copy the attestor shared library and header
COPY --from=builder /app/attestor.so /attestor.so
COPY --from=builder /app/attestor.h /attestor.h

# Set non-root user (already defined in distroless base)
USER nonroot:nonroot

# The attestor.so is a C-shared library loaded by executors via dlopen/FFI
# This container packages the library for distribution and extraction
# The sleep command prevents immediate exit for debugging purposes
CMD ["sleep", "1"]

# OCI standard labels for container metadata
LABEL org.opencontainers.image.title="KRNL Attestor"
LABEL org.opencontainers.image.description="Cryptographic attestation service for KRNL workflow execution"
LABEL org.opencontainers.image.source="https://github.com/krnl-labs/attestor"
LABEL org.opencontainers.image.vendor="KRNL Labs"
LABEL org.opencontainers.image.documentation="https://docs.krnl.xyz/attestor"
