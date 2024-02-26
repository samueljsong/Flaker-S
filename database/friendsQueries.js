const database = require('../databaseConnection');

const getAllFriends = async(data) => {
    let sql = `
        SELECT DISTINCT user_id, username, user_pic
        FROM (SELECT DISTINCT *
        FROM friends f
        INNER JOIN user u
        ON f.requester_id = u.user_id
        UNION
        SELECT DISTINCT *
        FROM friends f
        INNER JOIN user u
        ON f.receiver_id = u.user_id) as f
        WHERE (requester_id = (?) OR receiver_id = (?))
        AND friends = 1
        AND user_id <> (?);
    `;

    let param = [data.user_id, data.user_id, data.user_id];

    try{
        const result = await database.query(sql, param);
        return result[0];
    }catch(err){
        console.log(err);
    }
}

const getRequests = async(data) => {
    let sql = `
        SELECT DISTINCT user_id, username, user_pic
        FROM (SELECT DISTINCT *
        FROM friends f
        INNER JOIN user u
        ON f.requester_id = u.user_id
        UNION
        SELECT DISTINCT *
        FROM friends f
        INNER JOIN user u
        ON f.receiver_id = u.user_id) as f
        WHERE (requester_id = (?) OR receiver_id = (?))
        AND friends = 0
        AND user_id <> (?);
    `;

    let param = [data.user_id, data.user_id, data.user_id];

    try{
        const result = await database.query(sql, param);
        return result[0];
    }catch(err){
        console.log(err);
    }
}

//friend request queries
const getStatus = async(data) => {
    let sql = `
        SELECT *
        FROM friends
        WHERE (requester_id = (?)
        AND receiver_id = (?))
        OR (requester_id = (?)
        AND receiver_id = (?));
    `

    let param = [data.requester, data.receiver, data.receiver, data.requester];

    try{
        const result = await database.query(sql, param);
        return result[0][0];
    }catch(err){
        console.log(err);
    }
}

const sendRequest = async(data) => {
    let sql = `
        INSERT INTO friends
        (requester_id, receiver_id, friends)
        VALUES
        (?, ?, ?);
    `

    let param = [data.requester, data.receiver, false];

    try{
        const result = await database.query(sql, param);
        return result[0];
    }catch(err){
        console.log(err);
    }
}

const acceptRequest = async(data) => {
    let sql = `
        UPDATE friends
        SET friends = true
        WHERE (requester_id = (?)
        AND receiver_id = (?))
        OR (requester_id = (?)
        AND receiver_id = (?));
    `

    let param = [data.requester, data.receiver, data.receiver, data.requester];

    try{
        const result = await database.query(sql, param);
        return result[0];
    }catch(err){
        console.log(err);
    }
}

const removeFriend = async(data) => {
    let sql = `
        DELETE 
        FROM friends
        WHERE (requester_id = (?)
        AND receiver_id = (?))
        OR (requester_id = (?)
        AND receiver_id = (?));
    `
    let param = [data.requester, data.receiver, data.receiver, data.requester];

    try {
        const result = await database.query(sql, param);
        console.log(result);
        return result;
    } catch(err) {
        console.log(err);
    }
}

module.exports = {
    getAllFriends, getRequests, sendRequest, getStatus, acceptRequest, removeFriend
}