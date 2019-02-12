FROM node:alpine

RUN echo '🐳 => Building Indenizou API...'

# Create app directory
WORKDIR /usr/src/app

# set our node environment, either development or production
# defaults to production, compose overrides this to development on build and run
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json yarn.lock* /usr/src/app/

RUN apk --no-cache add --virtual native-deps \
g++ gcc libgcc libstdc++ linux-headers make python && \
yarn global add --silent node-pre-gyp node-gyp -g &&\
yarn install --silent && \
apk del native-deps

# If you are building your code for production
# RUN npm install --only=production

ENV PATH /usr/src/app/node_modules/.bin:$PATH

# Bundle app source
COPY . /usr/src/app

ARG PORT=1800
ENV PORT $PORT
EXPOSE $PORT

CMD [ "npm", "start" ]
RUN echo '🐳 => Indenizou API built! ✅'
