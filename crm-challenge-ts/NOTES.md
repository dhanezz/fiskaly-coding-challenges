## Notes on the Challenge

### Known Issues
- Frontend formData hmtl sanitation should be implemented
- If tss_id should be unique and implemented, it should actually be considered to set it as primary key and unique and generate the uuid through psql


### 🐛 Bugs & Obersvation
- ```sh setup.sh``` - only worked for me (windows) if psql comman is wrapped like ```sh -c "psql -U ...."```
- version for docker-compose.yml is now **deprecated** since it's using the latest version
- backend/Dockerfile - commented out ```ENV=production```, else it won't be able to use ts-node-dev which is needed since the file triggers ```npm run dev``` below and that will need the devDependencies
- frontend/config.js won't use other values saved in .env, is there a reason for trying to use it with react?
- helloWorld.js was calling the api everytime the components rendered

### ✅ Fixed Issues
- [x] Fixed backends dockerfile, since it was not matching with the package.json
- [x] Fixed helloWorld.js to only call api at initial render.