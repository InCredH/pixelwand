const express = require("express");
const app = express();
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const router = express.Router();
const mongoose = require("mongoose");

// Constants
const {
  HOST,
  PORT,
  SESS_SECRET,
  NODE_ENV,
  IS_PROD,
  COOKIE_NAME,
} = require("./config/config");
const { MongoURI } = require("./config/database");
const MAX_AGE = 1000 * 60 * 60 * 3; // Three hours

// Connecting to Database
mongoose
  .connect(MongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected..."))
  .catch((err) => console.log(err));

// setting up connect-mongodb-session store
const mongoDBstore = new MongoDBStore({
  uri: MongoURI,
  collection: "mySessions",
});



// Express Bodyparser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Express-Session
app.use(
  session({
    name: COOKIE_NAME, //name to be put in "key" field in postman etc
    secret: SESS_SECRET,
    resave: true,
    saveUninitialized: false,
    store: mongoDBstore,
    cookie: {
      maxAge: MAX_AGE,
      sameSite: false,
      secure: IS_PROD,
    },
  })
);

app.use("/api/users", require("./routes/users"));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => console.log(`Server started on http://${HOST}:${PORT}`));

// const express = require("express");
// const bodyParser = require("body-parser");
// const mongoose = require("mongoose");

// //configuring dotenv to access the .env file
// require("dotenv").config();

// const app = express();

// //using body-parser to parse json data
// app.use(bodyParser.json());

// //connecting to mongodb
// const connectionParams = {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// };

// try {
//   mongoose.connect(process.env.MONGO_URI, connectionParams);
//   console.log("Connected to Database Sucessfully");
// } catch (error) {
//   console.log("Error connecting");
//   console.log("Could not connect to database");
// }

// //listen to port 8000
// app.listen(process.env.PORT, () => {
//   console.log("listening for requests on port", process.env.PORT);
// });
