FROM alpine:latest

ARG keyfile
ENV FIREBASE_KEYFILE_CONTENTS=$keyfile
ENV FIREBASE_KEYFILE .keyfile.json

# Setup Bot directory
WORKDIR /usr/src/bot

# Copy Aquarius
COPY . .

# Install Bot
RUN apk add --update --no-cache \
  curl \
  libressl \
  ca-certificates \
  build-base \
  python \
  nodejs-current \
  yarn \
  && yarn install \
  && yarn run build

# Open the Dashboard
EXPOSE 3000

CMD [ "curl", "-v", "https://discordapp.com/api/gateway"]
# Let's run it!
# CMD [ "yarn", "start" ]
