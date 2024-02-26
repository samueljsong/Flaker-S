const database = require('../databaseConnection');

const createUser = async(data) => {
    let createUserSQL = `
        INSERT INTO user
        (username, email, password)
        VALUES
        (?, ?, ?);
    `

    let param = [data.username, data.email, data.password];

    try{
        await database.query(createUserSQL, param);
        return {success: true}
    }
    catch(e){
        return {success: false}
    }
}

const getUser = async(data) => {
    let getUserSQL = `
        SELECT user_id, username, email, password, user_pic
        FROM user
        WHERE username = (?);
    `;

    let param = [data.username];

    try{
        const results = await database.query(getUserSQL, param);
        return {user: results[0][0], success: true};
    }
    catch(e){
        return {success: false}
    }
}

const getCurrentUser = async(data) => {
    let getUserSQL = `
        SELECT user_id, username, email, user_pic
        FROM user
        WHERE user_id = (?);
    `;

    let param = [data.user_id];
    try{
        const results = await database.query(getUserSQL, param);
        return {user: results[0][0], success: true};
    }
    catch(e){
        return {success: false}
    }
}

const findUsers = async(data) => {
    let sql = `
        SELECT *
        FROM user
        WHERE username LIKE (?) AND username <> (?);
    `

    let param = [data.search, data.username];

    try{
        const result = await database.query(sql, param);
        return result[0];
    }catch(err){
        console.log(err);
    }
}

module.exports = {
    createUser, getUser, getCurrentUser, findUsers
}