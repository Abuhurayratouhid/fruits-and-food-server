const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
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
// function for jwt verify
function verifyJWT(req, res, next){
    // console.log(req.headers.authorization)
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send({message: 'unauthorized access'})
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err,decoded){
        if(err){
           return res.status(401).send({message: 'unauthorized access'})
        }
        req.decoded = decoded ;
        next()
    })

} 
async function run(){
    try{
        const fruitsAndFoodDb = client.db('fruitsAndFoodDb');
        const fruitsAndFoodCollection = fruitsAndFoodDb.collection('fruitsAndFoodCollection');
        const reviewCollection = fruitsAndFoodDb.collection('reviewCollection')
        // JWT 
        app.post('/jwt',(req, res)=>{
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'})
            res.send({token})
            // console.log(user)
        })
        //get all services from database 
        app.get('/allServices', async(req, res)=>{
            const query = {};
            const cursor = fruitsAndFoodCollection.find(query);
            const allServices= await cursor.toArray();
            res.send(allServices)
        })
        //add a service in Db
        app.post('/addService',async(req, res)=>{
            const review = req.body;
            const result = await fruitsAndFoodCollection.insertOne(review)
            res.send(result)
            console.log(result)
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
        // get some review from db (limited 4)
        app.get('/review',async(req, res)=>{
            const query = {} ;
            const cursor = reviewCollection.find(query).limit(4)
            const someReviews = await cursor.toArray()
            res.send(someReviews)
        })

        // get single details 
        app.get('/singleReview/:id',async(req, res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            const review = await reviewCollection.findOne(query)
            res.send(review)
        })

        // update Review 
        app.put('/updateReview/:id',async(req, res)=>{
            const id = req.params.id;
            const filter = {_id: ObjectId(id)}
            const updatedReview = req.body ;
            const option = {upsert: true}
            const updateDoc = {
                $set:{
                    review : updatedReview.latest 
                }
            }
            const result = await reviewCollection.updateOne(filter, updateDoc,option)
            res.send(result)
            console.log(updatedReview.latest)
        })

        // get some review from db (limited 3)
        app.get('/reviewHome',async(req, res)=>{
            const query = {} ;
            const cursor = reviewCollection.find(query).limit(3)
            const someReviews = await cursor.toArray()
            res.send(someReviews)
        })
        // get user's review from db 
        app.get('/userReview',verifyJWT,async(req, res)=>{
            const decoded = req.decoded ;
            console.log(decoded)
            if(decoded.email !== req.query.email){
                res.status(403).send({message: 'forbidden'})
            }
            
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