const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../index"); // Import your Express app
const Session = require('../models/Sessions'); // Import your Session model

chai.use(chaiHttp);
const expect = chai.expect;

describe("User Registration", () => {
  it("should register a new user", (done) => {
    chai
      .request(app)
      .post("/api/users/register")
      .send({ name: "testuser", email:"test@gmail.com", password: "Password1" })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("msg", "Successfully Registered");
        done();
      });
  });
});

describe("User Login", () => {
  it("should log in a registered user", (done) => {
    chai
      .request(app)
      .post("/api/users/login")
      .send({ email: "test@gmail.com", password: "Password1" })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("msg", "Logged In Successfully");
        done();
      });
  });
});

describe('Logout Endpoint', () => {
  it('should log out a user session by sessionId', (done) => {
    // Create a new session and store its token
    const newSession = new Session({ token: 'testsessiontoken' });
    newSession.save()
      .then(() => {
        chai
          .request(app)
          .delete('/api/users/logout/testsessiontoken') // Use the token you just created
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.have.property('msg', 'Logged Out Successfully');

            // Check that the session is deleted from the database
            Session.findOne({ token: 'testsessiontoken' })
              .then((session) => {
                expect(session).to.be.null; // Expect the session to be null
                done();
              })
              .catch((err) => done(err));
          });
      })
      .catch((err) => done(err));
  });

  it('should handle logout for a non-existent session', (done) => {
    chai
      .request(app)
      .delete('/api/users/logout/nonexistenttoken') // Use a token that does not exist
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.have.property('msg', 'Session does not exist');
        done();
      });
  });
});
