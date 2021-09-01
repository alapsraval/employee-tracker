const mysql = require('mysql');
const inquirer = require('inquirer');
const consoleTable = require('console.table');
require('dotenv').config();
const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

const showOptions = () => {

    inquirer
        .prompt({
            name: 'crudOption',
            type: 'list',
            message: 'What would you like to do?',
            choices: [
                { name: 'View Employees', value: 'view-employee' },
                { name: 'View Departments', value: 'view-department' },
                { name: 'View Roles', value: 'view-role' },
                // 'View Employees by Manager',
                // 'Update Employee Role',
                // 'Update Employee Manager'
                { name: 'Quit', value: 'quit-app' }
            ],
        })
        .then((answer) => {
            let crud = answer.crudOption.split("-")[0];
            let table = answer.crudOption.split("-")[1];
            let results = [];
            switch (crud) {
                case "view":
                    readRows(table);
                    break;
                case "add":

                    break;
                default:
                    connection.end();
            }
        });
}

// CRUD operations

const readRows = (tableName) => {
    connection.query(`SELECT * FROM ${tableName}`, (err, res) => {
        if (err) throw err;
        console.table(res);
        showOptions();
    });
};

connection.connect((err) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}\n`);
    showOptions();
});
