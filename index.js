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
        const reviewCollection = fruitsAndFoodDb.collection('reviewCollection')
        
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


        // create api to insert document in DB  
        app.post('/review',async(req, res)=>{
            const review = req.body;
            const result = await reviewCollection.insertOne(review)
            res.send(result)
            console.log(result)
        })
        // get user review from db 
        app.get('/review',async(req, res)=>{
            let query = {};
            if(req.query.email){
                query = {
                    email: req.query.email
                }
            }
            const cursor =  reviewCollection.find(query)
            const reviews = await cursor.toArray();
            
            res.send(reviews)
        })
        // delete review 
        app.delete('/review/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            const result = await reviewCollection.deleteOne(query)
            res.send(result)
            console.log(result)
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