const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const userSchema = require('./schemas/userSchema');
const userResolvers = require('./resolvers/userResolver');
const employeeSchema = require('./schemas/employeeSchema');
const employeeResolver = require('./resolvers/employeeResolver');

require('dotenv').config();

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));

const app = express();

// Middleware
app.use(express.json());

// Setup Apollo GraphQL Server
const server = new ApolloServer({
    typeDefs: [userSchema, employeeSchema],
    resolvers: [userResolvers, employeeResolver],
    context: ({ req }) => ({ req })
});

// Start Apollo Server
async function startApolloServer() {
    await server.start();
    server.applyMiddleware({ app });

    app.listen(4000, () => {
        console.log(`Server running at http://localhost:4000${server.graphqlPath}`);
    });
}

startApolloServer();
