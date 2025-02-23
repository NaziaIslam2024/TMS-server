require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 4564;
const port1 =  4564;
const mongoose = require("mongoose");

// const app = express.init();
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
    cors: {
      origin: '*',
    }
});


app.use(cors());
app.use(express.json());

// const Schema = mongoose.Schema;



io.of("/socket").on("connection", (socket) => {
    console.log("socket.io: User connected: ", socket.id);
  
    socket.on("disconnect", () => {
      console.log("socket.io: User disconnected: ", socket.id);
    });
  });
  
//start the server
server.listen(port1, () => console.log(`Server now running on port ${port1}!`));

console.log("Okdgjnxd")
const mongoURI = `mongodb+srv://${process.env.DB_UESR}:${process.env.DB_PASS}@cluster0.4allx.mongodb.net/TMSDatabase?retryWrites=true&w=majority&appName=Cluster0`;

mongoose
    .connect(mongoURI, {
        // useNewUrlParser: true,
        // useCreateIndex: true,
        // useUnifiedTopology: true
    })
    .then(() => console.log("MongoDB connected successfully"))
    .catch((err) => console.error("MongoDB connection error:", err))
    ;

console.log("dklgxdlkgnhdsz");

const connection = mongoose.connection;
connection.once("open", () => {
    console.log("MongoDB database connected");
    
    console.log("Setting change streams");
    const taskChangeStream = connection.collection("Tasks").watch();
    
    taskChangeStream.on("change", (change) => {
        switch (change.operationType) {
        case "insert":
            const newtask = {
            _id: change.fullDocument._id,
            title: change.fullDocument.title,
            description: change.fullDocument.description,
            category: change.fullDocument.category,
            };
    
            io.of("/socket").emit("newTask", newtask);
            break;
    
        case "delete":
            io.of("/socket").emit("deletedTask", change.documentKey._id);
            break;
        }
    });
    });
// const database = mongoose.connection;
// const userCollection = database.collection("Users");
// const taskCollection = database.collection("Tasks");

// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const client = new MongoClient(uri, {
//     serverApi: {
//         version: ServerApiVersion.v1,
//         strict: true,
//         deprecationErrors: true,
//     }
// });

// async function run() {
//     try {
// await client.connect();
// console.log("Pinged your deployment. You successfully connected to MongoDB!");

const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        unique: false,
        required: true,
    },
    description: {
        type: String,
        unique: false,
        required: true,
    },
    taskOwner: {
        type: String,
        unique: false,
        required: true,
    },
    timeStamp: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        unique: false,
        required: true,
    },
});

const taskCollection = mongoose.model("Tasks", TaskSchema,"Tasks");



// Only one parameter [query/condition]
// Find all documents that matches the
// condition name='Punit'
// await User.find({ name: 'sebelly-xplore'},async function (err, docs) {
//     if (err){
//         console.log(err);
//     }
//     else{
//         console.log("First function call : ", docs);
//     }
// });


//api for (CREATE) user
// app.post('/users', async (req, res) => {
//     const user = req.body;
//     const query = { email: user.email }
//     const existingUser = await userCollection.findOne(query);
//     if (existingUser) {
//         return res.send({ message: "User already exists", insertedId: null })
//     }
//     const result = await userCollection.insertOne(user);
//     res.send(result);
// });

// //api for post task
// app.post('/tasks', async (req, res) => {
//     const task = req.body;
//     console.log(task);
//     const result = await taskCollection.insertOne(task);
//     res.send(result);
// });

const userCollection = mongoose.model('User', new mongoose.Schema({
    name: { type: String },
    email: { type: String }
}),'Users');
//api for get task
app.get('/tasks/:email', async (req, res) => {
    const email = req.params.email;
    // console.log(email);
    // const query = { taskOwner: email };
    const query = {taskOwner: email};
    const result = await taskCollection.find(query);
    // console.log(result);
    res.send(result);
    // const result = await userCollection.find();
    // res.json(result);
    // console.log(result);
    // console.log(res)
    // res.send(result);
});

//api for post task
app.post('/tasks', async (req, res) => {
    const task = req.body;
    console.log(task);
    const result = await taskCollection.insertOne(task);
    res.send(result);
});

//api for delete tasks
app.delete('/tasks/:id', async(req, res) => {
    const id = req.params.id;
    console.log(id)
    // const query = { _id: new ObjectId(id) };
    const result = await taskCollection.findByIdAndDelete(id);
    console.log(result)
    res.send(result);
})

app.put('/taskUpdate/:id', async(req, res) => {
    const id = req.params.id;
    console.log(id);
    const container = req.body.targetContainer;
    const update = { category: container };
    console.log(container)
    // const query = { _id: new ObjectId(id) };
    const result = await taskCollection.findByIdAndUpdate(id,update);
    console.log(result)
    res.send(result);
})

app.post('/users', async (req, res) => {
    const user = req.body;
    const query = { email: user.email }
    const existingUser = await userCollection.findOne(query);
    if (existingUser) {
        return res.send({ message: "User already exists", insertedId: null })
    }
    const result = await userCollection.insertOne(user);
    res.send(result);
});

//api for delete tasks
// app.delete('/tasks/:id', async (req, res) => {
//     const id = req.params.id;
//     console.log(id)
//     const query = { _id: new ObjectId(id) };
//     const result = await taskCollection.deleteOne(query);
//     res.send(result);
// })

//     }finally {
//         // Ensures that the client will close when you finish/error
//         //await client.close();
//     }
// }
// run().catch(console.dir);

app.get('/', async (req, res) => {
    res.send("TMS is started...");
})

// app.listen(port, () => {
//     console.log(`TMS is waiting at port ${port}`)
// })