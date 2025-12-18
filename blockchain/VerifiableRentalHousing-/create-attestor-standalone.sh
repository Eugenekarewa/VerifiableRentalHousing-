#!/bin/bash

# KRNL Attestor Creator - Standalone Script
# This script helps dApp developers create production-ready attestors with whitebox encrypted keys
# Requirements: Docker 19.03+ with buildx support

set -euo pipefail

# Configuration
KEYGEN_IMAGE="ghcr.io/krnl-labs/attestor-keygen"
BASE_IMAGE="ghcr.io/krnl-labs/attestor-base"
SCRIPT_VERSION="1.0.0"
MIN_DOCKER_VERSION="19.03"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Function to show usage/help
show_usage() {
    echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}              KRNL Attestor Creator v${SCRIPT_VERSION}                 ${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${CYAN}USAGE:${NC}"
    echo "  ./create-attestor-standalone.sh [OPTIONS]"
    echo ""
    echo -e "${CYAN}DESCRIPTION:${NC}"
    echo "  Creates a production-ready KRNL attestor with whitebox encrypted keys."
    echo "  The attestor provides cryptographic signing and verification for"
    echo "  workflow execution, enabling trustless and verifiable operations."
    echo ""
    echo -e "${CYAN}OPTIONS:${NC}"
    echo "  -h, --help        Show this help message"
    echo "  -v, --version     Show version information"
    echo "  --example         Show example walkthrough"
    echo ""
    echo -e "${CYAN}REQUIREMENTS:${NC}"
    echo "  • Docker ${MIN_DOCKER_VERSION}+ with buildx support"
    echo "  • Docker registry access with push permissions"
    echo "  • 64-character hex private key (without 0x prefix)"
    echo ""
    echo -e "${CYAN}WHAT YOU'LL NEED:${NC}"
    echo "  1. Project name (e.g., 'my-awesome-dapp')"
    echo "  2. Docker registry URL (default: ghcr.io)"
    echo "  3. Organization/username for registry"
    echo "  4. Private key (64 hex characters)"
    echo "  5. Encryption secret (or auto-generate)"
    echo "  6. Optional: API keys/secrets for your dApp"
    echo ""
    echo -e "${CYAN}SECRETS INPUT FORMATS:${NC}"
    echo "  The script accepts secrets in multiple formats:"
    echo "    • key=value"
    echo "    • key:value"
    echo "    • key value"
    echo ""
    echo -e "${CYAN}EXAMPLES:${NC}"
    echo "  ${MAGENTA}Basic usage:${NC}"
    echo "    ./create-attestor-standalone.sh"
    echo ""
    echo "  ${MAGENTA}With example walkthrough:${NC}"
    echo "    ./create-attestor-standalone.sh --example"
    echo ""
    echo -e "${CYAN}OUTPUT:${NC}"
    echo "  • Multi-architecture Docker image (linux/amd64, linux/arm64)"
    echo "  • Whitebox encrypted key file (constr.key)"
    echo "  • Configuration with embedded executor definitions"
    echo "  • Attestor shared libraries (.so files) for both architectures"
    echo "  • Rebuild script for easy updates"
    echo ""
    echo -e "${YELLOW}SECURITY NOTES:${NC}"
    echo "  • Private keys are encrypted using whitebox cryptography"
    echo "  • Store your encryption secret securely - required for updates"
    echo "  • Never commit private keys or constr.key to version control"
    echo "  • The Docker image is public but keys remain encrypted"
    echo ""
    echo -e "${GREEN}For more info:${NC} https://docs.krnl.xyz/attestor"
    echo ""
}

# Function to show example walkthrough
show_example() {
    echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}            Example Attestor Creation Walkthrough         ${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${CYAN}This walkthrough demonstrates creating an attestor for a DeFi protocol:${NC}"
    echo ""
    echo -e "${MAGENTA}Step 1: Basic Configuration${NC}"
    echo "  Project name: ${GREEN}defi-protocol${NC}"
    echo "  Docker registry: ${GREEN}ghcr.io${NC} (press Enter for default)"
    echo "  Organization: ${GREEN}mycompany${NC}"
    echo ""
    echo -e "${MAGENTA}Step 2: Private Key${NC}"
    echo "  Enter: ${GREEN}a1b2c3d4e5f6...${NC} (64 hex characters)"
    echo "  ${YELLOW}Note: The key will be hidden when you type${NC}"
    echo ""
    echo -e "${MAGENTA}Step 3: Encryption Secret${NC}"
    echo "  Press Enter to auto-generate, or"
    echo "  Enter: ${GREEN}my-super-secret-password-123${NC}"
    echo ""
    echo -e "${MAGENTA}Step 4: Add Secrets (API Keys, etc.)${NC}"
    echo "  Secret #1: ${GREEN}openai-key=sk-proj-abc123xyz${NC}"
    echo "  Secret #2: ${GREEN}pimlico-apikey:pim_12345${NC}"
    echo "  Secret #3: ${GREEN}rpc-url https://mainnet.infura.io/v3/YOUR-KEY${NC}"
    echo "  Secret #4: ${GREEN}done${NC} (to finish)"
    echo ""
    echo -e "${MAGENTA}Result:${NC}"
    echo "  ✅ Docker image: ${GREEN}ghcr.io/mycompany/attestor-defi-protocol:latest${NC}"
    echo "  ✅ Build directory: ${GREEN}build/attestor_abc123${NC}"
    echo "  ✅ Address: ${GREEN}0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb6${NC}"
    echo ""
    echo -e "${CYAN}Your attestor is ready for integration with KRNL executors and workflows!${NC}"
    echo ""
    echo -e "${YELLOW}Press Enter to continue with actual creation, or Ctrl+C to exit${NC}"
    read -r
}

# Function to show version
show_version() {
    echo "KRNL Attestor Creator v${SCRIPT_VERSION}"
    echo "Copyright (c) 2024 KRNL Labs"
}

