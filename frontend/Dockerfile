# --- Build Stage ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (using legacy-peer-deps if needed, but next15 usually fine)
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Set build-time env variables for static optimization
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build the application
RUN npm run build

# --- Production Stage ---
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

# Copy only necessary files
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
ENV NEXT_TELEMETRY_DISABLED 1

EXPOSE 3000

CMD ["npm", "run", "start"]
