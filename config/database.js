const { DB_USERNAME,DB_PASSWORD,DB_CLUSTER } = require("./config");

module.exports = {
  MongoURI: `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@${DB_CLUSTER}.meavr5u.mongodb.net/`
};