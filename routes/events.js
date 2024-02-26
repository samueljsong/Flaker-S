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
const eventsDB = require("../database/eventQueries");
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

router.post('/create', async(req, res) => {

    if(req.body.session == undefined){
        res.send({success: false})
    }

    req.sessionStore.get(req.body.session, async(err, session) => {
        if(err || session === undefined || session === null){
            res.json({
                success: false
            })
        }

        console.log(req.body.startTime)
        console.log(req.body.endTime)

        const title = req.body.title;
        const description = req.body.description;
        // const date = (req.body.date.split('T')[0]);
        const bodyDate = new Date(req.body.date);
        bodyDate.setMinutes(bodyDate.getMinutes() - bodyDate.getTimezoneOffset())
        const date = (bodyDate.toISOString().split('T')[0]);
        const startTime =`${date} ${req.body.startTime}:00`;
        const endTime = `${date} ${req.body.endTime}:00`;

        await eventsDB.createEvent({
            title: title,
            description: description,
            user_id: session.user_id,
            date: date,
            start_time: startTime,
            end_time: endTime,
            group_id: req.body.group_id,
            location: req.body.location
        })

        res.json({
            success: true
        })
    })
})

router.get('/getAllRecycledEvents', async(req, res) => {
    const group_id = parseInt(req.query.group_id);
    const result = await eventsDB.getAllRecycledEvents({group_id: group_id})

    for(let i = 0; i < result.length; i++){
        let test = result[i].start_time;
        let end = result[i].end_time;
        test.setMinutes(test.getMinutes() - test.getTimezoneOffset())
        end.setMinutes(end.getMinutes() - end.getTimezoneOffset())
    }
    const sorted = result.sort((a, b) => {
        return a.start_time - b.start_time
    })

    res.json({
        result: sorted
    })
})


router.get('/getAllEvents', async(req, res) => {

    const group_id = parseInt(req.query.group_id);
    const result = await eventsDB.getAllEvents({group_id: group_id})
    const dateString = req.query.date.slice(0, 15);

    for(let i = 0; i < result.length; i++){
        let test = result[i].start_time;
        let end = result[i].end_time;
        test.setMinutes(test.getMinutes() - test.getTimezoneOffset())
        end.setMinutes(end.getMinutes() - end.getTimezoneOffset())
    }
    const sorted = result.sort((a, b) => {
        return a.start_time - b.start_time
    })

    const filtered = [];

    for(let i =0; i < sorted.length; i++){
        if(sorted[i].date.toString().slice(0,15) == dateString){
            filtered.push(sorted[i])
        }
    }

    res.json({
        result: filtered
    })
})

router.patch('/recycleEvent/:event_id', async(req, res) => {
    let date = new Date();
    let sqlDate = date.toISOString().slice(0, 19).replace('T', ' ');
    const result = await eventsDB.recycleEvent(
        {
            event_id: parseInt(req.params.event_id),
            deletedDate: sqlDate
        }
    )
    console.log(result);
    res.json({
        success: result
    })
})

router.patch('/restoreEvent/:event_id', async(req, res) => {

    const result = await eventsDB.restoreEvent({
        event_id: parseInt(req.params.event_id)
    })

    res.json({
        success: result
    })
})

router.get('/getAllPlanEvents', async(req, res) => {
    const date = new Date()
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
    
    const result = await eventsDB.getAllEventsForToday({date: date.toISOString().split('T')[0]})
    res.json({
        result: result
    })
})

router.delete('/deleteEvent/:event_id', async(req, res) => {
    console.log(req.params.event_id)
    // req.sessionStore.get(req.body.session, async(err, session) => {
    //     if(session.user_id != req.body.creator_id){
    //         res.json({
    //             message: "ERROR: You cannot delete posts you did not make!"
    //         })
    //     }else{
            const result = await eventsDB.deleteEvent({event_id: parseInt(req.params.event_id)})
            res.json({
                success: result
            })
    //     }
    // })
})


module.exports = router;