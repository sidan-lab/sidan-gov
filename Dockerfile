FROM --platform=linux/amd64 node:20 as base

# Working Dir
WORKDIR /base

# Copy Package Json
COPY package.json package-lock.json ./

# Install Files
RUN npm install

# Compile typescript
RUN npm install -D typescript

# Copy Source Files
COPY . .

RUN npm run build:backend

## Runner
FROM --platform=linux/amd64 node:20 as runner

WORKDIR /app

COPY --from=base /base/backend/ ./backend/
COPY --from=base /base/node_modules ./node_modules
COPY --from=base /base/package.json ./

EXPOSE 50051

# CMD ["node", "./backend/grpc/dist/index.js"]
