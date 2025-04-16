## Notes on the Challenge

### Known Issues
- Frontend form validation should be implemented
- Frontend formData sanitation should be implemented


### 🐛 Bugs & Obersvation
- ```sh setup.sh``` - only worked for me (windows) if psql comman is wrapped like ```sh -c "psql -U ...."```
- the version for docker-compose.yml is now *deprecated* since it's using the latest version
- backend/Dockerfile - commented out ```ENV=production```, since else it won't be able to use ts-node-dev which is needed since the file triggers ```npm run dev``` below and that will need the devDependencies
- frontend/config.js won't use other values saved in .env, is there a reason for trying to use it with react?
- helloWorld.js was calling the api everytime the components rendered

### ✅ Fixed Issues
- [x] Fixed backends dockerfile, since it was not matching with the package.json
- [x] Fixed helloWorld.js to only call api at initial render.