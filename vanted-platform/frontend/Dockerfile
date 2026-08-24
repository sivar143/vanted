FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:1.29-alpine
COPY --from=build /app/dist/vanted-frontend/browser /usr/share/nginx/html
EXPOSE 80
