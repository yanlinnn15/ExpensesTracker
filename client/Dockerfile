FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

EXPOSE 5173

# --host 0.0.0.0 is required so Vite listens on all interfaces, not just 127.0.0.1
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
