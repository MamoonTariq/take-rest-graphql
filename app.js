const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const bcrypt = require("bcryptjs");

const Event = require("./models/event");
const User = require("./models/user");

const app = express();

app.use(bodyParser.json());

const events = [];
app.use(
  "/graphql",
  graphqlHTTP({
    schema: buildSchema(`
        
        type Event {
            _id: ID!
            title: String!
            desc: String!
            price: Float!
            date: String!
        }

        type User {
          _id: ID!
          email: String!
          password: String
        }

        input EventInput {
            title: String!
            desc: String!
            price: Float!
            date: String!
        }

        input UserInput {
          email: String!
          password: String! 
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput):Event
            createUser(userInput: UserInput): User
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
   `),
    rootValue: {
      events: () => {
        return Event.find()
          .then((events) => {
            console.log(events);
            return events.map((event) => {
              return { ...event._doc };
            });
          })
          .catch((error) => {
            console.log(error);
            throw error;
          });
      },
      createEvent: (args) => {
        const event = new Event({
          title: args.eventInput.title,
          desc: args.eventInput.desc,
          price: +args.eventInput.price,
          date: new Date(args.eventInput.date),
          creator: "621fc78d970c93a6a75e4291",
        });
        return event
          .save()
          .then((result) => {
            return User.findById("621fc78d970c93a6a75e4291");
            console.log(result);
            return { ...result._doc };
          })
          .catch((error) => {
            console.log(error);
            throw error;
          });
      },
      createUser: (args) => {
        console.log(args);
        return bcrypt
          .hash(args.userInput.password, 12)
          .then((hashPassword) => {
            const user = new User({
              email: args.userInput.email,
              password: hashPassword,
            });
            return user
              .save()
              .then((result) => {
                return {
                  ...result._doc,
                  _id: result.id,
                };
              })
              .catch((error) => {
                console.log(error, "user failed error");
                throw error;
              });
          })
          .catch((err) => {
            console.log(err, "bcrypt");
            throw err;
          });
      },
    },
    graphiql: true,
  })
);

mongoose
  .connect(
    "mongodb+srv://root:1Dch0At6m5AQ8wJU@et.ok63x.mongodb.net/graphql?retryWrites=true&w=majority"
  )
  .then((res) => {
    // console.log(res);
    app.listen(3000);
    console.log("app started");
  })
  .catch((error) => {
    console.log(error);
  });
