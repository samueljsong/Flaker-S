const express = require('express');
const router = express.Router();
const cors = require('cors');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const expireTime = 60 * 60 * 1000;

const groupDB = require('../database/groupQueries');

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

router.post('/createGroup', async(req, res) => {

    if(req.body.session == undefined){
        res.send({success: false})
    }

    req.sessionStore.get(req.body.session, async(err, session) => {
        if(err || session === undefined || session === null){
            res.send({success: false})
        }else{
            const groupID = await groupDB.createGroup({name: req.body.groupName});
            await groupDB.enterGroup({group_id: groupID, user_id: session.user_id})
            req.body.group.forEach(async(num) => {
                await groupDB.enterGroup({
                    group_id: groupID,
                    user_id: num
                })
            })
            res.json({success: true})
        }
    })

})

router.post('/getAllGroups', async(req, res) => {
    if(req.body.session == undefined){
        res.send({success: false})
    }

    req.sessionStore.get(req.body.session, async(err, session) => {
        if(err || session === undefined || session === null){
            res.send({success: false})
        } else {
            const result = await groupDB.getAllGroups({user_id: session.user_id});
            res.json({
                allGroups: result
            })
        }
    })
})

router.post('/getAllMembers', async(req, res) => {
    if(req.body.session == undefined){
        res.send({success:false})
    }

    req.sessionStore.get(req.body.session, async(err, session) => {
        if(err || session === undefined || session === null){
            res.send({success: false})
        } else {
            const result = await groupDB.getAllMembers({
                group_id: req.body.group_id
            })
            res.json({
                allMembers: result
            })
        }
    })
})

router.delete('/deleteGroup/:group_id', async(req, res) => {
    const result = await groupDB.deleteGroup({group_id: req.params.group_id})
    res.json({
        success: result
    })
})

router.get('/getName/:group_id', async(req, res) => {
    const result = await groupDB.getGroupName({group_id: req.params.group_id})
    res.json({
        name: result
    })
})

module.exports = router;