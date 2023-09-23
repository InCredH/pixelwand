API endpoints:

/api/users/register
This endpoint is used to register a user. You have to pass name, email and password in JSON format

/api/users/login
This endpoint is used to login a user. You have to pass the email and password in JSON format
It returs a session ID

/api/users/protectedRoute
This endpoint is used to check if a user is authorized to access the endpoint using the session Id generated 

/api/users/logout/:sessionId
This endpoint is used to logout a particular user's session

How to setup and run the the application:
Clone the repository and run the command npm install in the root directory.
1. Create a .env file according to the .env.example
2. That's IT! Just run npm run and your application is up and running