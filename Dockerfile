FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Generate Prisma client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source
COPY . .

# Create logs directory
RUN mkdir -p logs

EXPOSE 4000

CMD ["npm", "start"]