# Helper functions
print_header() {
    echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}              KRNL Attestor Creator v${SCRIPT_VERSION}                 ${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ Error: $1${NC}"
    exit 1
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to check Docker version
check_docker_version() {
    local docker_version
    docker_version=$(docker version --format '{{.Server.Version}}' 2>/dev/null || echo "0.0.0")

    local major minor
    IFS='.' read -r major minor _ <<< "$docker_version"

    if [ "$major" -lt 19 ] || { [ "$major" -eq 19 ] && [ "$minor" -lt 3 ]; }; then
        return 1
    fi
    return 0
}

# Function to parse secret input
parse_secret() {
    local input="$1"
    local key=""
    local value=""

    # Try different separators: =, :, or space
    if [[ "$input" == *"="* ]]; then
        key="${input%%=*}"
        value="${input#*=}"
    elif [[ "$input" == *":"* ]]; then
        key="${input%%:*}"
        value="${input#*:}"
    elif [[ "$input" == *" "* ]]; then
        key="${input%% *}"
        value="${input#* }"
    else
        # If no separator found, treat as invalid
        return 1
    fi

    # Trim whitespace
    key=$(echo "$key" | xargs)
    value=$(echo "$value" | xargs)

    # Return key and value
    echo "$key|$value"
    return 0
}

# Function to collect secrets from user
collect_secrets() {
    local secrets_keys=""
    local secrets_values=""

    echo "" >&2
    echo -e "${BLUE}Step 4: API Secrets and Credentials${NC}" >&2
    echo "──────────────────────────────────────" >&2
    echo -e "${CYAN}Add secrets your dApp needs (API keys, tokens, etc.)${NC}" >&2
    echo -e "${CYAN}Format: key=value, key:value, or key value${NC}" >&2
    echo -e "${CYAN}Examples:${NC}" >&2
    echo "  • openai-key=sk-12345" >&2
    echo "  • pimlico-apikey:abc123" >&2
    echo "  • rpc-url https://mainnet.infura.io/v3/YOUR-KEY" >&2
    echo "" >&2
    echo -e "${YELLOW}Type 'done' when finished adding secrets${NC}" >&2
    echo "" >&2

    local count=0
    local json_secrets="{"
    local first=true

    while true; do
        echo -n "Secret #$((count + 1)) (or 'done'): " >&2
        read -r secret_input

        # Check if user is done
        if [ "$secret_input" = "done" ] || [ "$secret_input" = "DONE" ] || [ -z "$secret_input" ]; then
            if [ $count -eq 0 ]; then
                echo -n "No secrets added. Continue without secrets? (y/n): " >&2
                read -r confirm
                if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
                    break
                else
                    continue
                fi
            else
                break
            fi
        fi

        # Parse the secret
        if result=$(parse_secret "$secret_input"); then
            IFS='|' read -r key value <<< "$result"

            # Add to JSON directly
            if [ "$first" = true ]; then
                first=false
            else
                json_secrets+=","
            fi

            # Escape special characters in value
            value="${value//\\/\\\\}"
            value="${value//\"/\\\"}"
            json_secrets+="\"$key\":\"$value\""

            echo -e "  ${GREEN}Added: $key${NC}" >&2
            ((count++))
        else
            echo -e "  ${RED}Invalid format. Use: key=value, key:value, or key value${NC}" >&2
        fi
    done

    json_secrets+="}"
    echo "$json_secrets"
}

# Function to create config.json with embedded executor configurations
create_config() {
    local SECRET="$1"
    local SECRETS_JSON="$2"
    local OUTPUT_FILE="$3"

    cat > "$OUTPUT_FILE" <<EOF
{
  "construct_key": "$SECRET",
  "secrets": $SECRETS_JSON,
  "executors": [
    {
      "image": "ghcr.io/krnl-labs/executor-condition",
      "image_digest": "sha256:7e3051692f9c85554603a2cd74d7e6d92be2b9b96f1f10c59257b4c60c94b628",
      "sbom_bundle": {"base64Signature":"MEUCIASHeYd1NrLW5xvJIsWKoGWS3wY/30iavFy4+YyTNsvOAiEA3HWRoC6mLphcZm4NujlVUaPTrzYQDytnNimZeuQDccA=","cert":"LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUN5VENDQWxDZ0F3SUJBZ0lVU3gvZ2JOc2NYczB0elVsZnZXbVFFWGNVNVQ4d0NnWUlLb1pJemowRUF3TXcKTnpFVk1CTUdBMVVFQ2hNTWMybG5jM1J2Y21VdVpHVjJNUjR3SEFZRFZRUURFeFZ6YVdkemRHOXlaUzFwYm5SbApjbTFsWkdsaGRHVXdIaGNOTWpVd09USXlNREkwTWpRMVdoY05NalV3T1RJeU1ESTFNalExV2pBQU1Ga3dFd1lICktvWkl6ajBDQVFZSUtvWkl6ajBEQVFjRFFnQUU1ZnZaT2dsS2FoSENUUUxUcnJJSjRreXZDMkJrSHBMUGtaTkoKeHN6N0ltek5tYmRScmk0NXZRamlJK0w5VWh1WHNMMnpMc2g0TnRMdmFiT1JqbS90YUtPQ0FXOHdnZ0ZyTUE0RwpBMVVkRHdFQi93UUVBd0lIZ0RBVEJnTlZIU1VFRERBS0JnZ3JCZ0VGQlFjREF6QWRCZ05WSFE0RUZnUVUveGczCmJWVUFRWU1rOFNUYkhCekRiSkVWY01nd0h3WURWUjBqQkJnd0ZvQVUzOVBwejFZa0VaYjVxTmpwS0ZXaXhpNFkKWkQ4d0dRWURWUjBSQVFIL0JBOHdEWUVMZG5WQWEzSnViQzU0ZVhvd0xBWUtLd1lCQkFHRHZ6QUJBUVFlYUhSMApjSE02THk5bmFYUm9kV0l1WTI5dEwyeHZaMmx1TDI5aGRYUm9NQzRHQ2lzR0FRUUJnNzh3QVFnRUlBd2VhSFIwCmNITTZMeTluYVhSb2RXSXVZMjl0TDJ4dloybHVMMjloZFhSb01JR0tCZ29yQmdFRUFkWjVBZ1FDQkh3RWVnQjQKQUhZQTNUMHdhc2JIRVRKakdSNGNtV2MzQXFKS1hyamVQSzMvaDRweWdDOHA3bzRBQUFHWmIwMWN4Z0FBQkFNQQpSekJGQWlFQW8wcVBFRDVsSmxLZm44OUExRUdtcm81a2FSaDQrRmhXc0RSWFdwL21lNDRDSUdLVkZmU2ozMW5sClJzQ01GU3JWaWVJVHlEeVZQRnNzRkNNd2h2T25BZEVyTUFvR0NDcUdTTTQ5QkFNREEyY0FNR1FDTUJLbElxRE8KVjF3c2FRWEg2aVdYbUlVQjZzR0JkK1dQdG16U1VUcWJ6OG1CNFVsVXZCQUN3djRPNyt2a3hYcHZHUUl3VlU4VwpGcUtscXVIWUQxeit0TFlUcGFVTUdJVU8wVGJqMDhjMGVKZVFxSG9PdUVEU3JERlJ2UHpLWDQxRHgva0YKLS0tLS1FTkQgQ0VSVElGSUNBVEUtLS0tLQo=","rekorBundle":{"SignedEntryTimestamp":"MEQCICTH9eG9tttA6BF5C6TR5+XMiHrwi9aAwNjwsT4VQ5mVAiASOpA/qk2He78pAv7OyZwxwY4J2GtXdABjs18IeHthDA==","Payload":{"body":"eyJhcGlWZXJzaW9uIjoiMC4wLjEiLCJraW5kIjoiaGFzaGVkcmVrb3JkIiwic3BlYyI6eyJkYXRhIjp7Imhhc2giOnsiYWxnb3JpdGhtIjoic2hhMjU2IiwidmFsdWUiOiJkMDNjZDYyM2VmYmZlMzMwNTJiYWE3NWU5ZGM2ZGY4M2MzZDk1N2VjYjY3ODAxYTg4N2VmNjM2OGQ1OTVjMzRlIn19LCJzaWduYXR1cmUiOnsiY29udGVudCI6Ik1FVUNJQVNIZVlkMU5yTFc1eHZKSXNXS29HV1Mzd1kvMzBpYXZGeTQrWXlUTnN2T0FpRUEzSFdSb0M2bUxwaGNabTROdWpsVlVhUFRyellRRHl0bk5pbVpldVFEY2NBPSIsInB1YmxpY0tleSI6eyJjb250ZW50IjoiTFMwdExTMUNSVWRKVGlCRFJWSlVTVVpKUTBGVVJTMHRMUzB0Q2sxSlNVTjVWRU5EUVd4RFowRjNTVUpCWjBsVlUzZ3ZaMkpPYzJOWWN6QjBlbFZzWm5aWGJWRkZXR05WTlZRNGQwTm5XVWxMYjFwSmVtb3dSVUYzVFhjS1RucEZWazFDVFVkQk1WVkZRMmhOVFdNeWJHNWpNMUoyWTIxVmRWcEhWakpOVWpSM1NFRlpSRlpSVVVSRmVGWjZZVmRrZW1SSE9YbGFVekZ3WW01U2JBcGpiVEZzV2tkc2FHUkhWWGRJYUdOT1RXcFZkMDlVU1hsTlJFa3dUV3BSTVZkb1kwNU5hbFYzVDFSSmVVMUVTVEZOYWxFeFYycEJRVTFHYTNkRmQxbElDa3R2V2tsNmFqQkRRVkZaU1V0dldrbDZhakJFUVZGalJGRm5RVVUxWm5aYVQyZHNTMkZvU0VOVVVVeFVjbkpKU2pScmVYWkRNa0pyU0hCTVVHdGFUa29LZUhONk4wbHRlazV0WW1SU2NtazBOWFpSYW1sSkswdzVWV2gxV0hOTU1ucE1jMmcwVG5STWRtRmlUMUpxYlM5MFlVdFBRMEZYT0hkblowWnlUVUUwUndwQk1WVmtSSGRGUWk5M1VVVkJkMGxJWjBSQlZFSm5UbFpJVTFWRlJFUkJTMEpuWjNKQ1owVkdRbEZqUkVGNlFXUkNaMDVXU0ZFMFJVWm5VVlV2ZUdjekNtSldWVUZSV1Uxck9GTlVZa2hDZWtSaVNrVldZMDFuZDBoM1dVUldVakJxUWtKbmQwWnZRVlV6T1ZCd2VqRlphMFZhWWpWeFRtcHdTMFpYYVhocE5Ga0tXa1E0ZDBkUldVUldVakJTUVZGSUwwSkJPSGRFV1VWTVpHNVdRV0V6U25WaVF6VTBaVmh2ZDB4QldVdExkMWxDUWtGSFJIWjZRVUpCVVZGbFlVaFNNQXBqU0UwMlRIazVibUZZVW05a1YwbDFXVEk1ZEV3eWVIWmFNbXgxVERJNWFHUllVbTlOUXpSSFEybHpSMEZSVVVKbk56aDNRVkZuUlVsQmQyVmhTRkl3Q21OSVRUWk1lVGx1WVZoU2IyUlhTWFZaTWpsMFRESjRkbG95YkhWTU1qbG9aRmhTYjAxSlIwdENaMjl5UW1kRlJVRmtXalZCWjFGRFFraDNSV1ZuUWpRS1FVaFpRVE5VTUhkaGMySklSVlJLYWtkU05HTnRWMk16UVhGS1MxaHlhbVZRU3pNdmFEUndlV2RET0hBM2J6UkJRVUZIV21Jd01XTjRaMEZCUWtGTlFRcFNla0pHUVdsRlFXOHdjVkJGUkRWc1NteExabTQ0T1VFeFJVZHRjbTgxYTJGU2FEUXJSbWhYYzBSU1dGZHdMMjFsTkRSRFNVZExWa1ptVTJvek1XNXNDbEp6UTAxR1UzSldhV1ZKVkhsRWVWWlFSbk56UmtOTmQyaDJUMjVCWkVWeVRVRnZSME5EY1VkVFRUUTVRa0ZOUkVFeVkwRk5SMUZEVFVKTGJFbHhSRThLVmpGM2MyRlJXRWcyYVZkWWJVbFZRalp6UjBKa0sxZFFkRzE2VTFWVWNXSjZPRzFDTkZWc1ZYWkNRVU4zZGpSUE55dDJhM2hZY0haSFVVbDNWbFU0VndwR2NVdHNjWFZJV1VReGVpdDBURmxVY0dGVlRVZEpWVTh3VkdKcU1EaGpNR1ZLWlZGeFNHOVBkVVZFVTNKRVJsSjJVSHBMV0RReFJIZ3ZhMFlLTFMwdExTMUZUa1FnUTBWU1ZFbEdTVU5CVkVVdExTMHRMUW89In19fX0=","integratedTime":1758508965,"logIndex":544674367,"logID":"c0d23d6ad406973f9559f3ba2d1ca01f84147d8ffc5b8445c224f98b9591801d"}}},
      "allowed_issuers": [
        "https://token.actions.githubusercontent.com",
        "https://github.com/login/oauth"
      ],
      "allowed_subjects": [
        "*@krnl.xyz",
        "https://github.com/krnl-labs/*"
      ]
    },
    {
      "image": "ghcr.io/krnl-labs/executor-data-bundle",
      "image_digest": "sha256:a1d98f6e2e5ea1b4ca326dbdf85033d31f6ee8db930f0593e3bb9c5ff905a982",
      "sbom_bundle": {"base64Signature":"MEQCH12QAW+7BIL77kOY/mM9CvOERDd1CD05kzzDPSGuposCIQDAmfj+SIcyaQwqRHEWcFogBQumHpczjGs3ZqXe8Qf6XA==","cert":"LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUN5VENDQWsrZ0F3SUJBZ0lVWGJ2QmFSdzlWSkhOUVlVRG5zRU94RlRZZVlBd0NnWUlLb1pJemowRUF3TXcKTnpFVk1CTUdBMVVFQ2hNTWMybG5jM1J2Y21VdVpHVjJNUjR3SEFZRFZRUURFeFZ6YVdkemRHOXlaUzFwYm5SbApjbTFsWkdsaGRHVXdIaGNOTWpVd09USXlNREkwTkRJNVdoY05NalV3T1RJeU1ESTFOREk1V2pBQU1Ga3dFd1lICktvWkl6ajBDQVFZSUtvWkl6ajBEQVFjRFFnQUUvZkdVeEl3NFE1aTFQVzl1Q3ErajN6dnhlZFdNMkJjb2VXSDAKWmpaN01hRTBXd2d2WDE1UVNPZmJVQytINU9RcXJ5VDVZT1czRnFJSzBFVjM1dlBUREtPQ0FXNHdnZ0ZxTUE0RwpBMVVkRHdFQi93UUVBd0lIZ0RBVEJnTlZIU1VFRERBS0JnZ3JCZ0VGQlFjREF6QWRCZ05WSFE0RUZnUVVtdHJRCk9rVU9rWEdOdkd6cDQ3ZUk0Q1ZqRCtNd0h3WURWUjBqQkJnd0ZvQVUzOVBwejFZa0VaYjVxTmpwS0ZXaXhpNFkKWkQ4d0dRWURWUjBSQVFIL0JBOHdEWUVMZG5WQWEzSnViQzU0ZVhvd0xBWUtLd1lCQkFHRHZ6QUJBUVFlYUhSMApjSE02THk5bmFYUm9kV0l1WTI5dEwyeHZaMmx1TDI5aGRYUm9NQzRHQ2lzR0FRUUJnNzh3QVFnRUlBd2VhSFIwCmNITTZMeTluYVhSb2RXSXVZMjl0TDJ4dloybHVMMjloZFhSb01JR0pCZ29yQmdFRUFkWjVBZ1FDQkhzRWVRQjMKQUhVQTNUMHdhc2JIRVRKakdSNGNtV2MzQXFKS1hyamVQSzMvaDRweWdDOHA3bzRBQUFHWmIwN3o3Z0FBQkFNQQpSakJFQWlBN2lvQ3V2Skh5eEY2dlltalJIcjhVbTZCM2ZjRTY3Vk5oaittT0VHL1c0QUlnTEFjQUplQjMyMm9HCnI2NlAvUEI1aEV5eXRZOTZzdndVL1F1UnAyaVdidjR3Q2dZSUtvWkl6ajBFQXdNRGFBQXdaUUl4QUp4MEZQSysKWnhHTHExRWcrWWx5eHBNSmNWRmpxTitabkREMk52SHlBZFU0ZFA2ZjQvNHFQclVORVhXTTdQMGwvQUl3TmdEYQp6TXRURGZBL0F2S2V4ZU4rdkFLemwxZk41RXBBNHVWbi9JVEt6eVNQL2tLQTFELzdQRmxTNm5sVldCc00KLS0tLS1FTkQgQ0VSVElGSUNBVEUtLS0tLQo=","rekorBundle":{"SignedEntryTimestamp":"MEUCIAkTrAto3r3iYxlVdXM/MSOjJXRbW/hh986oKsRlllG6AiEAkaaeiDFCMmx4njDi2G6+w722RfsCC3U6+Ucx8BKrG6k=","Payload":{"body":"eyJhcGlWZXJzaW9uIjoiMC4wLjEiLCJraW5kIjoiaGFzaGVkcmVrb3JkIiwic3BlYyI6eyJkYXRhIjp7Imhhc2giOnsiYWxnb3JpdGhtIjoic2hhMjU2IiwidmFsdWUiOiJmY2U1NDNlMzI5MzBjMzNhMjQ0NmIxN2JkMWFjZmFhNDZhMmQzZjM1NTExMGZkZDViYmI1OWM1MGFkNmM4MGI5In19LCJzaWduYXR1cmUiOnsiY29udGVudCI6Ik1FUUNIMTJRQVcrN0JJTDc3a09ZL21NOUN2T0VSRGQxQ0QwNWt6ekRQU0d1cG9zQ0lRREFtZmorU0ljeWFRd3FSSEVXY0ZvZ0JRdW1IcGN6akdzM1pxWGU4UWY2WEE9PSIsInB1YmxpY0tleSI6eyJjb250ZW50IjoiTFMwdExTMUNSVWRKVGlCRFJWSlVTVVpKUTBGVVJTMHRMUzB0Q2sxSlNVTjVWRU5EUVdzclowRjNTVUpCWjBsVldHSjJRbUZTZHpsV1NraE9VVmxWUkc1elJVOTRSbFJaWlZsQmQwTm5XVWxMYjFwSmVtb3dSVUYzVFhjS1RucEZWazFDVFVkQk1WVkZRMmhOVFdNeWJHNWpNMUoyWTIxVmRWcEhWakpOVWpSM1NFRlpSRlpSVVVSRmVGWjZZVmRrZW1SSE9YbGFVekZ3WW01U2JBcGpiVEZzV2tkc2FHUkhWWGRJYUdOT1RXcFZkMDlVU1hsTlJFa3dUa1JKTlZkb1kwNU5hbFYzVDFSSmVVMUVTVEZPUkVrMVYycEJRVTFHYTNkRmQxbElDa3R2V2tsNmFqQkRRVkZaU1V0dldrbDZhakJFUVZGalJGRm5RVVV2WmtkVmVFbDNORkUxYVRGUVZ6bDFRM0VyYWpONmRuaGxaRmROTWtKamIyVlhTREFLV21wYU4wMWhSVEJYZDJkMldERTFVVk5QWm1KVlF5dElOVTlSY1hKNVZEVlpUMWN6Um5GSlN6QkZWak0xZGxCVVJFdFBRMEZYTkhkblowWnhUVUUwUndwQk1WVmtSSGRGUWk5M1VVVkJkMGxJWjBSQlZFSm5UbFpJVTFWRlJFUkJTMEpuWjNKQ1owVkdRbEZqUkVGNlFXUkNaMDVXU0ZFMFJVWm5VVlZ0ZEhKUkNrOXJWVTlyV0VkT2RrZDZjRFEzWlVrMFExWnFSQ3ROZDBoM1dVUldVakJxUWtKbmQwWnZRVlV6T1ZCd2VqRlphMFZhWWpWeFRtcHdTMFpYYVhocE5Ga0tXa1E0ZDBkUldVUldVakJTUVZGSUwwSkJPSGRFV1VWTVpHNVdRV0V6U25WaVF6VTBaVmh2ZDB4QldVdExkMWxDUWtGSFJIWjZRVUpCVVZGbFlVaFNNQXBqU0UwMlRIazVibUZZVW05a1YwbDFXVEk1ZEV3eWVIWmFNbXgxVERJNWFHUllVbTlOUXpSSFEybHpSMEZSVVVKbk56aDNRVkZuUlVsQmQyVmhTRkl3Q21OSVRUWk1lVGx1WVZoU2IyUlhTWFZaTWpsMFRESjRkbG95YkhWTU1qbG9aRmhTYjAxSlIwcENaMjl5UW1kRlJVRmtXalZCWjFGRFFraHpSV1ZSUWpNS1FVaFZRVE5VTUhkaGMySklSVlJLYWtkU05HTnRWMk16UVhGS1MxaHlhbVZRU3pNdmFEUndlV2RET0hBM2J6UkJRVUZIV21Jd04zbzNaMEZCUWtGTlFRcFNha0pGUVdsQk4ybHZRM1YyU2toNWVFWTJkbGx0YWxKSWNqaFZiVFpDTTJaalJUWTNWazVvYWl0dFQwVkhMMWMwUVVsblRFRmpRVXBsUWpNeU1tOUhDbkkyTmxBdlVFSTFhRVY1ZVhSWk9UWnpkbmRWTDFGMVVuQXlhVmRpZGpSM1EyZFpTVXR2V2tsNmFqQkZRWGROUkdGQlFYZGFVVWw0UVVwNE1FWlFTeXNLV25oSFRIRXhSV2NyV1d4NWVIQk5TbU5XUm1weFRpdGFia1JFTWs1MlNIbEJaRlUwWkZBMlpqUXZOSEZRY2xWT1JWaFhUVGRRTUd3dlFVbDNUbWRFWVFwNlRYUlVSR1pCTDBGMlMyVjRaVTRyZGtGTGVtd3haazQxUlhCQk5IVldiaTlKVkV0NmVWTlFMMnRMUVRGRUx6ZFFSbXhUTm01c1ZsZENjMDBLTFMwdExTMUZUa1FnUTBWU1ZFbEdTVU5CVkVVdExTMHRMUW89In19fX0=","integratedTime":1758509069,"logIndex":544680748,"logID":"c0d23d6ad406973f9559f3ba2d1ca01f84147d8ffc5b8445c224f98b9591801d"}}},
      "allowed_issuers": [
        "https://token.actions.githubusercontent.com",
        "https://github.com/login/oauth"
      ],
      "allowed_subjects": [
        "*@krnl.xyz",
        "https://github.com/krnl-labs/*"
      ]
    },
    {
      "image": "ghcr.io/krnl-labs/executor-encoder-evm",
      "image_digest": "sha256:b28823d12eb1b16cbcc34c751302cd2dbe7e35480a5bc20e4e7ad50a059b6611",
      "sbom_bundle": {"base64Signature":"MEUCICtuEyNuf6OIDcCbpTF6y8wyBrXAZOCeJKwXgWHWUOvnAiEA7wTC5BfrxEYn6NFbmZszojaGLqhvcvCObnbxT1jQwlw=","cert":"LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUN5ekNDQWxDZ0F3SUJBZ0lVUmtieG1HdE1ETndEV29YR0VYUnFJNUxuemljd0NnWUlLb1pJemowRUF3TXcKTnpFVk1CTUdBMVVFQ2hNTWMybG5jM1J2Y21VdVpHVjJNUjR3SEFZRFZRUURFeFZ6YVdkemRHOXlaUzFwYm5SbApjbTFsWkdsaGRHVXdIaGNOTWpVd09USXlNREkwTmpFeFdoY05NalV3T1RJeU1ESTFOakV4V2pBQU1Ga3dFd1lICktvWkl6ajBDQVFZSUtvWkl6ajBEQVFjRFFnQUV2U1lLS05rOForUkVKVnIvMCtoaEg1UDZZeTFlMVdMckdBMnUKMkZML09wK2VUcjl5R3lSNFlFUFVoSkZYWGdQR0xpUHp2OWJzRmVEQjZ4NThLQkFDOEtPQ0FXOHdnZ0ZyTUE0RwpBMVVkRHdFQi93UUVBd0lIZ0RBVEJnTlZIU1VFRERBS0JnZ3JCZ0VGQlFjREF6QWRCZ05WSFE0RUZnUVVzL1FxCklnb0hScVpRTkkrTWtTSnJhUWNXajEwd0h3WURWUjBqQkJnd0ZvQVUzOVBwejFZa0VaYjVxTmpwS0ZXaXhpNFkKWkQ4d0dRWURWUjBSQVFIL0JBOHdEWUVMZG5WQWEzSnViQzU0ZVhvd0xBWUtLd1lCQkFHRHZ6QUJBUVFlYUhSMApjSE02THk5bmFYUm9kV0l1WTI5dEwyeHZaMmx1TDI5aGRYUm9NQzRHQ2lzR0FRUUJnNzh3QVFnRUlBd2VhSFIwCmNITTZMeTluYVhSb2RXSXVZMjl0TDJ4dloybHVMMjloZFhSb01JR0tCZ29yQmdFRUFkWjVBZ1FDQkh3RWVnQjQKQUhZQTNUMHdhc2JIRVRKakdSNGNtV2MzQXFKS1hyamVQSzMvaDRweWdDOHA3bzRBQUFHWmIxQ0RDd0FBQkFNQQpSekJGQWlFQXhKcDdGM21ObE53ZU9DR2NXRE1haW5XVktzdlR0VlZpcGFXOHdoekRwdUlDSUNRZFJyQnd3UnNvCi9TS3FsTzVaSFNKTDZvQno1Vk1jVnNvOXdYdHhZUktrTUFvR0NDcUdTTTQ5QkFNREEya0FNR1lDTVFEMlNkYUIKUXZ5eDczSXYxSk50eUtZQVd2SWNJY3ZLZlhVa05VT1lmWE0xRHhEb2NtZjB6SjZWVHlZK2k1TmQwL29DTVFDTgpwUDNudStUeVIrbTl2YjJ1UlFHODZrU2xJZjdXd2pkeWpHYjNTc1ZpaVl1RzZiOU1qR2xES1liYTBBY3lEVWs9Ci0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0K","rekorBundle":{"SignedEntryTimestamp":"MEYCIQCyji0ImBVsYzjcKdnsZnFJTbauOeULsEXH7XvHOONEhAIhALuSLu39qL9boHBpTFd3ni4aREWYr78SrMyX+Wsasf2S","Payload":{"body":"eyJhcGlWZXJzaW9uIjoiMC4wLjEiLCJraW5kIjoiaGFzaGVkcmVrb3JkIiwic3BlYyI6eyJkYXRhIjp7Imhhc2giOnsiYWxnb3JpdGhtIjoic2hhMjU2IiwidmFsdWUiOiI0YTI2ODEyZWMyMjljOTcwMmZmODUwOTc5MzliOGQzM2U2OGFjZDAyZTFiZTk5NTM4MzQzZTVjZTkxM2UxOWM2In19LCJzaWduYXR1cmUiOnsiY29udGVudCI6Ik1FVUNJQ3R1RXlOdWY2T0lEY0NicFRGNnk4d3lCclhBWk9DZUpLd1hnV0hXVU92bkFpRUE3d1RDNUJmcnhFWW42TkZibVpzem9qYUdMcWh2Y3ZDT2JuYnhUMWpRd2x3PSIsInB1YmxpY0tleSI6eyJjb250ZW50IjoiTFMwdExTMUNSVWRKVGlCRFJWSlVTVVpKUTBGVVJTMHRMUzB0Q2sxSlNVTjVla05EUVd4RFowRjNTVUpCWjBsVlVtdGllRzFIZEUxRVRuZEVWMjlZUjBWWVVuRkpOVXh1ZW1samQwTm5XVWxMYjFwSmVtb3dSVUYzVFhjS1RucEZWazFDVFVkQk1WVkZRMmhOVFdNeWJHNWpNMUoyWTIxVmRWcEhWakpOVWpSM1NFRlpSRlpSVVVSRmVGWjZZVmRrZW1SSE9YbGFVekZ3WW01U2JBcGpiVEZzV2tkc2FHUkhWWGRJYUdOT1RXcFZkMDlVU1hsTlJFa3dUbXBGZUZkb1kwNU5hbFYzVDFSSmVVMUVTVEZPYWtWNFYycEJRVTFHYTNkRmQxbElDa3R2V2tsNmFqQkRRVkZaU1V0dldrbDZhakJFUVZGalJGRm5RVVYyVTFsTFMwNXJPRm9yVWtWS1ZuSXZNQ3RvYUVnMVVEWlplVEZsTVZkTWNrZEJNblVLTWtaTUwwOXdLMlZVY2psNVIzbFNORmxGVUZWb1NrWllXR2RRUjB4cFVIcDJPV0p6Um1WRVFqWjROVGhMUWtGRE9FdFBRMEZYT0hkblowWnlUVUUwUndwQk1WVmtSSGRGUWk5M1VVVkJkMGxJWjBSQlZFSm5UbFpJVTFWRlJFUkJTMEpuWjNKQ1owVkdRbEZqUkVGNlFXUkNaMDVXU0ZFMFJVWm5VVlZ6TDFGeENrbG5iMGhTY1ZwUlRra3JUV3RUU25KaFVXTlhhakV3ZDBoM1dVUldVakJxUWtKbmQwWnZRVlV6T1ZCd2VqRlphMFZhWWpWeFRtcHdTMFpYYVhocE5Ga0tXa1E0ZDBkUldVUldVakJTUVZGSUwwSkJPSGRFV1VWTVpHNVdRV0V6U25WaVF6VTBaVmh2ZDB4QldVdExkMWxDUWtGSFJIWjZRVUpCVVZGbFlVaFNNQXBqU0UwMlRIazVibUZZVW05a1YwbDFXVEk1ZEV3eWVIWmFNbXgxVERJNWFHUllVbTlOUXpSSFEybHpSMEZSVVVKbk56aDNRVkZuUlVsQmQyVmhTRkl3Q21OSVRUWk1lVGx1WVZoU2IyUlhTWFZaTWpsMFRESjRkbG95YkhWTU1qbG9aRmhTYjAxSlIwdENaMjl5UW1kRlJVRmtXalZCWjFGRFFraDNSV1ZuUWpRS1FVaFpRVE5VTUhkaGMySklSVlJLYWtkU05HTnRWMk16UVhGS1MxaHlhbVZRU3pNdmFEUndlV2RET0hBM2J6UkJRVUZIV21JeFEwUkRkMEZCUWtGTlFRcFNla0pHUVdsRlFYaEtjRGRHTTIxT2JFNTNaVTlEUjJOWFJFMWhhVzVYVmt0emRsUjBWbFpwY0dGWE9IZG9la1J3ZFVsRFNVTlJaRkp5UW5kM1VuTnZDaTlUUzNGc1R6VmFTRk5LVERadlFubzFWazFqVm5Odk9YZFlkSGhaVWt0clRVRnZSME5EY1VkVFRUUTVRa0ZOUkVFeWEwRk5SMWxEVFZGRU1sTmtZVUlLVVhaNWVEY3pTWFl4U2s1MGVVdFpRVmQyU1dOSlkzWkxabGhWYTA1VlQxbG1XRTB4UkhoRWIyTnRaakI2U2paV1ZIbFpLMmsxVG1Rd0wyOURUVkZEVGdwd1VETnVkU3RVZVZJcmJUbDJZakoxVWxGSE9EWnJVMnhKWmpkWGQycGtlV3BIWWpOVGMxWnBhVmwxUnpaaU9VMXFSMnhFUzFsaVlUQkJZM2xFVldzOUNpMHRMUzB0UlU1RUlFTkZVbFJKUmtsRFFWUkZMUzB0TFMwSyJ9fX19","integratedTime":1758509171,"logIndex":544687622,"logID":"c0d23d6ad406973f9559f3ba2d1ca01f84147d8ffc5b8445c224f98b9591801d"}}},
      "allowed_issuers": [
        "https://token.actions.githubusercontent.com",
        "https://github.com/login/oauth"
      ],
      "allowed_subjects": [
        "*@krnl.xyz",
        "https://github.com/krnl-labs/*"
      ]
    },
    {
      "image": "ghcr.io/krnl-labs/executor-evm-read",
      "image_digest": "sha256:006aec32bba98b47e7361ae10422d6fab878b5cf30fecb342d22c3d7f09b180d",
      "sbom_bundle": {"base64Signature":"MEYCIQDh1zpFwZOi2vRpWYMEC3ZRWtBLLIXsEZd1RfIsB3srDQIhANVcfxNEMaO6ZdTe9NPOTmYA9gGQ93cioXTB9vzf56Hq","cert":"LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUN5VENDQWsrZ0F3SUJBZ0lVZExEYmRxSUxNT1dreXdHKzIwSTBGRTRNVkFnd0NnWUlLb1pJemowRUF3TXcKTnpFVk1CTUdBMVVFQ2hNTWMybG5jM1J2Y21VdVpHVjJNUjR3SEFZRFZRUURFeFZ6YVdkemRHOXlaUzFwYm5SbApjbTFsWkdsaGRHVXdIaGNOTWpVd09USXlNREkwTnpVd1doY05NalV3T1RJeU1ESTFOelV3V2pBQU1Ga3dFd1lICktvWkl6ajBDQVFZSUtvWkl6ajBEQVFjRFFnQUV5bnJ5UDN5eEVuM09SUFlIS1Vib3I5L2ZGLzBXSGROYnIra00KQWNiUnV5RUwrcGZDSGRsWnpjTjRZREkwK0puTThkOFUyZGZOcU9kTnhnVCtLWTJjWXFPQ0FXNHdnZ0ZxTUE0RwpBMVVkRHdFQi93UUVBd0lIZ0RBVEJnTlZIU1VFRERBS0JnZ3JCZ0VGQlFjREF6QWRCZ05WSFE0RUZnUVVhNVdnCkxUYzZpcVk1QjFJdHI5QlJ5K3dhN0ZBd0h3WURWUjBqQkJnd0ZvQVUzOVBwejFZa0VaYjVxTmpwS0ZXaXhpNFkKWkQ4d0dRWURWUjBSQVFIL0JBOHdEWUVMZG5WQWEzSnViQzU0ZVhvd0xBWUtLd1lCQkFHRHZ6QUJBUVFlYUhSMApjSE02THk5bmFYUm9kV0l1WTI5dEwyeHZaMmx1TDI5aGRYUm9NQzRHQ2lzR0FRUUJnNzh3QVFnRUlBd2VhSFIwCmNITTZMeTluYVhSb2RXSXVZMjl0TDJ4dloybHVMMjloZFhSb01JR0pCZ29yQmdFRUFkWjVBZ1FDQkhzRWVRQjMKQUhVQTNUMHdhc2JIRVRKakdSNGNtV2MzQXFKS1hyamVQSzMvaDRweWdDOHA3bzRBQUFHWmIxSUdXUUFBQkFNQQpSakJFQWlCY0hGQ0tCOFgrL0ZKeGVuTldLckVQSzhvZHNZTjlPOUlmbXVKaXdsVnNHQUlnQ2x3QWxTV1oyTFQyClVqbVJmdUlhVy93L3lndjg0a25BZzdBZVk3Mlo1eDh3Q2dZSUtvWkl6ajBFQXdNRGFBQXdaUUl3T3FHbVBjQmwKMEpqZmZkQ05TalRzZVMranMyekc2WFlST3I3Q2YzSmQ5emh3OVNsT09GdVprQ1dmOTZyWDF1SUhBakVBZ1EwRwplNE5wUGRGdHdlZHdEQWVLdDJpRmF1QTU2TnJZeHZBYTNxeXQzUHZSRXF3cnZUckVHVUx0QjM5MGRxUzIKLS0tLS1FTkQgQ0VSVElGSUNBVEUtLS0tLQo=","rekorBundle":{"SignedEntryTimestamp":"MEYCIQCfbu91yAsenlSMWyo9z+F9HDazkWpDgAqxgq8Eqk6iOQIhAPhnOj2/3o/ekZT4xrQC3IcvVPKbUdsRpspjdFtRG+gc","Payload":{"body":"eyJhcGlWZXJzaW9uIjoiMC4wLjEiLCJraW5kIjoiaGFzaGVkcmVrb3JkIiwic3BlYyI6eyJkYXRhIjp7Imhhc2giOnsiYWxnb3JpdGhtIjoic2hhMjU2IiwidmFsdWUiOiJjMTMyMjRhY2RmNzNjYTJlNDJmY2FjNTJmMjVkZDBlNzQ0MmRmZDIwOGNjMWQ3Nzg5YzE0Yjc2ZDk1Zjg5ZThjIn19LCJzaWduYXR1cmUiOnsiY29udGVudCI6Ik1FWUNJUURoMXpwRndaT2kydlJwV1lNRUMzWlJXdEJMTElYc0VaZDFSZklzQjNzckRRSWhBTlZjZnhORU1hTzZaZFRlOU5QT1RtWUE5Z0dROTNjaW9YVEI5dnpmNTZIcSIsInB1YmxpY0tleSI6eyJjb250ZW50IjoiTFMwdExTMUNSVWRKVGlCRFJWSlVTVVpKUTBGVVJTMHRMUzB0Q2sxSlNVTjVWRU5EUVdzclowRjNTVUpCWjBsVlpFeEVZbVJ4U1V4TlQxZHJlWGRIS3pJd1NUQkdSVFJOVmtGbmQwTm5XVWxMYjFwSmVtb3dSVUYzVFhjS1RucEZWazFDVFVkQk1WVkZRMmhOVFdNeWJHNWpNMUoyWTIxVmRWcEhWakpOVWpSM1NFRlpSRlpSVVVSRmVGWjZZVmRrZW1SSE9YbGFVekZ3WW01U2JBcGpiVEZzV2tkc2FHUkhWWGRJYUdOT1RXcFZkMDlVU1hsTlJFa3dUbnBWZDFkb1kwNU5hbFYzVDFSSmVVMUVTVEZPZWxWM1YycEJRVTFHYTNkRmQxbElDa3R2V2tsNmFqQkRRVkZaU1V0dldrbDZhakJFUVZGalJGRm5RVVY1Ym5KNVVETjVlRVZ1TTA5U1VGbElTMVZpYjNJNUwyWkdMekJYU0dST1luSXJhMDBLUVdOaVVuVjVSVXdyY0daRFNHUnNXbnBqVGpSWlJFa3dLMHB1VFRoa09GVXlaR1pPY1U5a1RuaG5WQ3RMV1RKaldYRlBRMEZYTkhkblowWnhUVUUwUndwQk1WVmtSSGRGUWk5M1VVVkJkMGxJWjBSQlZFSm5UbFpJVTFWRlJFUkJTMEpuWjNKQ1owVkdRbEZqUkVGNlFXUkNaMDVXU0ZFMFJVWm5VVlZoTlZkbkNreFVZelpwY1ZrMVFqRkpkSEk1UWxKNUszZGhOMFpCZDBoM1dVUldVakJxUWtKbmQwWnZRVlV6T1ZCd2VqRlphMFZhWWpWeFRtcHdTMFpYYVhocE5Ga0tXa1E0ZDBkUldVUldVakJTUVZGSUwwSkJPSGRFV1VWTVpHNVdRV0V6U25WaVF6VTBaVmh2ZDB4QldVdExkMWxDUWtGSFJIWjZRVUpCVVZGbFlVaFNNQXBqU0UwMlRIazVibUZZVW05a1YwbDFXVEk1ZEV3eWVIWmFNbXgxVERJNWFHUllVbTlOUXpSSFEybHpSMEZSVVVKbk56aDNRVkZuUlVsQmQyVmhTRkl3Q21OSVRUWk1lVGx1WVZoU2IyUlhTWFZaTWpsMFRESjRkbG95YkhWTU1qbG9aRmhTYjAxSlIwcENaMjl5UW1kRlJVRmtXalZCWjFGRFFraHpSV1ZSUWpNS1FVaFZRVE5VTUhkaGMySklSVlJLYWtkU05HTnRWMk16UVhGS1MxaHlhbVZRU3pNdmFEUndlV2RET0hBM2J6UkJRVUZIV21JeFNVZFhVVUZCUWtGTlFRcFNha0pGUVdsQ1kwaEdRMHRDT0ZnckwwWktlR1Z1VGxkTGNrVlFTemh2WkhOWlRqbFBPVWxtYlhWS2FYZHNWbk5IUVVsblEyeDNRV3hUVjFveVRGUXlDbFZxYlZKbWRVbGhWeTkzTDNsbmRqZzBhMjVCWnpkQlpWazNNbG8xZURoM1EyZFpTVXR2V2tsNmFqQkZRWGROUkdGQlFYZGFVVWwzVDNGSGJWQmpRbXdLTUVwcVptWmtRMDVUYWxSelpWTXJhbk15ZWtjMldGbFNUM0kzUTJZelNtUTVlbWgzT1ZOc1QwOUdkVnByUTFkbU9UWnlXREYxU1VoQmFrVkJaMUV3UndwbE5FNXdVR1JHZEhkbFpIZEVRV1ZMZERKcFJtRjFRVFUyVG5KWmVIWkJZVE54ZVhRelVIWlNSWEYzY25aVWNrVkhWVXgwUWpNNU1HUnhVeklLTFMwdExTMUZUa1FnUTBWU1ZFbEdTVU5CVkVVdExTMHRMUW89In19fX0=","integratedTime":1758509271,"logIndex":544694725,"logID":"c0d23d6ad406973f9559f3ba2d1ca01f84147d8ffc5b8445c224f98b9591801d"}}},
      "allowed_issuers": [
        "https://token.actions.githubusercontent.com",
        "https://github.com/login/oauth"
      ],
      "allowed_subjects": [
        "*@krnl.xyz",
        "https://github.com/krnl-labs/*"
      ]
    },
    {
      "image": "ghcr.io/krnl-labs/executor-http",
      "image_digest": "sha256:07ef35b261014304a0163502a7f1dec5395c5cac1fc381dc1f79b052389ab0d5",
      "sbom_bundle": {"base64Signature":"MEQCIBMOlKd3pkgiIvnSUSfZA0T9NE1ShbEw+5ya096fGEewAiB7Tm8ePOzHMIQBTO+MGFiJidGhcXICKGAtWmYG3+wzPw==","cert":"LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUN5VENDQWsrZ0F3SUJBZ0lVSnJkdkhvQUk5aERldnV1NFJ0V2ZqL2FnWHFNd0NnWUlLb1pJemowRUF3TXcKTnpFVk1CTUdBMVVFQ2hNTWMybG5jM1J2Y21VdVpHVjJNUjR3SEFZRFZRUURFeFZ6YVdkemRHOXlaUzFwYm5SbApjbTFsWkdsaGRHVXdIaGNOTWpVd09USXlNREkwT1RJeFdoY05NalV3T1RJeU1ESTFPVEl4V2pBQU1Ga3dFd1lICktvWkl6ajBDQVFZSUtvWkl6ajBEQVFjRFFnQUUyYTIzVEQ4bHM3WmRUdW1rVDJ0b3hKU0dTL2hkdmVQUzF1WVUKMzc3ZHZybGhTNVduNmtRNUUzR3JrNnFvZkVlSkdwVERyQVdtbFdIMC9paU9HaWZEdnFPQ0FXNHdnZ0ZxTUE0RwpBMVVkRHdFQi93UUVBd0lIZ0RBVEJnTlZIU1VFRERBS0JnZ3JCZ0VGQlFjREF6QWRCZ05WSFE0RUZnUVVPeDM2Cm9TM1BPeFdtSW40RHhUcUNjQ1JWM3Znd0h3WURWUjBqQkJnd0ZvQVUzOVBwejFZa0VaYjVxTmpwS0ZXaXhpNFkKWkQ4d0dRWURWUjBSQVFIL0JBOHdEWUVMZG5WQWEzSnViQzU0ZVhvd0xBWUtLd1lCQkFHRHZ6QUJBUVFlYUhSMApjSE02THk5bmFYUm9kV0l1WTI5dEwyeHZaMmx1TDI5aGRYUm9NQzRHQ2lzR0FRUUJnNzh3QVFnRUlBd2VhSFIwCmNITTZMeTluYVhSb2RXSXVZMjl0TDJ4dloybHVMMjloZFhSb01JR0pCZ29yQmdFRUFkWjVBZ1FDQkhzRWVRQjMKQUhVQTNUMHdhc2JIRVRKakdSNGNtV2MzQXFKS1hyamVQSzMvaDRweWdDOHA3bzRBQUFHWmIxTm52UUFBQkFNQQpSakJFQWlBQkgrUGNLRmdueHNadU85eWNiWWFDblo1ZSs3RFI3ZjdJUWdaTjdYcnBDQUlnZWl1cEdPaXR1WlU5CnZlT20xSTl4dTdtVFV5TW5KQWNnVHh4ZXpETXlEQ2N3Q2dZSUtvWkl6ajBFQXdNRGFBQXdaUUl3RGxIN3VPSkwKL3lCbldFYTN2eDNuMFVpdko0UGRPZ3duUmcxakcyZnBnelV4T0dEM1EwT2NFYVI5OENwQ0pYUE9BakVBc3dBVgovdEd5TEN3bWttRUZvMjNiZ3IvUkpCZUpTV1ppQUtkRGZWSVp2VGVyQnhWeEtWaVNJeTYxdkFxL1JsR0MKLS0tLS1FTkQgQ0VSVElGSUNBVEUtLS0tLQo=","rekorBundle":{"SignedEntryTimestamp":"MEUCICXTyDokDVhFopyZgNK+WRq9d8Dbc6VomWRcoTDxLK6HAiEAtWjaT4e5xjOORhw2Mdx8u8T74uJwnHgZUJbJJtjiKIo=","Payload":{"body":"eyJhcGlWZXJzaW9uIjoiMC4wLjEiLCJraW5kIjoiaGFzaGVkcmVrb3JkIiwic3BlYyI6eyJkYXRhIjp7Imhhc2giOnsiYWxnb3JpdGhtIjoic2hhMjU2IiwidmFsdWUiOiI0Y2JhMjA4NjJiOWVhZTQyMzgyZTM2MzliZjU1NTM5NzM2ZDJmYzIyODE0ZWU5NzI5NDBhNTQ1NjI5NTQxZWM0In19LCJzaWduYXR1cmUiOnsiY29udGVudCI6Ik1FUUNJQk1PbEtkM3BrZ2lJdm5TVVNmWkEwVDlORTFTaGJFdys1eWEwOTZmR0Vld0FpQjdUbThlUE96SE1JUUJUTytNR0ZpSmlkR2hjWElDS0dBdFdtWUczK3d6UHc9PSIsInB1YmxpY0tleSI6eyJjb250ZW50IjoiTFMwdExTMUNSVWRKVGlCRFJWSlVTVVpKUTBGVVJTMHRMUzB0Q2sxSlNVTjVWRU5EUVdzclowRjNTVUpCWjBsVlNuSmtka2h2UVVrNWFFUmxkblYxTkZKMFYyWnFMMkZuV0hGTmQwTm5XVWxMYjFwSmVtb3dSVUYzVFhjS1RucEZWazFDVFVkQk1WVkZRMmhOVFdNeWJHNWpNMUoyWTIxVmRWcEhWakpOVWpSM1NFRlpSRlpSVVVSRmVGWjZZVmRrZW1SSE9YbGFVekZ3WW01U2JBcGpiVEZzV2tkc2FHUkhWWGRJYUdOT1RXcFZkMDlVU1hsTlJFa3dUMVJKZUZkb1kwNU5hbFYzVDFSSmVVMUVTVEZQVkVsNFYycEJRVTFHYTNkRmQxbElDa3R2V2tsNmFqQkRRVkZaU1V0dldrbDZhakJFUVZGalJGRm5RVVV5WVRJelZFUTRiSE0zV21SVWRXMXJWREowYjNoS1UwZFRMMmhrZG1WUVV6RjFXVlVLTXpjM1pIWnliR2hUTlZkdU5tdFJOVVV6UjNKck5uRnZaa1ZsU2tkd1ZFUnlRVmR0YkZkSU1DOXBhVTlIYVdaRWRuRlBRMEZYTkhkblowWnhUVUUwUndwQk1WVmtSSGRGUWk5M1VVVkJkMGxJWjBSQlZFSm5UbFpJVTFWRlJFUkJTMEpuWjNKQ1owVkdRbEZqUkVGNlFXUkNaMDVXU0ZFMFJVWm5VVlZQZURNMkNtOVRNMUJQZUZkdFNXNDBSSGhVY1VOalExSldNM1puZDBoM1dVUldVakJxUWtKbmQwWnZRVlV6T1ZCd2VqRlphMFZhWWpWeFRtcHdTMFpYYVhocE5Ga0tXa1E0ZDBkUldVUldVakJTUVZGSUwwSkJPSGRFV1VWTVpHNVdRV0V6U25WaVF6VTBaVmh2ZDB4QldVdExkMWxDUWtGSFJIWjZRVUpCVVZGbFlVaFNNQXBqU0UwMlRIazVibUZZVW05a1YwbDFXVEk1ZEV3eWVIWmFNbXgxVERJNWFHUllVbTlOUXpSSFEybHpSMEZSVVVKbk56aDNRVkZuUlVsQmQyVmhTRkl3Q21OSVRUWk1lVGx1WVZoU2IyUlhTWFZaTWpsMFRESjRkbG95YkhWTU1qbG9aRmhTYjAxSlIwcENaMjl5UW1kRlJVRmtXalZCWjFGRFFraHpSV1ZSUWpNS1FVaFZRVE5VTUhkaGMySklSVlJLYWtkU05HTnRWMk16UVhGS1MxaHlhbVZRU3pNdmFEUndlV2RET0hBM2J6UkJRVUZIV21JeFRtNTJVVUZCUWtGTlFRcFNha0pGUVdsQlFrZ3JVR05MUm1kdWVITmFkVTg1ZVdOaVdXRkRibG8xWlNzM1JGSTNaamRKVVdkYVRqZFljbkJEUVVsblpXbDFjRWRQYVhSMVdsVTVDblpsVDIweFNUbDRkVGR0VkZWNVRXNUtRV05uVkhoNFpYcEVUWGxFUTJOM1EyZFpTVXR2V2tsNmFqQkZRWGROUkdGQlFYZGFVVWwzUkd4SU4zVlBTa3dLTDNsQ2JsZEZZVE4yZUROdU1GVnBka28wVUdSUFozZHVVbWN4YWtjeVpuQm5lbFY0VDBkRU0xRXdUMk5GWVZJNU9FTndRMHBZVUU5QmFrVkJjM2RCVmdvdmRFZDVURU4zYld0dFJVWnZNak5pWjNJdlVrcENaVXBUVjFwcFFVdGtSR1pXU1ZwMlZHVnlRbmhXZUV0V2FWTkplVFl4ZGtGeEwxSnNSME1LTFMwdExTMUZUa1FnUTBWU1ZFbEdTVU5CVkVVdExTMHRMUW89In19fX0=","integratedTime":1758509361,"logIndex":544700783,"logID":"c0d23d6ad406973f9559f3ba2d1ca01f84147d8ffc5b8445c224f98b9591801d"}}},
      "allowed_issuers": [
        "https://token.actions.githubusercontent.com",
        "https://github.com/login/oauth"
      ],
      "allowed_subjects": [
        "*@krnl.xyz",
        "https://github.com/krnl-labs/*"
      ]
    },
    {
      "image": "ghcr.io/krnl-labs/executor-prepare-authdata",
      "image_digest": "sha256:075e7733db357fe18ddd745372bbea44eaa854c60856c0bdb2a8442c88bc80f9",
      "sbom_bundle": {"base64Signature":"MEYCIQCIoNKh2Stmu6V4sJx+eV1p7XmZc4//mcQkMAhhkp63SAIhAOa+Ze05d4XVAnbL7/zjcj5K78dXgvEPUtOui+v4TZmr","cert":"LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUN6RENDQWxHZ0F3SUJBZ0lVTkRER2orc20vdlBORll4Yjkzc2FGdjNQZDZBd0NnWUlLb1pJemowRUF3TXcKTnpFVk1CTUdBMVVFQ2hNTWMybG5jM1J2Y21VdVpHVjJNUjR3SEFZRFZRUURFeFZ6YVdkemRHOXlaUzFwYm5SbApjbTFsWkdsaGRHVXdIaGNOTWpVd09USXlNREkxTURVMFdoY05NalV3T1RJeU1ETXdNRFUwV2pBQU1Ga3dFd1lICktvWkl6ajBDQVFZSUtvWkl6ajBEQVFjRFFnQUVkOU9mSzdkYUxlWEVJNFh6Qk9nWEZzYTZJTHdDK2tpejRBd0oKNEc1U3c0MjZPMVo0Sm1ZQlVwaGpCN1F4R0cwNjkwYU9oMUVqZlYxYmxQMS8vMjEwOXFPQ0FYQXdnZ0ZzTUE0RwpBMVVkRHdFQi93UUVBd0lIZ0RBVEJnTlZIU1VFRERBS0JnZ3JCZ0VGQlFjREF6QWRCZ05WSFE0RUZnUVVENFdnCnVKb3RPNGtpdWM0em00UUlVT1BYUEE0d0h3WURWUjBqQkJnd0ZvQVUzOVBwejFZa0VaYjVxTmpwS0ZXaXhpNFkKWkQ4d0dRWURWUjBSQVFIL0JBOHdEWUVMZG5WQWEzSnViQzU0ZVhvd0xBWUtLd1lCQkFHRHZ6QUJBUVFlYUhSMApjSE02THk5bmFYUm9kV0l1WTI5dEwyeHZaMmx1TDI5aGRYUm9NQzRHQ2lzR0FRUUJnNzh3QVFnRUlBd2VhSFIwCmNITTZMeTluYVhSb2RXSXVZMjl0TDJ4dloybHVMMjloZFhSb01JR0xCZ29yQmdFRUFkWjVBZ1FDQkgwRWV3QjUKQUhjQTNUMHdhc2JIRVRKakdSNGNtV2MzQXFKS1hyamVQSzMvaDRweWdDOHA3bzRBQUFHWmIxVFdNd0FBQkFNQQpTREJHQWlFQTdnUTZFeUovOTB5TmFxcmtTcDBpSFZHdkZaWjJZdVkwYXpGMk5lY3AvenNDSVFEaW5vSGJ4N3FECnJRQmEySjl6LzNReFJsVFl3WG9YMUJuOVcwK3RyNllJdGpBS0JnZ3Foa2pPUFFRREF3TnBBREJtQWpFQXRqeWkKSERCMkVQZmZSS1FLZWVkQTg1TTJiSmRkN3NETGlBSUNlazJscG1iL2djY3ZlVUltR2NoY21pYnBST1hIQWpFQQovdDJ3aTkzZGJGVTh3SURvOEhpejZPZloxUTVicEtNVVduM2JRMi9kN29XNWNqMnAxcGloRFY3MzVjYjJobGZICi0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0K","rekorBundle":{"SignedEntryTimestamp":"MEUCIQC8jBVdQUVnonprry/mnBY46aPAtCQq3h+zNeufOghoZwIget1Dagejtoa+L/Ukk5cDokd/zIqJjhTXczJ2wDX/Mqo=","Payload":{"body":"eyJhcGlWZXJzaW9uIjoiMC4wLjEiLCJraW5kIjoiaGFzaGVkcmVrb3JkIiwic3BlYyI6eyJkYXRhIjp7Imhhc2giOnsiYWxnb3JpdGhtIjoic2hhMjU2IiwidmFsdWUiOiJmYmU3ZDAwZTljMTg1YTcxZThmYTAwYjI4ZjEyMWM3ODg4YTBhZmZkMWNkZTdjNDZiMzBjMTIyMjExOWU1MDM0In19LCJzaWduYXR1cmUiOnsiY29udGVudCI6Ik1FWUNJUUNJb05LaDJTdG11NlY0c0p4K2VWMXA3WG1aYzQvL21jUWtNQWhoa3A2M1NBSWhBT2ErWmUwNWQ0WFZBbmJMNy96amNqNUs3OGRYZ3ZFUFV0T3VpK3Y0VFptciIsInB1YmxpY0tleSI6eyJjb250ZW50IjoiTFMwdExTMUNSVWRKVGlCRFJWSlVTVVpKUTBGVVJTMHRMUzB0Q2sxSlNVTjZSRU5EUVd4SFowRjNTVUpCWjBsVlRrUkVSMm9yYzIwdmRsQk9SbGw0WWpremMyRkdkak5RWkRaQmQwTm5XVWxMYjFwSmVtb3dSVUYzVFhjS1RucEZWazFDVFVkQk1WVkZRMmhOVFdNeWJHNWpNMUoyWTIxVmRWcEhWakpOVWpSM1NFRlpSRlpSVVVSRmVGWjZZVmRrZW1SSE9YbGFVekZ3WW01U2JBcGpiVEZzV2tkc2FHUkhWWGRJYUdOT1RXcFZkMDlVU1hsTlJFa3hUVVJWTUZkb1kwNU5hbFYzVDFSSmVVMUVUWGROUkZVd1YycEJRVTFHYTNkRmQxbElDa3R2V2tsNmFqQkRRVkZaU1V0dldrbDZhakJFUVZGalJGRm5RVVZrT1U5bVN6ZGtZVXhsV0VWSk5GaDZRazluV0VaellUWkpUSGRESzJ0cGVqUkJkMG9LTkVjMVUzYzBNalpQTVZvMFNtMVpRbFZ3YUdwQ04xRjRSMGN3Tmprd1lVOW9NVVZxWmxZeFlteFFNUzh2TWpFd09YRlBRMEZZUVhkblowWnpUVUUwUndwQk1WVmtSSGRGUWk5M1VVVkJkMGxJWjBSQlZFSm5UbFpJVTFWRlJFUkJTMEpuWjNKQ1owVkdRbEZqUkVGNlFXUkNaMDVXU0ZFMFJVWm5VVlZFTkZkbkNuVktiM1JQTkd0cGRXTTBlbTAwVVVsVlQxQllVRUUwZDBoM1dVUldVakJxUWtKbmQwWnZRVlV6T1ZCd2VqRlphMFZhWWpWeFRtcHdTMFpYYVhocE5Ga0tXa1E0ZDBkUldVUldVakJTUVZGSUwwSkJPSGRFV1VWTVpHNVdRV0V6U25WaVF6VTBaVmh2ZDB4QldVdExkMWxDUWtGSFJIWjZRVUpCVVZGbFlVaFNNQXBqU0UwMlRIazVibUZZVW05a1YwbDFXVEk1ZEV3eWVIWmFNbXgxVERJNWFHUllVbTlOUXpSSFEybHpSMEZSVVVKbk56aDNRVkZuUlVsQmQyVmhTRkl3Q21OSVRUWk1lVGx1WVZoU2IyUlhTWFZaTWpsMFRESjRkbG95YkhWTU1qbG9aRmhTYjAxSlIweENaMjl5UW1kRlJVRmtXalZCWjFGRFFrZ3dSV1YzUWpVS1FVaGpRVE5VTUhkaGMySklSVlJLYWtkU05HTnRWMk16UVhGS1MxaHlhbVZRU3pNdmFEUndlV2RET0hBM2J6UkJRVUZIV21JeFZGZE5kMEZCUWtGTlFRcFRSRUpIUVdsRlFUZG5VVFpGZVVvdk9UQjVUbUZ4Y210VGNEQnBTRlpIZGtaYVdqSlpkVmt3WVhwR01rNWxZM0F2ZW5ORFNWRkVhVzV2U0dKNE4zRkVDbkpSUW1FeVNqbDZMek5SZUZKc1ZGbDNXRzlZTVVKdU9WY3dLM1J5TmxsSmRHcEJTMEpuWjNGb2EycFBVRkZSUkVGM1RuQkJSRUp0UVdwRlFYUnFlV2tLU0VSQ01rVlFabVpTUzFGTFpXVmtRVGcxVFRKaVNtUmtOM05FVEdsQlNVTmxhekpzY0cxaUwyZGpZM1psVlVsdFIyTm9ZMjFwWW5CU1QxaElRV3BGUVFvdmRESjNhVGt6WkdKR1ZUaDNTVVJ2T0VocGVqWlBabG94VVRWaWNFdE5WVmR1TTJKUk1pOWtOMjlYTldOcU1uQXhjR2xvUkZZM016VmpZakpvYkdaSUNpMHRMUzB0UlU1RUlFTkZVbFJKUmtsRFFWUkZMUzB0TFMwSyJ9fX19","integratedTime":1758509455,"logIndex":544706473,"logID":"c0d23d6ad406973f9559f3ba2d1ca01f84147d8ffc5b8445c224f98b9591801d"}}},
      "allowed_issuers": [
        "https://token.actions.githubusercontent.com",
        "https://github.com/login/oauth"
      ],
      "allowed_subjects": [
        "*@krnl.xyz",
        "https://github.com/krnl-labs/*"
      ]
    }
  ]
}
EOF
}

# Function to create Dockerfile.attestor
create_dockerfile() {
    local OUTPUT_FILE="$1"

    cat > "$OUTPUT_FILE" <<'EOF'
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
EOF
}

# Main process
main() {
    print_header

    # Verify Docker installation and version
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first.

Installation instructions:
        • macOS/Windows: https://docs.docker.com/desktop/
        • Linux: https://docs.docker.com/engine/install/"
    fi

    # Check Docker daemon is running
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running. Please start Docker."
    fi

    # Verify Docker version
    if ! check_docker_version; then
        local current_version
        current_version=$(docker version --format '{{.Server.Version}}' 2>/dev/null || echo "unknown")
        print_error "Docker version $current_version is too old. Required: ${MIN_DOCKER_VERSION} or later.

Please update Docker: https://docs.docker.com/engine/install/"
    fi

    # Verify Docker buildx availability
    if ! docker buildx version &> /dev/null; then
        print_error "Docker buildx is not available. Please update Docker to version ${MIN_DOCKER_VERSION} or later."
    fi

    # Step 1: Collect project configuration
    echo -e "${BLUE}Step 1: Project Configuration${NC}"
    echo "────────────────────────────"

    # Get project name
    echo -n "Enter your project name (e.g., my-dapp): "
    read -r PROJECT_NAME

    if [ -z "$PROJECT_NAME" ]; then
        print_error "Project name cannot be empty"
    fi

    # Validate project name length
    if [ ${#PROJECT_NAME} -gt 50 ]; then
        print_error "Project name is too long (max 50 characters)"
    fi

    # Sanitize project name for Docker image naming conventions
    SAFE_NAME=$(echo "$PROJECT_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]/-/g')

    # Get Docker registry info
    echo -n "Enter Docker registry (default: ghcr.io): "
    read -r REGISTRY
    REGISTRY=${REGISTRY:-ghcr.io}

    # Validate registry format
    if [[ ! "$REGISTRY" =~ ^[a-zA-Z0-9.-]+([:[0-9]+])?$ ]]; then
        print_error "Invalid registry format: $REGISTRY"
    fi

    echo -n "Enter your organization/username: "
    read -r ORG_NAME

    if [ -z "$ORG_NAME" ]; then
        print_error "Organization/username cannot be empty"
    fi

    # Validate organization name format
    if [[ ! "$ORG_NAME" =~ ^[a-z0-9][a-z0-9-]*[a-z0-9]?$ ]]; then
        print_error "Invalid organization/username format. Must start with alphanumeric, can contain hyphens."
    fi

    # Step 2: Collect and validate private key
    echo ""
    echo -e "${BLUE}Step 2: Private Key Setup${NC}"
    echo "────────────────────────────"
    echo "Your private key will be encrypted using whitebox cryptography."
    echo -n "Enter your private key (64 hex chars, without 0x prefix): "
    read -s PRIVATE_KEY
    echo ""

    # Clean and validate private key format
    PRIVATE_KEY="${PRIVATE_KEY#0x}"
    if [ ${#PRIVATE_KEY} -ne 64 ]; then
        print_error "Private key must be exactly 64 hex characters"
    fi

    # Ensure private key contains only valid hexadecimal characters
    if ! [[ "$PRIVATE_KEY" =~ ^[0-9a-fA-F]+$ ]]; then
        print_error "Private key must contain only hexadecimal characters"
    fi

    # Step 3: Set up encryption secret
    echo ""
    echo -e "${BLUE}Step 3: Encryption Configuration${NC}"
    echo "──────────────────────────────────"
    echo "This secret encrypts your whitebox keys for additional security."
    echo -n "Enter encryption secret (or press Enter to auto-generate): "
    read -s ENCRYPTION_SECRET
    echo ""

    if [ -z "$ENCRYPTION_SECRET" ]; then
        ENCRYPTION_SECRET=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)
        print_info "Generated encryption secret"
        print_warning "Save this secret for future updates: $ENCRYPTION_SECRET"
    fi

    # Step 4: Collect API secrets and configuration
    SECRETS_JSON=$(collect_secrets)

    # Confirm secrets configuration
    if [ "$SECRETS_JSON" != "{}" ]; then
        print_success "Secrets configured successfully"
    else
        print_info "No secrets configured"
    fi

    # Step 5: Generate whitebox keys first to get address
    echo ""
    echo -e "${BLUE}Step 5: Generating Whitebox Keys${NC}"
    echo "────────────────────────────────"

    print_info "Pulling keygen image..."
    if ! docker pull "$KEYGEN_IMAGE"; then
        print_error "Cannot pull keygen image: $KEYGEN_IMAGE

Troubleshooting steps:
  1. Verify Docker is running: docker info
  2. Check network connectivity: docker pull hello-world
  3. Authenticate with registry (if private):
     • GitHub: echo YOUR_TOKEN | docker login ghcr.io -u USERNAME --password-stdin
     • DockerHub: docker login
  4. Verify image exists: docker manifest inspect $KEYGEN_IMAGE"
    fi

    print_info "Running key generation..."

    # Create temporary directory for key generation
    TEMP_DIR=$(mktemp -d 2>/dev/null || mktemp -d -t 'attestor')
    trap 'rm -rf "$TEMP_DIR"' EXIT

    # Execute key generation in Docker container
    ADDRESS=""
    if ! docker run --rm \
        -v "$TEMP_DIR":/output \
        "$KEYGEN_IMAGE" \
        -privkey "$PRIVATE_KEY" \
        -secret "$ENCRYPTION_SECRET" \
        -outputFile /output/constr.key 2>&1 | while IFS= read -r line; do
            if [[ $line == *"Address:"* ]]; then
                echo -e "${GREEN}$line${NC}"
                # Extract just the address value
                ADDRESS_VALUE=$(echo "$line" | sed 's/.*Address: *//')
                echo "$ADDRESS_VALUE" > "$TEMP_DIR/address.txt"
            elif [[ $line == *"Public key:"* ]]; then
                echo -e "${GREEN}$line${NC}"
            else
                echo "$line"
            fi
        done; then
        rm -rf "$TEMP_DIR"
        print_error "Key generation failed"
    fi

    # Retrieve generated address
    if [ -f "$TEMP_DIR/address.txt" ]; then
        ADDRESS=$(cat "$TEMP_DIR/address.txt")
    else
        print_warning "Address file not found, continuing..."
    fi

    if [ -z "$ADDRESS" ]; then
        rm -rf "$TEMP_DIR"
        print_error "Failed to get address from keygen"
    fi

    # Extract last 6 characters of address for build ID
    ADDRESS_CLEAN="${ADDRESS#0x}"
    # Validate address format
    if [ ${#ADDRESS_CLEAN} -lt 6 ]; then
        rm -rf "$TEMP_DIR"
        print_error "Invalid address format: $ADDRESS"
    fi
    BUILD_ID="${ADDRESS_CLEAN: -6}"
    BUILD_ID=$(echo "$BUILD_ID" | tr '[:upper:]' '[:lower:]')

    print_success "Whitebox keys generated"

    # Step 6: Create build directory with address-based name
    echo ""
    echo -e "${BLUE}Step 6: Creating Build Environment${NC}"
    echo "────────────────────────────────"

    BUILD_DIR="build/attestor_${BUILD_ID}"

    print_info "Creating build directory: attestor_${BUILD_ID}"
    mkdir -p "$BUILD_DIR"

    # Transfer generated key to build directory
    if [ ! -f "$TEMP_DIR/constr.key" ]; then
        print_error "Key file not generated"
    fi
    mv "$TEMP_DIR/constr.key" "$BUILD_DIR/"
    echo "Address: $ADDRESS" > "$BUILD_DIR/address.txt"
    rm -rf "$TEMP_DIR"
    trap - EXIT

    # Create config.json
    print_info "Generating configuration..."
    create_config "$ENCRYPTION_SECRET" "$SECRETS_JSON" "$BUILD_DIR/config.json"
    print_success "Configuration created"

    # Create Dockerfile
    print_info "Creating Dockerfile..."
    create_dockerfile "$BUILD_DIR/Dockerfile"

    # Step 7: Build Docker image
    echo ""
    echo -e "${BLUE}Step 7: Building Docker Image${NC}"
    echo "────────────────────────────"

    IMAGE_NAME="$REGISTRY/$ORG_NAME/attestor-$SAFE_NAME"
    IMAGE_TAG="${IMAGE_TAG:-latest}"
    FULL_IMAGE="$IMAGE_NAME:$IMAGE_TAG"

    print_info "Building image: $FULL_IMAGE"

    # Navigate to build directory for Docker operations
    cd "$BUILD_DIR" || print_error "Failed to change to build directory"

    # Initialize buildx builder for multi-architecture support
    if ! docker buildx ls | grep -q attestor-builder; then
        if ! docker buildx create --name attestor-builder --use 2>/dev/null; then
            print_warning "Could not create custom builder, using default"
            docker buildx use default 2>/dev/null || true
        fi
    else
        docker buildx use attestor-builder 2>/dev/null || true
    fi

    # Build and push multi-architecture image
    print_info "Building multi-architecture image (linux/amd64, linux/arm64)..."
    if ! docker buildx build \
        --platform linux/amd64,linux/arm64 \
        -t "$FULL_IMAGE" \
        --push \
        . 2>&1 | while read line; do
            echo "  $line"
        done; then
        cd - > /dev/null 2>&1 || true
        print_error "Failed to build and push Docker image.

Possible causes:
        • Not logged in to registry: docker login $REGISTRY
        • No push permissions for $REGISTRY/$ORG_NAME
        • Network connectivity issues
        • Invalid Dockerfile or build context"
    fi

    cd - > /dev/null 2>&1 || true

    print_success "Docker image built and pushed"

    # Step 8: Extract attestor.so files for both architectures
    echo ""
    echo -e "${BLUE}Step 8: Extracting Attestor Libraries${NC}"
    echo "────────────────────────────"

    # Extract attestor library for linux/amd64 architecture
    print_info "Extracting attestor.so for linux/amd64..."
    CONTAINER_ID_AMD64=$(docker create --platform linux/amd64 "$FULL_IMAGE" 2>/dev/null)
    if [ -n "$CONTAINER_ID_AMD64" ]; then
        if docker cp "$CONTAINER_ID_AMD64:/attestor.so" "$BUILD_DIR/attestor_amd64.so" 2>/dev/null; then
            docker rm "$CONTAINER_ID_AMD64" > /dev/null
            SIZE_AMD64=$(ls -lh "$BUILD_DIR/attestor_amd64.so" 2>/dev/null | awk '{print $5}')
            print_success "Extracted attestor_amd64.so (${SIZE_AMD64:-unknown size})"
        else
            docker rm "$CONTAINER_ID_AMD64" > /dev/null
            print_warning "Failed to extract attestor_amd64.so - this architecture may not be supported"
        fi
    else
        print_warning "Could not create container for linux/amd64"
    fi

    # Extract attestor library for linux/arm64 architecture
    print_info "Extracting attestor.so for linux/arm64..."
    CONTAINER_ID_ARM64=$(docker create --platform linux/arm64 "$FULL_IMAGE" 2>/dev/null)
    if [ -n "$CONTAINER_ID_ARM64" ]; then
        if docker cp "$CONTAINER_ID_ARM64:/attestor.so" "$BUILD_DIR/attestor_arm64.so" 2>/dev/null; then
            docker rm "$CONTAINER_ID_ARM64" > /dev/null
            SIZE_ARM64=$(ls -lh "$BUILD_DIR/attestor_arm64.so" 2>/dev/null | awk '{print $5}')
            print_success "Extracted attestor_arm64.so (${SIZE_ARM64:-unknown size})"
        else
            docker rm "$CONTAINER_ID_ARM64" > /dev/null
            print_warning "Failed to extract attestor_arm64.so - this architecture may not be supported"
        fi
    else
        print_warning "Could not create container for linux/arm64"
    fi

    # Validate library extraction results
    if [ ! -f "$BUILD_DIR/attestor_amd64.so" ] && [ ! -f "$BUILD_DIR/attestor_arm64.so" ]; then
        print_warning "No attestor libraries were extracted. You can still use the Docker image."
    fi

    # Step 9: Create helper scripts
    echo ""
    echo -e "${BLUE}Step 9: Creating Helper Scripts${NC}"
    echo "────────────────────────────"

    # Generate rebuild helper script
    cat > "$BUILD_DIR/rebuild.sh" <<EOF
#!/bin/bash
# Rebuild the attestor image

set -euo pipefail

cd "\$(dirname "\$0")" || exit 1

if ! docker buildx build \\
    --platform linux/amd64,linux/arm64 \\
    -t $FULL_IMAGE \\
    --push \\
    .; then
    echo "❌ Failed to rebuild attestor"
    exit 1
fi

echo "✅ Attestor rebuilt: $FULL_IMAGE"
EOF
    chmod +x "$BUILD_DIR/rebuild.sh" || print_warning "Could not set executable permission on rebuild.sh"

    print_success "Helper scripts created"

    # Step 10: Generate documentation
    cat > "$BUILD_DIR/README.md" <<EOF
# KRNL Attestor for $PROJECT_NAME

## Build Information
- **Build ID**: $BUILD_ID (last 6 chars of address)
- **Address**: $ADDRESS
- **Docker Image**: $FULL_IMAGE
- **Created**: $(date)

## Generated Files
- \`config.json\` - Attestor configuration with executor definitions
- \`constr.key\` - Whitebox encrypted private key (DO NOT SHARE)
- \`Dockerfile\` - Multi-stage Docker build configuration
- \`attestor_amd64.so\` - Attestor C-shared library (linux/amd64)
- \`attestor_arm64.so\` - Attestor C-shared library (linux/arm64)
- \`rebuild.sh\` - Helper script to rebuild and push image
- \`address.txt\` - Ethereum address derived from private key

## Secrets Configured
$(if [ "$SECRETS_JSON" != "{}" ]; then
    if command -v jq &> /dev/null; then
        echo "$SECRETS_JSON" | jq -r 'keys[] | "- " + .' 2>/dev/null || echo "- Unable to parse secrets"
    else
        echo "- Secrets configured (jq not available for listing)"
    fi
else
    echo "No secrets configured"
fi)

## Usage

### Pull the image
\`\`\`bash
docker pull $FULL_IMAGE
\`\`\`

### Rebuild
\`\`\`bash
./rebuild.sh
\`\`\`

## Security Considerations
- **Encryption Secret**: Store securely, required for key updates
- **Private Key**: Encrypted using whitebox cryptography in constr.key
- **Version Control**: Never commit constr.key or private keys
- **Image Security**: Public images contain encrypted keys only
- **Access Control**: Ensure proper registry permissions for your organization
EOF

    # Step 11: Display completion summary
    echo ""
    echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}           Attestor Created Successfully! 🎉            ${NC}"
    echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "Project: $PROJECT_NAME"
    echo "Build ID: $BUILD_ID (from address: $ADDRESS)"
    echo "Docker Image: $FULL_IMAGE"
    echo ""
    echo "Address: $ADDRESS"
    echo ""
    if [ "$SECRETS_JSON" != "{}" ]; then
        echo "Secrets configured:"
        if command -v jq &> /dev/null; then
            echo "$SECRETS_JSON" | jq -r 'keys[] | "  • " + .' 2>/dev/null || echo "  • Unable to display secrets"
        else
            echo "  • Secrets stored successfully"
        fi
        echo ""
    fi
    echo "Build Directory: $(pwd)/$BUILD_DIR"
    echo ""
    echo "Extracted Libraries:"
    if [ -f "$BUILD_DIR/attestor_amd64.so" ]; then
        echo "  • attestor_amd64.so - linux/amd64"
    fi
    if [ -f "$BUILD_DIR/attestor_arm64.so" ]; then
        echo "  • attestor_arm64.so - linux/arm64"
    fi
    echo ""
    echo "Next Steps:"
    echo "1. Your attestor image has been pushed to: $FULL_IMAGE"
    echo "2. Use the extracted .so files in your applications"
    echo "3. Use this image in your deployments"
    echo ""
    print_info "Build artifacts saved in: $BUILD_DIR"
    print_warning "IMPORTANT: Save your encryption secret securely - required for future updates!"
}

# Process command-line arguments
if [ $# -gt 0 ]; then
    case "$1" in
        -h|--help)
            show_usage
            exit 0
            ;;
        -v|--version)
            show_version
            exit 0
            ;;
        --example)
            show_example
            # Continue to main after showing example
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use -h or --help for usage information"
            exit 1
            ;;
    esac
fi

# Execute main process
main "$@"