FROM node:20-alpine

WORKDIR /app

# Copy package.json và package-lock.json trước để tận dụng cache
COPY package.json package-lock.json* ./

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ source code
COPY . .

# Expose cổng 5173
EXPOSE 5173

# Chạy Vite dev server và expose ra mạng nội bộ
CMD ["npm", "run", "dev"]
