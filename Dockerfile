FROM alpine:latest

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