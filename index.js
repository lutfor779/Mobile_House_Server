const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8qcwn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('mobile_house');
        const productsCollection = database.collection('products');
        const usersCollection = database.collection('users');
        const ordersCollection = database.collection('orders');
        const reviewCollection = database.collection('reviews');

        // get products api
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            console.log('products found');
            res.send(products);
        })

        // get single product api
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const product = await productsCollection.findOne(query);
            console.log("target product found");
            res.json(product);
        })

        // add product api
        app.post('/products', async (req, res) => {
            const newPlace = req.body;
            const result = await productsCollection.insertOne(newPlace);
            console.log('added product');
            res.json(result);
        })

        // update product api
        app.put('/products/:id', async (req, res) => {
            const id = req.params.id;
            const updateProduct = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: updateProduct.name,
                    img: updateProduct.img,
                    price: updateProduct.price,
                    detail: updateProduct.detail
                },
            };
            const result = await productsCollection.updateOne(filter, updateDoc, options);
            console.log('updated product');
            res.json(result);
        })

        // delete product api
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            console.log('product deleted');
            res.json(result);
        })




        // get user api
        app.get('/users', async (req, res) => {
            const cursor = usersCollection.find({});
            const users = await cursor.toArray();
            console.log('Users found');
            res.send(users);
        })

        // save user api
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log('users data saved');
            res.json(result);
        })

        // update user api
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            console.log('update user data');
            res.json(result);
        })




        // get orders api
        app.get('/orders', async (req, res) => {
            const email = req?.query?.email;
            if (email) {
                const query = { email };
                const cursor = ordersCollection.find(query);
                const orders = await cursor.toArray();
                console.log('single user order found');
                res.json(orders);
            }
            else {
                const cursor = ordersCollection.find({});
                const orders = await cursor.toArray();
                console.log('orders found');
                res.json(orders);
            }
        })

        // save order api
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            console.log('order done');
            res.json(result);
        })

        // update order status api
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const updateStatus = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: updateStatus.status
                },
            };
            const result = await ordersCollection.updateOne(filter, updateDoc, options);
            console.log('updated status');
            res.json(result);
        })

        // delete order api
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            console.log('order deleted');
            res.json(result);
        })



        // check admin api
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            console.log('admin : ', isAdmin);
            res.json({ admin: isAdmin });
        })

        // make admin api
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            console.log('admin makes successfully');
            res.json(result);
        })



        // get reviews api
        app.get('/reviews', async (req, res) => {
            const cursor = reviewCollection.find({});
            const reviews = await cursor.toArray();
            console.log('reviews found');
            res.send(reviews);
        })

        // save review api
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            console.log('review added');
            res.json(result);
        })


        console.log('database connection ok');
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Welcome to MOBILE HOUSE!')
})

app.listen(port, () => {
    console.log(`Mobile server listening at :${port}`)
})