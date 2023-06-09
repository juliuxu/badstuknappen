# syntax = docker/dockerfile:1

ARG NODE_VERSION=18
FROM node:${NODE_VERSION}-slim as base

# Remix app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV=production


# Throw-away build stage to reduce size of final image
FROM base as build

# Install node modules
COPY --link package.json package-lock.json ./
RUN npm install --production=false

# Copy application code
COPY --link . .

# Build application
RUN npm run build

# Remove development dependencies
RUN npm prune --production


# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app /app

# Install playwright browser
RUN npx playwright install --with-deps chromium

# Ensure correct timezone
RUN apt update && apt install tzdata -y
ENV TZ="Europe/Oslo"

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD [ "npm", "run", "start" ]

# Build and push with
# docker buildx build --tag ghcr.io/juliuxu/badstuknappen --platform=linux/arm64,linux/amd64 . --push