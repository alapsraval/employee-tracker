const mysql = require('mysql');
const inquirer = require('inquirer');
const consoleTable = require('console.table');
require('dotenv').config();

// global variables
let departments = [];
let roles = [];
let employees = [];
let managers = [];

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

const showOptions = () => {
    getRoles();
    getEmployees();

    inquirer
        .prompt({
            name: 'crudOption',
            type: 'list',
            message: 'What would you like to do?',
            choices: [
                { name: 'View Employees', value: 'view-employee' },
                { name: 'View Departments', value: 'view-department' },
                { name: 'View Roles', value: 'view-role' },
                { name: 'Add Employee', value: 'add-employee' },
                { name: 'Add Department', value: 'add-department' },
                { name: 'Add Role', value: 'add-role' },
                // 'View Employees by Manager',
                // 'Update Employee Role',
                // 'Update Employee Manager'
                { name: 'Quit', value: 'quit-app' }
            ],
        })
        .then((answer) => {
            let crud = answer.crudOption.split("-")[0];
            let tableName = answer.crudOption.split("-")[1];
            let results = [];
            switch (crud) {
                case "view":
                    readRows(tableName);
                    break;
                case "add":
                    if (tableName === 'employee') createEmployee(tableName);
                    if (tableName === 'role') createRole(tableName);
                    if (tableName === 'deparment') createDeparment(tableName);
                    break;
                default:
                    connection.end();
            }
        });
};

// CRUD operations

const readRows = (tableName) => {
    connection.query(`SELECT * FROM ${tableName}`, (err, res) => {
        if (err) throw err;
        console.table(res);
        showOptions();
    });
};

const createEmployee = () => {
    inquirer
        .prompt([
            {
                name: 'first_name',
                type: 'input',
                message: 'Employee\'s First Name: ',
            },
            {
                name: 'last_name',
                type: 'input',
                message: 'Employee\'s Last Name: ',
            },
            {
                name: 'role_id',
                type: 'list',
                message: 'Employee\'s Role: ',
                choices: roles,
            },
            {
                name: 'manager_id',
                type: 'list',
                message: 'Employee\'s Manager: ',
                choices: managers,
            },
        ])
        .then((answer) => {
            connection.query(
                `INSERT INTO employee SET ?`,
                {
                    first_name: answer.first_name,
                    last_name: answer.last_name,
                    role_id: answer.role_id,
                    manager_id: answer.manager_id,
                },
                (err, res) => {
                    if (err) throw err;
                    console.log('Your entry was added successfully!');
                    showOptions();
                }
            );
        });
};

// Helper functions
const getEmployees = () => {
    connection.query('SELECT * FROM employee', (err, res) => {
        if (err) throw err;
        employees = res.map(employee => {
            return {
                name: employee.first_name,
                value: employee.id,
            }
        });
        managers = res.filter(employee => employee.role_id === 1);
        managers = managers.map(manager => {
            return {
                name: `${manager.first_name} ${manager.last_name}`,
                value: manager.id
            }
        })
    });
};

const getDepartments = () => {
    connection.query('SELECT * FROM department', (err, res) => {
        if (err) throw err;
        departments = [...res];
    });
};

const getRoles = () => {
    connection.query('SELECT * FROM role', (err, res) => {
        if (err) throw err;
        roles = res.map(role => {
            return {
                name: role.title,
                value: role.id
            }
        });
    });
};

connection.connect((err) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}\n`);
    showOptions();
});
