const database = require('../databaseConnection');

const createEvent = async(data) => {
    const sql = `
        INSERT INTO events
        (name, description, creator_id, date, start_time, end_time, friend_group, location)
        VALUES
        (?, ?, ?, ?, ?, ?, ?, ?);
    `
    const param = [data.title, data.description, data.user_id, data.date, data.start_time, data.end_time, data.group_id, data.location]

    try{
        const result = await database.query(sql, param);
        console.log(result)
    } catch(err) {
        console.log(err)
    }
}

const getAllEvents = async(data) => {
    const sql = `
        SELECT * FROM events
        WHERE friend_group = (?) AND deletedDate IS NULL;
    `

    const param = [data.group_id];

    try{
        const result = await database.query(sql, param);
        return result[0]
    } catch (err) {
        console.log(err)
    }
}

const getAllEventsForToday = async(data) => {
    const sql = `
        SELECT * FROM events
        WHERE date = (?) AND deletedDate IS NULL;
    `

    const param = [data.date];

    try{
        const result = await database.query(sql, param);
        return result[0]
    }catch (err) {
        console.log(err)
    }
}

const getAllRecycledEvents = async(data) => {
    const sql = `
        SELECT * FROM events
        WHERE friend_group = (?) AND deletedDate IS NOT NULL;
    `

    const param = [data.group_id];

    try{
        const result = await database.query(sql, param);
        return result[0]
    } catch (err) {
        console.log(err)
    }
}

const recycleEvent = async(data) => {
    const sql = `
        UPDATE events 
        SET deletedDate = (?)
        WHERE event_id = (?);
    `

    const param = [data.deletedDate ,data.event_id];

    try{
        await database.query(sql, param);
        return true;
    }catch(err){
        console.log(err)
        return false;
    }
}

const restoreEvent = async(data) => {
    const sql = `
        UPDATE events
        SET deletedDate = NULL
        WHERE event_id = (?);
    `

    const param = [data.event_id]

    try{
        await database.query(sql, param);
        return true
    } catch (err) {
        console.log(err)
        return false
    }
}

const deleteEvent = async(data) => {
    const sql = `
        DELETE FROM events
        WHERE event_id = (?);
    `

    const param = [data.event_id];

    try{
        await database.query(sql, param);
        return true
    } catch (err) {
        return false
    }
}

module.exports = {
    createEvent, getAllEvents, 
    deleteEvent, getAllRecycledEvents,
    recycleEvent, restoreEvent,
    getAllEventsForToday
}