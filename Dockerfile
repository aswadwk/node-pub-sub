# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

# RUN apk add --no-cache python3 make g++ 

COPY package*.json ./

RUN npm install && \
    npm install bcrypt

COPY . .

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/src ./src

EXPOSE 3003

CMD ["npm", "start"]
