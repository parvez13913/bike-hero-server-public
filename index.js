const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const productCollection = client.db('bikeHero').collection('product');
        const myOrderCollection = client.db('bikeHero').collection('myOrder');

        app.get('/products', async (req, res) => {
            const quary = {};
            const cursor = productCollection.find(quary);
            const products = await cursor.toArray();
            res.send(products);
        });

        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const products = await productCollection.findOne(query);
            res.send(products);
        });

        app.post('/myOrder', async (req, res) => {
            const myOrder = req.body;
            const result = await myOrderCollection.insertOne(myOrder);
            res.send(result);
        });
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