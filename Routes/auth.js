const router = require("express").Router();
const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const helpers = require('../Helpers/helpers.js');
const mail = require('../Helpers/mailer.js').sendEmail;
const middleware = require('../Helpers/middleware').session;


var con = mysql.createConnection({
  sockePath: "/cloudsql/dbms-256500:asia-east1:dbms",
  user: "root",
  password: "test",
  database: "dbms"
});

con.connect(function (err) {
  if (err) {
    throw err;
  } else {
    con.query("CREATE DATABASE IF NOT EXISTS dbms", function (err, result) {
      if (err) {
        throw err;
      } else {
        console.log("Database linked");
      }
    });
  }
});

router.post('/login', (request, response) => {
  con.query("SELECT * from admin", function (err, result) {
    if (err) {
      response.status(200).json({
        message: 'There was error loggin you in',
      });
    } else {
      for (i = 0; i < result.length; i++) {
        if (result[i].id == request.body.id && result[i].password == request.body.password) {
          const payload = {
            id: request.body.id,
          };
          const token = jwt.sign(payload, process.env.SECRET);
          response.status(200).json({
            token,
            message: 'Success, the password matched successfully',
          });
          return true;
        }
      }
      response.status(200).json({
        message: 'The entered password was incorrect',
      });
    }
  });
});



router.post('/book', middleware, (request, response) => {
  // 1NF - not accepting repetitive values for same Room No

  let sql = `Select * from reservation`;
  con.query(sql, function (err, result) {
    if (err) {
      response.status(200).json({
        message: 'There was error checking for available rooms',
      });
    } else {
      for(i = 0 ; i < result.length; i++){
        if (result[i].ROOM_NO == request.body.roomno){
          response.status(200).json({
            message: 'Selected room number is already booked',
          });
          return true;
        }
      }

      res_id = request.body.roomno + request.body.age*helpers.createPassword(8);
      let sqlq = "INSERT INTO reservation VALUES ('"+request.body.name+"',"+request.body.age+",'"+request.body.gender+"','"+request.body.email+"',"+request.body.roomno+",'"+request.body.from_date+"','"+request.body.to_date+"',"+res_id+")"
      con.query(sqlq, function (err, result) {
        if (err) {
          response.status(200).json({
            message: 'There was error booking your reservation',
            err
          });
        } else {
          let email = `<p>Hi ${request.body.name},</p><p></p><p></p><p></p><p>Thanks for booking with Hotel Taj.</p><p></p><p>Your booking details are: <br>Name : ${request.body.name} <br>From Date : ${request.body.from_date} <br>To Date : ${request.body.to_date} <br>Room Number : ${request.body.roomno}<br> Reservation Id : ${res_id}</p><p>For any assistance reach us out at <a href="mailto:snapnab.dev@gmail.com" style="text-decoration: none">support</a>.<p>Thanks<br>Team Taj</p>`
          if(mail(request.body.email, 'Reservation Confirmation', email)){
            response.status(200).json({
              message: 'Reservation booked, confirmation email sent',
            });
          } else {
            response.status(200).json({
              message: 'Reservation booked, there was error sending email to the user',
            });
          }
        }
      });
    }
  });
});

router.post('/cancel', middleware, (request, response) => {
  let sql = `DELETE FROM reservation WHERE res_id=${request.body.res_id}`;
  con.query(sql, function (err, result) {
    if (err) {
      response.status(200).json({
        message: 'There was error  your reservation',
      });
    } else {
      response.status(200).json({
        message: 'Reservation deleted',
      });
    }
  });
});

router.get('/getreservations', middleware, (request, response) => {
  let sql = `Select * from reservation`;
  con.query(sql, function (err, result) {
    if (err) {
      response.status(200).json({
        message: 'There was error getting the list of reservations',
      });
    } else {
      response.status(200).json({
        data : result
      });
    }
  });
});


module.exports = router;
