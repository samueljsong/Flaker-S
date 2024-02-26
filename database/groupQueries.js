const database = require('../databaseConnection');

const createGroup = async(data) => {
    let sql = `
        INSERT INTO friendgroup (name)
        VALUES (?);
    `

    let param = [data.name];

    try{
        const result = await database.query(sql, param);
        return result[0].insertId;
    } catch (err) {
        console.log(err);
    }
}

const enterGroup = async(data) => {
    let sql = `
        INSERT INTO group_members (frn_group_id, frn_user_id)
        VALUES (?, ?);
    `

    let param = [data.group_id, data.user_id];

    try{
        const result = await database.query(sql, param);
        console.log(result)
    } catch (err) {
        console.log(err);
    }
}

const getAllGroups = async(data) => {
    let sql = `
        SELECT frn_group_id AS group_id, name
        FROM group_members
        INNER JOIN friendgroup
        ON group_members.frn_group_id = friendgroup.group_id
        WHERE frn_user_id = (?);
    `

    let param = [data.user_id];

    try {
        const result = await database.query(sql, param);
        return result[0]
    } catch (err) {
        console.log(err)
    }
}

const getAllMembers = async(data) => {
    let sql = `
        SELECT COUNT(*) AS totalMembers
        FROM group_members
        WHERE frn_group_id = (?);
    `

    param = [data.group_id]

    try{
        const result = await database.query(sql, param)
        return result[0][0].totalMembers
    } catch (err) {
        console.log(err);
    }
}

const getGroupName = async(data) => {
    const sql = `
        SELECT name 
        FROM friendgroup
        WHERE group_id = (?);
    `

    const param = [data.group_id];

    try{
        const result = await database.query(sql, param)
        return result[0][0].name
    } catch(err){
        console.log(err)
    }
}

const deleteGroup = async(data) => {
    const sql = `
        DELETE FROM group_members
        WHERE frn_group_id = (?);
    `
    const sql2= `
        DELETE FROM friendgroup
        WHERE group_id = (?);
    `

    const param = [data.group_id]

    try{
        await database.query(sql, param);
        await database.query(sql2, param)
        return true
    } catch (err) {
        console.log(err)
        return false
    }

}

module.exports = {
    createGroup, enterGroup, 
    getAllGroups, getAllMembers, 
    getGroupName, deleteGroup
}