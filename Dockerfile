FROM node:12

ARG keyfile
ENV FIREBASE_KEYFILE_CONTENTS=$keyfile
ENV FIREBASE_KEYFILE .keyfile.json

# Setup Bot directory
WORKDIR /usr/src/bot

# Copy Aquarius
COPY . .

# Install Bot
# RUN apk add --update --no-cache \
#   libressl \
#   ca-certificates \
#   build-base \
#   python \
#   nodejs-current \
#   yarn \
#   && yarn install \
#   && yarn run build
RUN apt-get update \
  && apt-get install python \
  && yarn install \
  && yarn run build

# Open the Dashboard
EXPOSE 3000

# Let's run it!
CMD [ "yarn", "start" ]
