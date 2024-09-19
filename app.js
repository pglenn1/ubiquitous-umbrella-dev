require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { ObjectId } = require('mongodb');
const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = `mongodb+srv://pglenn1:${process.env.MONGO_PWD}@atlascluster.3hzqz.mongodb.net/?retryWrites=true&w=majority&appName=AtlasCluster`;

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('./public/'));

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Connect to MongoDB once and reuse the connection
let db;

async function connectDB() {
  if (!db) {
    try {
      await client.connect();
      db = client.db("ubiquitous-umbrella");
      console.log("Connected to MongoDB!");
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
    }
  }
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/ejs', (req, res) => {
  res.render('index', {
    myServerVariable: "something from server"
  });
});

app.get('/read', async (req, res) => {
  console.log('in /read');
  try {
    await connectDB();
    const result = await db.collection("alex-ub-collection").find({}).toArray();
    console.log(result);
    res.render('mongo', {
      postData: result
    });
  } catch (error) {
    console.error("Error reading data from MongoDB:", error);
    res.status(500).send("Error reading data from MongoDB");
  }
});

app.get('/insert', async (req, res) => {
  console.log('in /insert');
  try {
    await connectDB();
    await db.collection("alex-ub-collection").insertOne({ post: 'hardcoded post insert ' });
    await db.collection("alex-ub-collection").insertOne({ iJustMadeThisUp: 'hardcoded new key ' });
    res.render('insert');
  } catch (error) {
    console.error("Error inserting data into MongoDB:", error);
    res.status(500).send("Error inserting data into MongoDB");
  }
});

app.post('/update/:id', async (req, res) => {
  console.log("req.params.id: ", req.params.id);
  try {
    await connectDB();
    const collection = db.collection("alex-ub-collection");
    let result = await collection.findOneAndUpdate(
      { "_id": new ObjectId(req.params.id) },
      { $set: { "post": "NEW POST" } },
      { returnOriginal: false }
    );
    console.log(result);
    res.redirect('/read');
  } catch (error) {
    console.error("Error updating document:", error);
    res.status(500).send("Error updating document");
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
