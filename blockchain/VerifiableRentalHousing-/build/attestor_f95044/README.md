# KRNL Attestor for verifiablerentals

## Build Information
- **Build ID**: f95044 (last 6 chars of address)
- **Address**: 0x260396cCA54419D691836aC1661d9743FCF95044
- **Docker Image**: docker.io/th3jackal/attestor-verifiablerentals:latest
- **Created**: Thu Dec 18 02:25:51 PM EAT 2025

## Generated Files
- `config.json` - Attestor configuration with executor definitions
- `constr.key` - Whitebox encrypted private key (DO NOT SHARE)
- `Dockerfile` - Multi-stage Docker build configuration
- `attestor_amd64.so` - Attestor C-shared library (linux/amd64)
- `attestor_arm64.so` - Attestor C-shared library (linux/arm64)
- `rebuild.sh` - Helper script to rebuild and push image
- `address.txt` - Ethereum address derived from private key

## Secrets Configured
- Secrets configured (jq not available for listing)

## Usage

### Pull the image
```bash
docker pull docker.io/th3jackal/attestor-verifiablerentals:latest
```

### Rebuild
```bash
./rebuild.sh
```

## Security Considerations
- **Encryption Secret**: Store securely, required for key updates
- **Private Key**: Encrypted using whitebox cryptography in constr.key
- **Version Control**: Never commit constr.key or private keys
- **Image Security**: Public images contain encrypted keys only
- **Access Control**: Ensure proper registry permissions for your organization
