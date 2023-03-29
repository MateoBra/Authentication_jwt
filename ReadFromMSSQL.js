
const { Sequelize, DataTypes, Op } = require('sequelize');

function ReadFromMSSQL(username, password, role) {

    const sequelize = new Sequelize('Table_1', 'sa', 'password123', {
        dialect: 'mssql',
        dialectOptions: {
            // Observe the need for this nested `options` field for MSSQL
            options: {
                // Your tedious options here
                useUTC: false,
                dateFirst: 1
            }
        }
    });

    //Kreiranje modela
    //Pazit na automatski dodane stvari (id, timestamps,createdAt,updatedAt), id mora postojat osim ako se ne postavi primaryKey na neki
    const Data = sequelize.define("Users", {
        seqId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        userName: {
            type: DataTypes.STRING
        },
        password: {
            type: DataTypes.STRING
        },
        role: {
            type: DataTypes.STRING
        }

    }, {

        //freezeTableName: true
        tableName: "Users",
        timestamps: false,
        createdAt: false,
        updatedAt: false,


    })
    //{userName: {[Op.like]:username}}}
    return Data.findAll(username != null ? { where: {userName: {[Op.like]:username}}} : {})
        .then((data) => {
            sequelize.close()
            return data
        })
        .catch((e) => { console.log(e) })

}
module.exports = ReadFromMSSQL