FROM node:14.9

# Setup Bot directory
WORKDIR /usr/src/bot

# Copy Aquarius
COPY . .

# Install Bot
RUN npx lerna bootstrap --hoist

# Open the API
EXPOSE 3000

# Let's run it!
CMD [ "npm", "start" ]
