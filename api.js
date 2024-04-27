const express = require('express');
const app = express();
const http = require('http');

const bcrypt = require('bcrypt')

const mysql = require('mysql2/promise'); 

const bodyParser = require("body-parser")

// Inställningar av servern.
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

async function getConnection() {
  return mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "php",
  });
}

app.get('/users', async function(req, res) {
    let connection = await getConnection(); 
    let sql = `SELECT * from users`;   
    let [results] = await connection.execute(sql);
  
    res.json(results);
});




app.get('/users/:id', async function(req, res) {
    //kod här för att hantera anrop…
    let connection = await getConnection()
  
    let sql = "SELECT * FROM users WHERE id = ?"

    let [results] = await connection.execute(sql, [req.params.id])
    res.json(results[0]) //returnerar första objektet i arrayen
  });


app.post('/users', async function(req, res) {
    //req.body innehåller det postade datat
     console.log(req.body)
   
     let connection = await getConnection()
     let sql = `INSERT INTO users (username, name)
     VALUES (?, ?)`
   
     let [results] = await connection.execute(sql, [
       req.body.username,
       req.body.name,
     ])
   
     //results innehåller metadata om vad som skapades i databasen
     console.log(results)
     res.json(results)
   });

   app.post('/login', async function(req, res) {
    //kod här för att hantera anrop…
    let connection = await getConnection(); 

    let sql = 'SELECT * FROM users WHERE username = ?'
    let [results] = await connection.execute(sql, [req.body.username])
    let hashedPasswordFromDB = results[0].password
    // Verifiera hash med bcrypt
    let isPasswordValid = await bcrypt.compare(req.body.password, hashedPasswordFromDB);
    if (isPasswordValid) {
        // Skicka info om användaren, utan känslig info som t.ex. hash
        res.json(results[0].username)
        
      }
   
   });
   




   app.put("/users/:id", async function (req, res) {
    //kod här för att hantera anrop…
    let sql = `UPDATE users
      SET username = ?, password = ?
      WHERE id = ?`
      let connection = await getConnection()

      const salt = await bcrypt.genSalt(10);  // genererar ett salt till hashning
      const hashedPassword = await bcrypt.hash(req.body.password, salt); //hashar lösenordet
      
    

    let [results] = await connection.execute(sql, [
      req.body.username,
      hashedPassword,
      req.params.id,
    ])
    //kod här för att returnera data
    res.json(results)
  })

  
  
const server = http.createServer(app); 

app.post("/test", async (req,res) => {
    console.log(req.body)
})

server.listen(3000, () => {
    console.log('listening on *:3000');
});























// app.post('/users', async function(req, res) {
//     let connection = await getConnection()
//     let sql = `INSERT INTO users (username, name)
//     VALUES (?, ?)`
//     let [results] = await connection.execute(sql, [
//         req.body.username,
//          name,
//     ])
//     res.json(results)
// });



//  // Verifiera hash med bcrypt
//   const isPasswordValid = await bcrypt.compare(req.body.password, hashedPasswordFromDB);

//   if (isPasswordValid) {
//     // Skicka info om användaren, utan känslig info som t.ex. hash
//   } else {
//     // Skicka felmeddelande
//     res.status(400).json({ error: 'Invalid credentials' });
//   }

 // else {res.json({"error":"true"})}

    // Kontrollera att det fanns en user med det username i results
    // res.json(results)

    //  Ditt API ska acceptera POST till minst en route för att skapa nya objekt. De objekten ska skapas i databasen och de ska returneras med det id de fått i databasen och lämplig HTTP-status ska returneras
    //  app.post('/users', async function(req, res) {
    //     let connection = await getConnection()
    //     let sql = `INSERT INTO users (username, name)
    //                     VALUES (?, ?)`
    //                     let [results] = await connection.execute(sql, [
    //                          username,
    //                          name,
    //                     ])
    //                     res.json(results)
    //                 });

                 


              




//    app.post('/users', async function(req, res) {
//     //req.body innehåller det postade datat
//      console.log(req.body)
//     let connection = await getConnection();
//     let sql = `INSERT INTO users (username, name)
//     VALUES (?, ?)`
//     let [results] = await connection.execute(sql, [
//          req.body.username,
//                     req.body.name,
//                   ])
//                   //results innehåller metadata om vad som skapades i databasen
//                   console.log(results)
//                   res.json(results)
//                 });