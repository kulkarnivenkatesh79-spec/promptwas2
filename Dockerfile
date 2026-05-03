# Use a lightweight Node image for building
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Use Nginx to serve the static content
FROM nginx:alpine
# Copy the custom nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy the build output to the nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
