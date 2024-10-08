require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { ObjectId } = require('mongodb');
const { MongoClient, ServerApiVersion } = require('mongodb');
const PORT = process.env.PORT || 3000; // Set the PORT variable
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

// Connect to MongoDB once when the server starts
async function connectDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}
connectDB();

// Route for the homepage
app.get('/', function (req, res) {
  res.sendFile('index.html');
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
    let result = await client.db("ubiquitous-umbrella").collection("alex-ub-collection").find({}).toArray();
    console.log(result);
    
    res.render('read', {
      postData: result
    });
  } catch (error) {
    console.error("Error reading from MongoDB:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route to insert hardcoded data into MongoDB
app.post('/insert', async (req, res) => {
  console.log('in /insert');
  console.log('request', req.body);
  console.log('request', req.body.newPost);

  try {
    await client.db("ubiquitous-umbrella").collection("alex-ub-collection").insertOne({ post: req.body.newPost });
    res.redirect('read');
  } catch (error) {
    console.error("Error inserting into MongoDB:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route to update a document in MongoDB
app.post('/update/:id', async (req, res) => {
  console.log("req.params.id: ", req.params.id);
  
  try {
    const collection = client.db("ubiquitous-umbrella").collection("alex-ub-collection");
    let result = await collection.findOneAndUpdate(
      { "_id": new ObjectId(req.params.id) },
      { $set: { "post": "NEW POST" } }
    );

    console.log(result);
    res.redirect('/read');
  } catch (error) {
    console.error("Error updating MongoDB:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route to delete a document in MongoDB
app.post('/delete/:id', async (req, res) => {
  console.log("req.params.id: ", req.params.id);

  try {
    const collection = client.db("ubiquitous-umbrella").collection("alex-ub-collection");
    let result = await collection.findOneAndDelete({ "_id": new ObjectId(req.params.id) });
    
    console.log(result);
    res.redirect('/read');
  } catch (error) {
    console.error("Error deleting from MongoDB:", error);
    res.status(500).send("Internal Server Error");
  }
});


// Listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running & listening on port ${PORT}`);
});
