# 1️⃣ Use Node.js 20 (slim version) for smaller image size
FROM node:20-slim AS builder

# 2️⃣ Set the working directory inside the container
WORKDIR /app

# 3️⃣ Copy only package.json and package-lock.json first for better caching
COPY package*.json ./

# 4️⃣ Install dependencies (only production dependencies for a smaller image)
RUN npm install --omit=dev

# 5️⃣ Copy the rest of the application code
COPY . .

# 6️⃣ Build the Next.js application
RUN npm run build

# 7️⃣ Use a lightweight Node.js 20 runtime image for production
FROM node:20-slim

# 8️⃣ Set the working directory
WORKDIR /app

# 9️⃣ Copy only necessary files from the builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# 🔟 Set environment to production
ENV NODE_ENV=production

# 1️⃣1️⃣ Expose the port Next.js runs on
EXPOSE 3000

# 1️⃣2️⃣ Use a proper production start command
CMD ["npm", "run", "start"]
