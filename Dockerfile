FROM node:13.7

ARG keyfile

# Setup Bot directory
WORKDIR /usr/src/bot

# Copy Aquarius
COPY . .

# Install Bot
RUN npx lerna bootstrap --hoist

# Install Keyfile
RUN npm run build

# Open the API
EXPOSE 3000

# Let's run it!
CMD [ "npm", "start" ]
