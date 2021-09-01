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

const viewTable = (tableName) => {
    connection.query(`SELECT * FROM ${tableName}`, (err, res) => {
        if (err) throw err;
        console.table(res);
        connection.end();
    });
};

const showOptions = () => {
    inquirer
        .prompt({
            name: 'crud',
            type: 'list',
            message: 'What would you like to do?',
            choices: [
                // 'Add Employee',
                // 'Add Department',
                // 'Add Role',
                { name: 'View Employees', value: 'employee' },
                { name: 'View Departments', value: 'department' },
                { name: 'View Roles', value: 'role' },
                // 'View Employees by Manager',
                // 'Update Employee Role',
                // 'Update Employee Manager'
            ],
        })
        .then((answer) => {
            if (answer.crud === 'employee' || answer.crud === 'department' || answer.crud === 'role') {
                viewTable(answer.crud);
            } else {
                connection.end();
            }
        });
}

connection.connect((err) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}\n`);
    showOptions();
    // connection.end();
});
