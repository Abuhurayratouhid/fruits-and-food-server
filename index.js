const express = require('express')
const app = express()
const cors = require('cors')
const port = process.env.PORT || 5000;
require('dotenv').config();

// middleware
app.use(cors())
app.use(express.json())


// mongodb connection 


app.get('/',(req, res)=>{
    res.send('fruits and food delivery server in running')
})

app.listen(port,()=>{
    console.log(`fruits and food delivery service running on ${port}`)
})