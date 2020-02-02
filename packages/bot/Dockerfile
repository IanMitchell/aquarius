FROM node:12

ARG keyfile
ENV FIREBASE_KEYFILE_CONTENTS=$keyfile
ENV FIREBASE_KEYFILE .keyfile.json

# Setup Bot directory
WORKDIR /usr/src/bot

# Copy Aquarius
COPY . .

# Install Bot
RUN yarn install

# Install Keyfile
RUN yarn run build

# Open the Dashboard
EXPOSE 3000

# Let's run it!
CMD [ "yarn", "start" ]
