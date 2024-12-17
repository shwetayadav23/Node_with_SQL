const { faker } = require('@faker-js/faker');
const mysql = require('mysql2'); //get the client
const express = require('express');
const app = express();
const port = 8080;
const path = require("path");
const methodOverride = require('method-override');
const { v4: uuidv4 } = require("uuid");

app.use(methodOverride("_method"));
app.use(express.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());


// Create the connection to database
const connection = mysql.createConnection({ //node aur mysql ko connect kar rhe hai
  host: 'localhost',
  user: 'root',
  database: 'delta_app',
  password: 'parulyadav'
});

let getRandomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.username(), // before version 9.1.0, use userName()
    faker.internet.email(),
    faker.internet.password()
  ];
};

app.get("/", (req, res) => {
  let q = "SELECT count(*) FROM user";
  try{
    connection.query(q, (err, result) => { //connection.query ko agar q ke andar koi placeholder milega toh unn placeholder ko user array ke andar koi value hai toh vahaan se utha kar apni query ke andar input krne ki koshish krega
      if(err) throw err;
      let count = result[0]["count(*)"];
      res.render("home.ejs", { count });
    })
  }
  catch(err){
    console.log(err);
    res.send("some error in database");
  }
});

app.get("/user", (req, res) => {
  let q = "SELECT * FROM user";
  try{
    connection.query(q, (err, result) => {
      if (err) throw err;
      res.render("details.ejs", { result });
    })
  }
  catch(err){
    console.log(err);
  }
});

app.get("/user/:id/edit", (req, res) => {
  let { id } = req.params;
  console.log(id);
  let q = `SELECT * FROM user WHERE id = '${id}'`;

  try{
    connection.query(q, (err, result) => {
      if (err) throw err;
      // console.log(id);
      let userinfo = result[0];
      res.render("edit.ejs", { userinfo });
    });
  }
  catch(err){
    console.log(err);
    res.send("some error in database");
  }
});

app.patch("/user/:id", (req, res) => {
  let { id } = req.params;
  let { password: formPass, username: newUsername } = req.body;

  console.log('Request Body:', req.body);
  let q = `SELECT * FROM user WHERE id = '${id}'`;

  try{
    connection.query(q, (err, result) => {
      if (err) throw err;
      let userinfo = result[0];
      if(formPass != userinfo.password){
        res.send("WRONG PASSWORD");
      }
      else{
        let q2 = `UPDATE user SET name = '${newUsername}' WHERE id = '${id}'`;

        connection.query(q2, (err, result) => {
          if (err) throw err;
          res.redirect("/user");
        })
      }
    });
  }
  catch(err){
    console.log(err);
    res.send("some error in database");
  }
});

app.get("/user/new", (req, res) => {
  res.render("form.ejs");
});

app.post("/user/new", (req, res) => {
  let {username: userName, email: Email, password: pass} = req.body;
  let id = uuidv4();

  let q = `INSERT INTO user(id, name, email, password) VALUES('${id}', '${userName}', '${Email}', '${pass}')`;

  try{
    connection.query(q, (err, result) => {
      if (err) throw err;
      res.redirect("/user");
    })
  }
  catch(err){
    console.log(err);
    res.send("some error in database");
  }
});

app.get("/user/:id/delete", (req, res) => {
  let { id } = req.params;
  console.log(id);

  let q = `SELECT * FROM user WHERE id = '${ id }'`;
  
  try{
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      console.log(user);
      res.render("delete.ejs", { user });
    })
  }
  catch(err){
    console.log(err);
    res.send("some error in database");
  }
});

app.delete("/user/:id", (req, res) => {
  let { id } = req.params;
  let {email: Email, password: formPass} = req.body;

  let q = `SELECT * FROM user WHERE id = '${ id }'`;

  try{
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      console.log(user);
      if(formPass != user.password){
        res.send("WRONG PASSWORD!!");
      }
      let q2 = `DELETE FROM user WHERE id = '${ id }'`;

      connection.query(q2, (err, result) => {
        if (err) throw err;
        res.redirect("/user");
      })
    })
  }
  catch(err){
    console.log(err);
    res.send("some error in database");
  }
})

app.listen(port, () => {
  console.log(`app is listening at port ${ port }`);
});
