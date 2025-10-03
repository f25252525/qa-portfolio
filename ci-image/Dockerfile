# Slim, but with everything your pipeline needs
FROM debian:bookworm

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y \
  curl gnupg2 ca-certificates lsb-release apt-transport-https software-properties-common \
  git python3 python3-pip python3-venv \
  openjdk-17-jdk maven unzip \
  # Playwright/browser deps
  libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 libcups2 libxkbcommon0 \
  libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libgtk-3-0 \
  libasound2 libxshmfence1 libdrm2 libpango1.0-0 libfontconfig1 libx11-xcb1 \
  # Docker CLI (we'll mount host socket)
  docker.io \
  && rm -rf /var/lib/apt/lists/*

# Node 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
 && apt-get update && apt-get install -y nodejs && rm -rf /var/lib/apt/lists/*

# k6
RUN curl -sS https://dl.k6.io/key.gpg | gpg --dearmor > /usr/share/keyrings/k6-archive-keyring.gpg \
 && echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" > /etc/apt/sources.list.d/k6.list \
 && apt-get update && apt-get install -y k6 && rm -rf /var/lib/apt/lists/*

# Newman + Playwright installers available via npm
RUN npm i -g newman newman-reporter-htmlextra

# Optional: create a non-root user jenkins (uid 1000) to run steps
RUN useradd -ms /bin/bash jenkins -u 1000
USER jenkins
WORKDIR /workspace

# Let pipeline run "npx playwright install" in job, not here (faster rebuilds)
