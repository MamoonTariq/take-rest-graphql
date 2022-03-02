const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");

const Event = require("./models/event");

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

        input EventInput {
            title: String!
            desc: String!
            price: Float!
            date: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput):Event
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
        });
        return event
          .save()
          .then((result) => {
            console.log(result);
            return { ...result._doc };
          })
          .catch((error) => {
            console.log(error);
            throw error;
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
