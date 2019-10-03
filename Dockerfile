FROM alpine:latest

# Setup Bot directory
WORKDIR /usr/src/bot

# Copy Aquarius
COPY . .

# Install Bot
RUN apk add --update \
    apk add --no-cache nodejs-current
    apk add yarn \
    && yarn install \

# Build Dashboard
RUN cd web && next build

# Let's run it!
CMD [ "yarn", "start" ]
