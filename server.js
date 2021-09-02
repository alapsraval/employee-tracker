const mysql = require('mysql');
const inquirer = require('inquirer');
const consoleTable = require('console.table');
require('dotenv').config();

// global variables
let departments = [];
let roles = [];
let employees = [];
let managers = [];

//connection to MySQL
const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Helper functions
const getEmployees = async () => {
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

const getDepartments = async () => {
    connection.query('SELECT * FROM department', (err, res) => {
        if (err) throw err;
        departments = res.map(department => {
            return {
                name: department.name,
                value: department.id
            }
        });
    });
};

const getRoles = async () => {
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

// show CRUD options
const showOptions = () => {
    inquirer
        .prompt([
            {
                name: 'crudOption',
                type: 'list',
                message: 'What would you like to do?',
                choices: [
                    { name: 'View Employees', value: 'view-employee' },
                    { name: 'View Employees by Manager', value: 'view-employee-manager' },
                    { name: 'View Departments', value: 'view-department' },
                    { name: 'View Roles', value: 'view-role' },
                    { name: 'Add Employee', value: 'add-employee' },
                    { name: 'Add Department', value: 'add-department' },
                    { name: 'Add Role', value: 'add-role' },
                    { name: 'Update Employee Role', value: 'update-employee-role' },
                    { name: 'Update Employee Manager', value: 'update-employee-manager' },
                    { name: 'Quit', value: 'quit-app' }
                ],
            }, {
                name: 'manager',
                type: 'list',
                message: 'Select the manager',
                choices: managers,
                when: (answers) => answers.crudOption === "view-employee-manager"
            }
        ])
        .then((answer) => {
            let crud = answer.crudOption.split("-")[0];
            let tableName = answer.crudOption.split("-")[1];
            let filterName = answer.crudOption.split("-")[2];
            let filterValue;
            if (filterName === 'manager') filterValue = answer.manager;
            let results = [];
            switch (crud) {
                case "view":
                    filterValue ? readRows(tableName, filterValue) : readRows(tableName);
                    break;
                case "add":
                    if (tableName === 'employee') {
                        createEmployee(tableName)
                    } else if (tableName === 'role') {
                        createRole(tableName)
                    } else if (tableName === 'department') {
                        createDepartment(tableName)
                    } else {
                        connection.end();
                    };
                    break;
                case "update":
                    if (filterName === 'employee') {

                    } else if (filterName === 'role') {
                        updateEmployeeRole();
                    } else if (filterName === 'department') {

                    } else {
                        connection.end();
                    };
                    break;
                default:
                    connection.end();
            }
        });
};

// CRUD functions

const readRows = (tableName, filterValue = null) => {
    if (tableName === 'employee' && !filterValue) {
        connection.query(
            `SELECT e.first_name as First, e.last_name as Last, r.title as Title, d.name as Department, salary as Salary, concat(m.first_name, ' ', m.last_name) as Manager
            FROM employee as e
            LEFT JOIN role as r on e.role_id = r.id 
            LEFT JOIN department as d on r.department_id = d.id
            LEFT JOIN employee as m on e.manager_id = m.id`, (err, res) => {
            if (err) throw err;
            console.log(`\nAll Employees`);
            console.log(`=============\n`);
            console.table(res);
            showOptions();
        });
    } else if (tableName === 'employee' && filterValue) {
        connection.query(
            `SELECT e.first_name as First, e.last_name as Last, r.title as Title, d.name as Department, salary as Salary, concat(m.first_name, ' ', m.last_name) as Manager
            FROM employee as e
            LEFT JOIN role as r on e.role_id = r.id 
            LEFT JOIN department as d on r.department_id = d.id
            LEFT JOIN employee as m on e.manager_id = m.id
            WHERE e.manager_id = ${filterValue}`, (err, res) => {
            if (err) throw err;
            console.table(res);
            showOptions();
        });
    } else {
        connection.query(`SELECT * FROM ${tableName}`, (err, res) => {
            if (err) throw err;
            console.table(res);
            showOptions();
        });
    }
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
                when: (answers) => answers.role_id !== 1
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

const createDepartment = () => {
    inquirer
        .prompt([
            {
                name: 'name',
                type: 'input',
                message: 'Department Name: ',
            }
        ])
        .then((answer) => {
            connection.query(
                `INSERT INTO department SET ?`,
                {
                    name: answer.name,
                },
                (err, res) => {
                    if (err) throw err;
                    console.log(`Department "${answer.name}" was added successfully!`);
                    showOptions();
                }
            );
        });
};

const createRole = () => {
    inquirer
        .prompt([
            {
                name: 'title',
                type: 'input',
                message: 'Role Title: ',
            },
            {
                name: 'salary',
                type: 'input',
                message: 'Salary: ',
            },
            {
                name: 'department',
                type: 'list',
                message: 'Department: ',
                choices: departments,
            }
        ])
        .then((answer) => {
            connection.query(
                `INSERT INTO role SET ?`,
                {
                    title: answer.title,
                    salary: answer.salary,
                    department_id: answer.department,
                },
                (err, res) => {
                    if (err) throw err;
                    console.log(`New Role "${answer.title}" was added successfully!`);
                    showOptions();
                }
            );
        });
};

const updateEmployeeRole = () => {
    inquirer
        .prompt([
            {
                name: 'employee',
                type: 'list',
                message: 'Select Employee',
                choices: employees,
            },
            {
                name: 'role',
                type: 'list',
                message: 'Select the new role',
                choices: roles,
            }
        ])
        .then((answer) => {
            connection.query(
                `UPDATE employee SET ? WHERE ?`,
                [{
                    role_id: answer.role,
                }, {
                    id: answer.employee
                }],
                (err, res) => {
                    if (err) throw err;
                    console.log(`Employee Role was updated successfully!`);
                    showOptions();
                }
            );
        });
};

let init = () => {
    getEmployees();
    getDepartments();
    getRoles();
    // added delay to load managers before loading prompts. 
    // TODO: Replace with promise
    setTimeout(() => {
        showOptions();
    }, 100);
}

connection.connect((err) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}\n`);
    init();
    // getRoles();
    // getEmployees();
    // getDepartments();

});
