FROM node:14.9

# Setup Bot directory
WORKDIR /usr/src/bot

# Install Bot
RUN npx lerna bootstrap --hoist

# Create Prisma Engine
RUN npx prisma generate

# Copy Aquarius
COPY . .

# Open the API
EXPOSE 3000

# Let's run it!
CMD [ "npm", "start" ]
