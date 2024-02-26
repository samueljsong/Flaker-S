require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const expireTime = 60 * 60 * 1000;

// Import query and functions
const db_query = require('./database/queries');                         // db used for user queries

const PORT = process.env.PORT || 3000;
const saltRounds = 12;
const app = express();

//Routes
const friendRoute = require('./routes/friends');
const groupRoute = require('./routes/group');
const eventRoute = require('./routes/events');

app.use('/friends', friendRoute);
app.use('/group', groupRoute);
app.use('/event', eventRoute);


const connectDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGO_URL);
        console.log("MongoDB Connected");
    } catch (err){
        console.log(err);
        process.exit(1);
    }
}

// Middleware
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());
app.use(session({
    secret: process.env.NODE_SECRET_SESSION,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URL,
        crypto:{secret: process.env.MONGO_SESSION_SECRET},
        collectionName: "sessions"
    }),
    saveUninitialized: false,
    resave: true,
    cookie: {
        maxAge: expireTime,
        secure: true
    }
}));

const corsOption = {
    origin: '*',
    credentials:true,
    optionSuccessStatus: 200,
};

app.use(cors(corsOption));

app.get('/', (req, res) => {
    res.json({
        message: "SAM AND ALAN COMP4921 PROJECT 3"
    })
})

app.post('/signup', async (req, res) => {

    const result = await db_query.createUser({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    });

    res.json(result)
})

app.post('/login', async (req, res) => {
    const result = await db_query.getUser({username: req.body.username});

    if (result.user === undefined){
        res.json({success: false, message: "There is no user with that username..."})
    }
    
    const userResult = result.user;

    if(userResult.password === req.body.password){
        req.session.user_id = userResult.user_id;
        req.session.username = userResult.username;
        req.session.email = userResult.email;
        req.session.user_pic = userResult.user_pic;
        let sessionID = req.sessionID;
        req.sessionStore.set(sessionID, req.session);
        res.json({
            success: true,
            session: sessionID
        })
    }else{
        res.json({success: false, message: "The password and username does not match..."})
    }
    
})

app.post('/logout', async (req, res) => {
    req.sessionStore.destroy(req.body.session, (err, session) => {
        if (err) {
            res.json({
                success: false,
            })
        } else {
            console.log("session destroyed.")
            res.json({
                success: true,
            })
        }
    })
})

app.post('/authenticate', async (req, res) => {
    req.sessionStore.get(req.body.session, (err, session) => {
        if (err || session === undefined || session === null) {
            res.json({
                success: false,
            })
        } else {
            res.json({
                success: true,
            })
        }
    })
})

//API routes

app.post('/findUsers', async(req, res) => {
    req.sessionStore.get(req.body.session, async (err, session) => {
        if (err || session === undefined || session === null) {
            const result = [];
            res.json({result: result});
        } else {
            const result = await db_query.findUsers({search: `${req.body.search}%`, username: session.username});
            res.json({result: result});
        }
    })
})

app.post('/profile', async(req, res) => {
    req.sessionStore.get(req.body.session, async (err, session) => {
        if (err || session === undefined || session === null) {
            res.json({success: false});
        } else {
            const result = await db_query.getCurrentUser({user_id: session.user_id});
            console.log(result);
            res.json({result: result.user, success: result.success});
        }
    })
})

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`APP LISTENING ON PORT: ${PORT}`)
    })
})
