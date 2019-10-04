FROM alpine:latest

# Setup Bot directory
WORKDIR /usr/src/bot

# Copy Aquarius
COPY . .

# Install Bot
RUN apk add --update --no-cache \
  make \
  python \
  nodejs-current \
  yarn \
  && yarn install \
  && yarn run build

# Let's run it!
CMD [ "yarn", "start" ]
