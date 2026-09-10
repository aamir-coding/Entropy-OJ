#!/bin/bash
# ============================================================
#  Entropy Online Judge — Azure / Cloud VM Setup
#
#  Target: Ubuntu 22.04 / 24.04 on any x86_64 or ARM64 VM
#  Tested on: Azure B1s (1 vCPU, 1GB RAM), Oracle A1.Flex
#  Provisions: Docker Engine, Node.js 22, Git, UFW Firewall
#
#  Usage: ssh into your VM, then:
#    chmod +x setup-vm.sh
#    sudo ./setup-vm.sh
#
#  After running this script, you still need to:
#    1. Clone the repo
#    2. Create the .env file for docker-compose.prod.yml
#    3. Build the entropy-runner image
#    4. Start docker-compose.prod.yml
#    5. Configure cloud firewall / NSG rules
# ============================================================

set -euo pipefail

# Detect the default non-root user (azure uses 'azureuser', oracle uses 'ubuntu')
DEFAULT_USER="${SUDO_USER:-$(logname 2>/dev/null || echo 'azureuser')}"

echo "====================================================="
echo "🔧 Entropy OJ — Cloud VM Provisioning"
echo "   Detected user: $DEFAULT_USER"
echo "====================================================="

# ---- 1. System Update ----
echo "[1/7] Updating system packages..."
apt-get update -y && apt-get upgrade -y

# ---- 2. Install Essential Tools ----
echo "[2/7] Installing essential tools..."
apt-get install -y \
    curl \
    wget \
    git \
    unzip \
    htop \
    ufw \
    ca-certificates \
    gnupg \
    lsb-release \
    software-properties-common

# ---- 3. Install Docker Engine ----
echo "[3/7] Installing Docker Engine..."
# Remove any old Docker packages
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do
    apt-get remove -y "$pkg" 2>/dev/null || true
done

# Add Docker's official GPG key
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Enable and start Docker
systemctl enable docker
systemctl start docker

# Add the default user to the docker group
usermod -aG docker "$DEFAULT_USER"

echo "  ✅ Docker $(docker --version | awk '{print $3}') installed"

# ---- 4. Install Node.js 22 LTS ----
echo "[4/7] Installing Node.js 22 LTS..."
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs

echo "  ✅ Node.js $(node --version) installed"
echo "  ✅ npm $(npm --version) installed"

# ---- 5. Create Application Directory ----
echo "[5/7] Creating application directory..."
mkdir -p /opt/entropy-oj
chown "$DEFAULT_USER":"$DEFAULT_USER" /opt/entropy-oj

# Create workspace directory for Docker sandbox I/O
mkdir -p /tmp/workspaces
chmod 777 /tmp/workspaces

# ---- 6. Configure UFW Firewall ----
echo "[6/7] Configuring UFW firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing

# SSH (always needed)
ufw allow 22/tcp

# Redis — IMPORTANT: restrict to Render's egress IPs in production!
# For initial setup, we allow from anywhere; tighten this after deployment.
ufw allow 6379/tcp comment "Redis (tighten to Render IPs after deploy)"

# Worker health check (optional, for external monitoring)
ufw allow 5001/tcp comment "Worker health probe"

ufw --force enable

echo "  ✅ UFW firewall configured"
echo "  ⚠️  Remember to restrict port 6379 to Render's egress IPs after deployment!"

# ---- 7. Configure System Limits for Docker + Redis ----
echo "[7/7] Configuring system limits..."

# Increase file descriptor limits for Redis and Docker
if ! grep -q "Entropy OJ" /etc/security/limits.conf 2>/dev/null; then
  cat >> /etc/security/limits.conf << 'EOF'
# Entropy OJ — production limits
*    soft    nofile    65535
*    hard    nofile    65535
root soft    nofile    65535
root hard    nofile    65535
EOF
fi

# Set vm.overcommit_memory for Redis (recommended by Redis docs)
if ! grep -q "vm.overcommit_memory" /etc/sysctl.conf 2>/dev/null; then
  echo "vm.overcommit_memory = 1" >> /etc/sysctl.conf
fi
sysctl -p

echo ""
echo "====================================================="
echo "✅ VM provisioning complete!"
echo "====================================================="
echo ""
echo "Next steps (run as '$DEFAULT_USER' user, not root):"
echo ""
echo "  1. Log out and log back in (to pick up docker group)"
echo ""
echo "  2. Clone your repository:"
echo "     cd /opt/entropy-oj"
echo "     git clone https://github.com/aamir-coding/Entropy-OJ.git ."
echo ""
echo "  3. Build the sandbox runner image:"
echo "     docker build -t entropy-runner:latest \\"
echo "       -f apps/worker/docker/Dockerfile.runner \\"
echo "       apps/worker/docker"
echo ""
echo "  4. Create the .env file:"
echo "     cp .env.oracle-vm.example .env"
echo "     nano .env  # Fill in MONGO_URI and REDIS_PASSWORD"
echo ""
echo "  5. Start the production stack:"
echo "     docker compose -f docker-compose.prod.yml up -d"
echo ""
echo "  6. Verify:"
echo "     docker compose -f docker-compose.prod.yml logs -f"
echo "     curl http://localhost:5001/health"
echo ""
echo "  7. IMPORTANT — Tighten Redis firewall:"
echo "     sudo ufw delete allow 6379/tcp"
echo "     sudo ufw allow from <RENDER_EGRESS_IP> to any port 6379 proto tcp"
echo ""
