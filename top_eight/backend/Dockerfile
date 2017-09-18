FROM node:6.7.0

# Install the npm packages which change infrequently
WORKDIR /top_eight/backend
COPY ./package.json ./
RUN npm install supervisor -g
RUN npm install

EXPOSE 8000
CMD ["./entrypoint.sh"]
