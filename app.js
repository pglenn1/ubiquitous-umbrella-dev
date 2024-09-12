require('dotenv').config();
const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const path = require('path');

const app = express();
const uri = process.env.MONGO_URI;

// Set up MongoDB client
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB once and reuse the connection
async function connectToMongo() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Connected to MongoDB!");
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1); // Exit the application if there's an error connecting to MongoDB
  }
}

// Connect to MongoDB when the server starts
connectToMongo();

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route for EJS rendering
app.get('/ejs', async (req, res) => {
  try {
    const result = await client.db("alex's-db").collection("whatever-collection").find({}).toArray();
    console.log(result);
    res.render('index', { ejsResult: result });
  } catch (error) {
    console.error('Error fetching data from MongoDB:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});