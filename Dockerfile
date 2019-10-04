FROM alpine:latest

ENV FIREBASE_KEYFILE .keyfile.json
ENV FIREBASE_KEYFILE_CONTENTS blank

# Setup Bot directory
WORKDIR /usr/src/bot

# Copy Aquarius
COPY . .

# Install Bot
RUN apk add --update --no-cache \
  build-base \
  python \
  nodejs-current \
  yarn \
  && yarn install \
  && yarn run build

# Let's run it!
CMD [ "yarn", "start" ]
