FROM node:latest as build-stage

ARG proxy


WORKDIR /app
COPY package*.json ./

# Proxy configuration
#RUN npm config set proxy $proxy
#RUN npm config set https-proxy $proxy

RUN npm install
COPY ./ .
RUN npm run build

FROM nginx as production-stage
RUN mkdir /app
COPY --from=build-stage /app/dist /app
COPY nginx.conf /etc/nginx/nginx.conf
