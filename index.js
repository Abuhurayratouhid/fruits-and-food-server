const express = require('express')
const app = express()
const cors = require('cors')
const port = process.env.PORT || 5000;
require('dotenv').config();

// middleware
app.use(cors())
app.use(express.json())


// mongodb connection

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.rz3ftkv.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        const fruitsAndFoodDb = client.db('fruitsAndFoodDb');
        const fruitsAndFoodCollection = fruitsAndFoodDb.collection('fruitsAndFoodCollection');
        //get all services from database 
        app.get('/allServices', async(req, res)=>{
            const query = {};
            const cursor = fruitsAndFoodCollection.find(query);
            const allServices= await cursor.toArray();
            res.send(allServices)
        })
        // create api for get limited data from DB
        app.get('/services',async(req, res)=>{
            const query = {} 
            const cursor = fruitsAndFoodCollection.find(query).limit(3)
            const services = await cursor.toArray()
            res.send(services)
        })
        //create api for get service details by ID
        app.get('/details/:id',async(req, res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            const service = await fruitsAndFoodCollection.findOne(query)
            res.send(service)
        })

    }
    finally{

    }

}
run().catch(error => console.log(error))



app.get('/',(req, res)=>{
    res.send('fruits and food delivery server in running')
})

app.listen(port,()=>{
    console.log(`fruits and food delivery service running on ${port}`)
})