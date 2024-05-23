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






















// Försök på MVG:

// JWT token:

const jwT = require('jsonwebtoken');

// Hemlig nyckel för att signera och verifiera JWT
const JWt_SECRET = 'your_secret_key'; 

app.post('/login', async function(req, res) {
    let connection = await getConnection(); 

    let sql = 'SELECT * FROM users WHERE username = ?';
    let [results] = await connection.execute(sql, [req.body.username]);
    let hashedPasswordFromDB = results[0].password;

    let isPasswordValid = await bcrypt.compare(req.body.password, hashedPasswordFromDB);
    
    if (isPasswordValid) {
        // Skapa en JWT med användarinformation
        const token = jwT.sign({ username: results[0].username }, JWt_SECRET, { expiresIn: '1h' });

        res.json({ token: token });
    } else {
        res.status(401).json({ message: 'Invalid username or password' });
    }
});



// Fel returneras med lämplig HTTP-status:

const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your_secret_key'; 

function verifyToken(req, res, next) {
  const token = req.headers['authorization'];

  // Kontrollera om token saknas
  if (!token) {
    return res.status(401).json({ message: 'Token is missing' });
  }

  // Verifiera token
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = decoded;
    next(); 
  });
}

app.get('/users', verifyToken, async function(req, res) {
});

app.get('/users/:id', verifyToken, async function(req, res) {
});

app.put("/users/:id", verifyToken, async function (req, res) {
});

app.post('/login', async function(req, res) {

  if (isPasswordValid) {
    let token = jwt.sign({ username: results[0].username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token: token });
  } else {
    res.status(401).json({ message: 'Invalid username or password' });
  }
});
