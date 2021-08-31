USE employees_db;

INSERT INTO employee(first_name, last_name, role_id, manager_id)
VALUES ('Doretta','Plumley', 1, NULL),
('Larisa','Corby',2, 1),
('Tamala','Carbonaro',3, 1),
('Hyman','Daly',4, 1),
('Paz','Mincy',4, 1),
('Wiley','Dimas',4, 1),
('Lavera','Losee',5, 1),
('Eric','Bunch',5, 1),
('Krysten','Alejandro',5, 1),
('Vernice','Pisani', 5, 1);

INSERT INTO department(name)
VALUES ('Sales');

INSERT INTO role(title, salary, department_id)
VALUES ('Manager', 120000, 1),
('Assistant Manager', 80000, 1),
('Secretary', 40000, 1),
('Sales Rep', 55000, 1),
('Senior Sales Rep', 70000, 1);