const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

//middleware
app.use(cors());
app.use(express.json());

// making a connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tzgvu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;


const client = new MongoClient(uri);



// database connection
async function run() {
  try {
      await client.connect();

      const database = client.db('travelBlogs');
      const tourCollection = database.collection('tours');
      const experienceCollection = database.collection('experiences');
      const usersCollection = database.collection('users');

    //   get api start
      app.get('/tours', async(req, res) => {
          
      })
    
    //all the users experiences
    app.get('/experiences', async (req, res) => {
      // console.log(req.query);
      const cursor = experienceCollection.find({});
      const page = req.query.page;
      const size = parseInt(req.query.size);
      let experiences;
      const count = await cursor.count();
      if (page) {
        experiences = await cursor.skip(page * size).limit(size).toArray();
      } else {
        experiences = await cursor.toArray();
      }
      // const experiences = await cursor.toArray();
   
      res.json({
        count,experiences
      });
    })

    // filter user experience by email

    app.get('/experiences/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await experienceCollection.find(query).toArray();
      // const experience = await cursor.toArray();
      res.json(result);
    })



    // experience by id

    app.get('/userExperiences/:id', async (req, res) => {
      const query = { _id:ObjectId(req.params.id) };
      const result = await experienceCollection.findOne(query);
      // console.log(result);
      res.json(result);
    })

    app.put('/experiences/update', async (req, res) => {
      const experience = req.body;
      console.log('update', experience);
      const filter = { _id: ObjectId(experience.id) };
      const updateDoc = { $set: { status: "approved" } };
      const result = await experienceCollection.updateOne(filter, updateDoc)
      console.log(result);
      res.json(result);
    })

    app.delete('/experiences/:id', async (req, res) => {
      const query = { _id:ObjectId(req.params.id) };
      const result = await experienceCollection.deleteOne(query);
      // console.log(result);
      res.json(result);
    })

    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      // console.log(user);
      let isAdmin = false;
      if (user?.role === 'admin') {
        isAdmin = true;
      }
      res.json({admin: isAdmin});
    })

    //   end of get api
    //   post api
      app.post('/experiences', async(req, res) => {
          const experience = req.body;
          const result = await experienceCollection.insertOne(experience);
          // console.log(experience);
          res.json(result);
      })
    
    // store user data to the database
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      // console.log(result);
      res.json(result);
    })

    // inserting user if does not exist and not update if already exists
    app.put('/users', async (req, res) => {
      const user = req.body;
      // console.log('put', user);
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    })

    app.put('/users/admin', async (req, res) => {
      const user = req.body;
      console.log('put', user);
      const filter = { email: user.email }
      const updateDoc = { $set: { role: 'admin' } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    })

      console.log('Database Connection Established!');
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


// get API
app.get('/', (req, res) => {
    res.send('Hello, world!');
});


app.listen(port, () => {
    console.log('listening on port' + port);
})