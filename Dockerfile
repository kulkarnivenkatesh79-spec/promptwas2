# Use a lightweight Nginx image to serve the monolithic HTML file
FROM nginx:alpine
# Copy the monolithic index.html to the Nginx serving directory
COPY index.html /usr/share/nginx/html/index.html
COPY env.js /usr/share/nginx/html/env.js
COPY sw.js /usr/share/nginx/html/sw.js
# Use custom Nginx config for port 8080, gzip, caching, and security headers
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
