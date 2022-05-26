const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config();


app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.xiaon.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        console.log('Database Connected');
    }

    finally {

    }
}

run().catch(console.dir);


app.get('/', async (req, res) => {
    res.send("HelloW Bike Hero");
});

app.listen(port, () => {
    console.log(`Bike Hero Listening On ${port}`)
})