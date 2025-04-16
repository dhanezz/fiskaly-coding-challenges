#note: changed it to 15 so that it matches node defined in package.json
FROM node:15.13 

#note: commented out, explained in NOTES.md
#ENV NODE_ENV=production

WORKDIR /app
COPY . /app/
RUN npm install --save-dev

EXPOSE 3001/tcp

CMD ["npm", "run", "dev"]