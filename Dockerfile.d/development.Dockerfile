FROM node:14-stretch@sha256:b19c3c12733345aed5c0d7a2d38c6beed69609293f97ec55a18e4934fe582777

# Avoid warnings by switching to noninteractive
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
    && apt-get install --assume-yes --no-install-recommends apt-utils git procps lsb-release \
    && npm install pm2 -g \
    && : "Clean up" \
    && apt-get autoremove --assume-yes \
    && apt-get clean --assume-yes \
    && rm -rf /var/lib/apt/lists/*

# Switch back to dialog for any ad-hoc use of apt-get
ENV DEBIAN_FRONTEND=dialog
