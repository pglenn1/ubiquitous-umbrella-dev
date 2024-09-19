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

console.log(uri);
console.log('im on a node server change that and that tanad f, yo');

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  } finally {
    // Ensure that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

// Route for the homepage
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Route for EJS rendering
app.get('/ejs', (req, res) => {
  res.render('index', {
    myServerVariable: "something from server"
  });
});

// Route to read data from MongoDB and render with EJS
app.get('/read', async (req, res) => {
  console.log('in /read');
  try {
    await client.connect();
    const result = await client.db("ubiquitous-umbrella").collection("alex-ub-collection").find({}).toArray();
    console.log(result);
    res.render('mongo', {
      postData: result
    });
  } catch (error) {
    console.error("Error reading data from MongoDB:", error);
    res.status(500).send("Error reading data from MongoDB");
  } finally {
    await client.close();
  }
});

// Route to insert hardcoded data into MongoDB
app.get('/insert', async (req, res) => {
  console.log('in /insert');
  try {
    await client.connect();
    await client.db("ubiquitous-umbrella").collection("alex-ub-collection").insertOne({ post: 'hardcoded post insert ' });
    await client.db("ubiquitous-umbrella").collection("alex-ub-collection").insertOne({ iJustMadeThisUp: 'hardcoded new key ' });
    res.render('insert');
  } catch (error) {
    console.error("Error inserting data into MongoDB:", error);
    res.status(500).send("Error inserting data into MongoDB");
  } finally {
    await client.close();
  }
});

// Route to update a document in MongoDB
app.post('/update/:id', async (req, res) => {
  console.log("req.params.id: ", req.params.id);
  try {
    await client.connect();
    const collection = client.db("ubiquitous-umbrella").collection("alex-ub-collection");
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
  } finally {
    await client.close();
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
