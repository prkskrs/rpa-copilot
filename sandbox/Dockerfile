FROM mcr.microsoft.com/playwright:v1.47.0-jammy

RUN apt-get update && apt-get install -y --no-install-recommends \
    xvfb fluxbox x11vnc novnc websockify jq curl unzip ca-certificates \
    && rm -rf /var/lib/apt/lists/*

USER pwuser
WORKDIR /home/pwuser/app

COPY --chown=pwuser:pwuser package.json yarn.lock ./
RUN yarn --frozen-lockfile || npm i

COPY --chown=pwuser:pwuser . .

EXPOSE 7007 7008 7900

CMD ["bash", "-lc", "\
  Xvfb :99 -screen 0 1280x800x24 & \
  export DISPLAY=:99 && fluxbox & \
  websockify --web=/usr/share/novnc 7900 localhost:5900 & \
  x11vnc -display :99 -nopw -shared -forever -rfbport 5900 & \
  node apps/agent/dist/index.js \
"]
