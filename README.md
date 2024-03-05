# Fillout API Server 

## Technologies
TypeScript, Node and Express

## Install dependencies 
`npm i` 

## Build 
`npm run build` compiles your TypeScript files to JavaScript in the build directory.

## Run the complied server 

`npm start` runs the compiled server from the build directory.

## Run in development environment 
`npm run dev` runs your server in development mode using ts-node

## Test API endpoint 
`http://localhost:3000/cLZojxk94ous/filteredResponses?filters=[{"id":"bE2Bo4cGUv49cjnqZ4UnkW","condition":"equals","value":"Test"},{"id":"dSRAe3hygqVwTpPK69p5td","condition":"greater_than","value":"2024-02-23"}]`

use the URL in the Postman, you can change the filters' values based on the original response. 

Don't forget to use the Bearer Token in Postman. 

![image](https://github.com/ns2772/Fillout-API-Server/assets/58448072/4b5228c5-55fa-4e3c-8985-6cd91919749b)


The response is. 
![image](https://github.com/ns2772/Fillout-API-Server/assets/58448072/101e6803-ca9b-45aa-a202-29073f0f81c1)

