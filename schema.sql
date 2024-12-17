USE delta_app;
CREATE TABLE user(
    id VARCHAR(30) PRIMARY KEY, 
    name VARCHAR(30) UNIQUE,
    email VARCHAR(30) UNIQUE NOT NULL,
    password VARCHAR(30) NOT NULL
);
let q = "INSERT INTO user (id, name, email, password) VALUES (?, ?, ?, ?)";
let user = ['123', '123_newusername', 'abc@gmail.com', 'abc'];