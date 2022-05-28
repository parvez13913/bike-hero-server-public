const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config();


app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.xiaon.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized Access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden Access' });
        }
        req.decoded = decoded;
        next();
    });
}

async function run() {
    try {
        await client.connect();
        const productCollection = client.db('bikeHero').collection('product');
        const myOrderCollection = client.db('bikeHero').collection('myOrder');
        const userCollection = client.db('bikeHero').collection('users');

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

        // order
        app.post('/myOrder', async (req, res) => {
            const myOrder = req.body;
            const result = await myOrderCollection.insertOne(myOrder);
            res.send(result);
        });

        app.get('/myOrder', verifyJWT, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;
            if (email === decodedEmail) {
                const quary = { email: email };
                const cursor = myOrderCollection.find(quary);
                const myOrder = await cursor.toArray();
                return res.send(myOrder);
            }
            else {
                return res.status(403).send({ message: 'Forbidden Access' });
            }
        });

        // delete myOrder Data api 
        app.delete('/myOrder/:id', async (req, res) => {
            const id = req.params.id;
            const quary = { _id: ObjectId(id) };
            const result = await myOrderCollection.deleteOne(quary);
            res.send(result);
        });
        // user 
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    user,
                },
            };
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.send({ result, token });
        });
        app.get('/user', verifyJWT, async (req, res) => {
            const users = await userCollection.find().toArray();
            res.send(users);
        });
        app.put('/user/admin/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const updateDoc = {
                $set: { role: "admin" },
            };
            const result = await userCollection.updateOne(filter, updateDoc);
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