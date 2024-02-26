const express = require('express');
const router = express.Router();
const cors = require('cors');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const expireTime = 60 * 60 * 1000;

//database
const friendsDB = require("../database/friendsQueries");

const corsOption = {
    origin: '*',
    credentials:true,
    optionSuccessStatus: 200,
};

router.use(cors(corsOption))

router.use(bodyParser.urlencoded({extended: true}))
router.use(express.json())
router.use(session({
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


router.post('/getAll', async (req, res) => {
    if(req.body.session == undefined){
        res.send({success: false})
    }
    
    req.sessionStore.get(req.body.session, async(err, session) => {
        if(err || session === undefined || session === null){
            res.json({
                success: false
            })
        } else {
            const user_id = session.user_id;
            const result = await friendsDB.getAllFriends({user_id: user_id})
            res.json({
                allFriends: result
            })
        }
    })
})

router.post('/requests', async (req, res) => {
    if(req.body.session == undefined){
        res.send({success: false})
    }
    
    req.sessionStore.get(req.body.session, async(err, session) => {
        if(err || session === undefined || session === null){
            res.json({
                success: false
            })
        } else {
            const user_id = session.user_id;
            const result = await friendsDB.getRequests({user_id: user_id})
            res.json({
                requests: result
            })
        }
    })
})

router.post('/getStatus', async(req, res) => {
    req.sessionStore.get(req.body.session, async(err, session) => {
        if (err || session === undefined || session === null) {
            res.json({success: false});
        } else {
            const result = await friendsDB.getStatus({requester: session.user_id, receiver: req.body.userid});
            if (result === undefined || result.friends === undefined || result.requester_id === undefined || result.receiver_id === undefined) {
                res.json({success: true, status: 0})
            } else {
                if (result.friends == 0) {
                    if (result.requester_id == session.user_id) {
                        res.json({success: true, status: 1});
                    } else if (result.receiver_id == session.user_id) {
                        res.json({success: true, status: 2});
                    }
                } else if (result.friends == 1) {
                    res.json({success: true, status: 3});
                } else {
                    res.json({success: false});
                }
            }
            
        }
    })
})

router.post('/sendRequest', async(req, res) => {
    req.sessionStore.get(req.body.session, async(err, session) => {
        if (err || session === undefined || session === null) {
            res.json({success: false});
        } else {
            const result = await friendsDB.sendRequest({requester: session.user_id, receiver: req.body.userid});
            res.json({success: true});
        }
    })
})

router.post('/acceptRequest', async(req, res) => {
    req.sessionStore.get(req.body.session, async(err, session) => {
        if (err || session === undefined || session === null) {
            res.json({success: false});
        } else {
            const result = await friendsDB.acceptRequest({requester: session.user_id, receiver: req.body.userid});
            res.json({success: true});
        }
    })
})


router.post('/removeFriend', async (req, res) => {
    if(req.body.session == undefined){
        res.send({success: false})
    }
    
    req.sessionStore.get(req.body.session, async(err, session) => {
        if(err || session === undefined || session === null){
            res.json({
                success: false
            })
        } else {
            const result = await friendsDB.removeFriend({requester: session.user_id, receiver: req.body.userid})
            res.json({
                success: true
            })
        }
    })
})

module.exports = router;