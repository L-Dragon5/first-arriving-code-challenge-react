# Code Challenge for First Arriving

Code challenge as a front-end developer.
Tasked to create a basic, web-based digital dashboard that displays the weather forecast for the following day at the First Arriving office using the National Weather Service API.
The forecast needed to be refreshed automatically once every 10 minutes.

Although the task said to just use the First Arriving Office location, I took it a step further and gave an input so any address within the US could be used. This was accomplished by using the geocoding API available by the US Census Bureau. This caused some issues due to CORS policy, so I had to actually make a small NodeJS backend to consume their API and return it to the front-end.

So I guess shows both my front and back end skills.

Dependencies used:
- ReactJS
- ChakraUI (component UI library)
- Axios (HTTP Request library)
- Luxon (DateTime library)

## How to run
Make sure you have NodeJS installed. I was using the latest LTS version (v16.13.1).

Go into the root directory and run `npm install`.
Go into the `backend` directory and run `npm install`.
Open a terminal in the `backend` directory and run `node app`. This will start the small backend server.

Go back to the root directory and run `npm run start`, it should open the project in your browser where you can then interact with it.
