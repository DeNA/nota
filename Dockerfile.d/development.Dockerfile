FROM node:10.16.0-stretch@sha256:5f2e8ae1cda95e68b99475218786cf0f62ef8f368b4c6821518ac805438cc0fc

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
