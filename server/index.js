const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const axios = require('axios');
const CryptoJS = require('crypto-js');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const corsOptions = {
  origin: 'http://localhost:3000', // Allow only this origin to send requests
  optionsSuccessStatus: 200 // For legacy browser support
};

app.use(cors(corsOptions)); // Use CORS middleware with specified options


const PORT = process.env.SERVERPORT || 8080;

// Establish a connection pool instead of a single connection
// This is more efficient for handling multiple requests
const pool = mysql.createPool({
    connectionLimit : 10, // Depending on your application's needs
    host: process.env.HOST,
    port: process.env.DBPORT,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});


const getUserId = (userHash) => {
  return new Promise((resolve, reject) => {
    // console.log("getUserId from # " + userHash)
    const query = 'SELECT id FROM fmap_user WHERE userHash = ?;'
    pool.query(query, [userHash], (err, results, fields) => {
      if (err) {
        console.error('Query error: ' + err.stack)
        reject('Query execution error');
      } else if (results.length === 0) {
        resolve(0);
      } else {
        // console.log("Raw getUserID results:\n" + JSON.stringify(results))
        resolve(results[0]['id'])
      }
    });
  });
};

async function updateRecordsWithDistance(churchPostcode, records) {
  for (let record of records) {
    await getGoogleDistanceInternal(churchPostcode, record)
    // console.log("Google says:\n" + JSON.stringify(record.distanceText))
  }
}

async function filterRecords(records, searchTradition, searchWorship, searchRadius) {
  const found = records.filter(record => {
    const rowTradition = JSON.parse(record.profileTradition)
    const rowWorship = JSON.parse(record.profileWorship)

    const matchTradition = searchTradition.length > 0 ? rowTradition.some(tradition => searchTradition.includes(tradition)) : true
    const matchWorship = searchWorship.length > 0 ? rowWorship.some(worship => searchWorship.includes(worship)) : true

    return matchTradition && matchWorship && record.distanceValue <= (searchRadius * 1609.34)
  });

  return found
}


async function callGetGoogleDistance(response, results, res) {
  try {
        await updateRecordsWithDistance(response.churchPostcode, results)
          // console.log(`Search Tradition:\n${response.traditionRequired}\nSearch Worship:\n${response.worshipRequired}`)

          const filteredResults = await filterRecords(results, response.traditionRequired, response.worshipRequired, response.searchRadius)
          res.json({status: 'SUCCESS', message: filteredResults})
      } catch (error) {
          console.error('Error in callGetGoogleDistance:', error)
          res.status(500).json({status: 'ERROR', message: 'GetGoogleDistance Error'})
  }
}


async function getGoogleDistanceInternal(destination, item) {
  const apiKey = process.env.CM_GOOGLE_API_KEY
  const origins = encodeURIComponent(item.profilePostcode)
  const destinations = encodeURIComponent(destination)
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${origins}&destinations=${destinations}&key=${apiKey}`

  try {
    const response = await axios.get(url)
    const data = response.data
   

    if (data.rows[0].elements[0].status === "OK") {
      item.distanceText = data.rows[0].elements[0].distance.text
      item.distanceValue = data.rows[0].elements[0].distance.value
      item.durationText = data.rows[0].elements[0].duration.text
      console.log(`Calculating Google Distance between ${origins} and ${destinations} : ${item.distanceText}`)
    } else {
      item.distanceText = 'Unavailable'
      item.distanceValue = 999999999; // Arbitrary high value
      item.durationText = 'Unavailable'
    }
  } catch (error) {
    console.error('Error fetching Google Maps Distance:', error)
    item.distanceText = 'Error'
    item.distanceValue = 999999999 // Error case
    item.durationText = 'Error'
  }

  return item;
}

async function getAvatar(userID, res) {
  try {
    
    
    const query = `SELECT id, userID, profileAvatar FROM fmap_profile WHERE userID = ?;`

    pool.query(query, [userID], (err, results, fields) => {
      if (err) {
          console.error('Query error: ' + err.stack);
          res.json({status: 'FAIL', message: 'Query execution error' })
          return;
      }

      if (results.length === 0) {
          res.json({status: 'FAIL', message: 'User not found' })
      } else {
          
          res.json({status: 'SUCCESS', message: results})
      }
  })

  } catch (error) {
    console.error('Error:', error)
  }
}

async function getProfile(userHash, res) {
  try {
    const userId = await getUserId(userHash)
    
    const query = `SELECT id, userID, userHash, profileTitle, profileFirstName, profileSurname, 
                    profileAddress1, profileAddress2, profileAddress3, profileAddress4, profilePostcode, 
                    profileHomePhone, profileMobile, profileEmail, profileGender, profileSeminary, profileOrdainedBy, 
                    profilePTO, profileWorship, profileTradition, profileRadius, profileFee, profileTravel 
                    FROM fmap_profile WHERE userID = ?;`

    pool.query(query, [userId], (err, results, fields) => {
      if (err) {
          console.error('Query error: ' + err.stack);
          res.json({status: 'FAIL', message: 'Query execution error' })
          return;
      }
      //console.log(results);
      if (results.length === 0) {
          res.json({status: 'FAIL', message: 'User not found' })
      } else {
          //console.log("Profile:\n" + JSON.stringify(results))
          res.json({status: 'SUCCESS', message: results})
      }
  })

  } catch (error) {
    console.error('Error:', error)
  }
}

async function getAvailability(userHash, res) {
  try {
    const userId = await getUserId(userHash)
    
    const query = 'SELECT DISTINCT availableDate FROM fmap_available WHERE userID = ? ORDER BY availableDate ASC;'
    pool.query(query, [userId], (err, results, fields) => {
      if (err) {
          console.error('Query error: ' + err.stack);
          res.json({status: 'FAIL', message: 'Query execution error' })
          return;
      }
      if (results.length === 0) {
          res.json({status: 'FAIL', message: 'User not found' })
      } else {
          res.json({status: 'SUCCESS', message: results})
          
      }
  })

  } catch (error) {
    console.error('Error:', error)
  }
}

async function updateAvailability(userHash, userAvailability, res) {
  const userId = await getUserId(userHash);
  const dateArray = JSON.parse(userAvailability);

  console.log(dateArray);

  const values = dateArray.map(dateObj => [userId, dateObj.availableDate]).flat();
  const placeholders = dateArray.map(() => '(?, ?)').join(', ');

  const query = `INSERT INTO fmap_available (userID, availableDate) VALUES ${placeholders} 
                 ON DUPLICATE KEY UPDATE availableDate=VALUES(availableDate);`;

  pool.query(query, values, (err, results) => {
      if (err) {
          console.error('Error executing query:', err);
          res.status(500).json({status: 'ERROR', message: 'Error updating availability'});
          return;
      }
      res.json({status: 'SUCCESS', message: 'Availability Updated'});
  });
};

function generatePass(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$_*!-';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

async function registerUser(data, res) {
  try {
      const { userName, passwordHash, userPrivilege } = data
      const verify = generatePass(30)
      const sql = "INSERT INTO fmap_user (eMail, passwordHash, userPrivilege, userHash) VALUES (?, ?, ?, ?)"
      
      pool.query(sql, [userName, passwordHash, userPrivilege, verify], (err, results) => {
          if (err) {
              console.error('Could not insert data:', err)
              res.status(400).json({
                  status: 'FAIL',
                  message: 'Could not insert data'
              });
              return;
          }
          console.log("User Registration:\nSUCCESS", verify)
          res.status(200).json({
              status: 'SUCCESS',
              message: verify
          });
      });
  } catch (error) {
      console.error('Failure to connect to database or execute query:', error);
      res.status(400).json({
          status: 'FAIL',
          message: 'Could not connect to database or execute query'
      });
  }
}

  async function updateProfile(profile, res) {
    try {
      const userId = await getUserId(profile.userHash)
      
      const query = `UPDATE fmap_profile SET userHash = ?, profileTitle = ?, profileFirstName = ?, profileSurname = ?,
      profileAddress1 = ?, profileAddress2 = ?, profileAddress3 = ?, profileAddress4 = ?, profilePostcode = ?, 
      profileHomePhone = ?, profileMobile = ?, profileEmail = ?, profileAvatar = ?, profileGender = ?,
      profileSeminary = ?, profileOrdainedBy = ?, profilePTO = ?, profileWorship = ?, profileTradition = ?,
      profileRadius = ?, profileTravel = ?, profileFee = ? WHERE userID = ?;`
      pool.query(query, [profile.userHash, profile.profileTitle, profile.profileFirstName, profile.profileSurname,
        profile.profileAddress1, profile.profileAddress2, profile.profileAddress3, profile.profileAddress4, profile.profilePostcode, 
        profile.profileHomePhone, profile.profileMobile, profile.profileEmail, profile.profileAvatar, profile.profileGender,
        profile.profileSeminary, profile.profileOrdainedBy, profile.profilePTO, profile.profileWorship, profile.profileTradition,
        profile.profileRadius, profile.profileTravel, profile.profileFee, userId], (err, results, fields) => {
        if (err) {
            console.error('Query error: ' + err.stack);
            res.json({status: 'FAIL', message: 'Query execution error' })
            return;
        }
  
            res.json({status: 'SUCCESS', message: 'Profile Updated'})
        
  
      })
    } catch (error) {
      console.error('Profile Update Error:', error)
    }}


function changePassword(response, res) {

  const query = `UPDATE fmap_user SET passwordHash = ? WHERE eMail = ?`

  pool.query(query, [response.passwordHash, response.userName], (err, results, fields) => {
      if (err) {
          console.error('Error executing query:', err)
          res.status(500).json({status: 'ERROR', message: 'Error updating password'})
          return
      }
      console.log(`Password change:\neMail: ${response.userName} passwordHash: ${response.passwordHash}`)
      res.json({status: 'SUCCESS', message: 'Password Updated'})
  });
}    

// ROUTING

app.get("/", (req, res) => {
    res.json({status: 'SUCCESS', message: "Back End Found" })
});

app.post('/login', function (req, res) {
    const response = {
       eMail: req.body.userName,
       passwordHash: req.body.passwordHash
    };
    
    const query = 'SELECT userPrivilege, userHash FROM fmap_user WHERE eMail = ? AND passwordHash = ?;';
    pool.query(query, [response.eMail, response.passwordHash], (err, results, fields) => {
        if (err) {
            console.error('Query error: ' + err.stack);
            res.json({status: 'FAIL', message: 'Query execution error' });
            return;
        }
      
        if (results.length === 0) {
            res.json({status: 'FAIL', message: 'User not found' });
        } else {
            res.json({status: 'SUCCESS', message: results[0]['userHash']});
        }
    });
});

app.post('/register', function (req, res) {
  const response = {
    userName: req.body.userName,
    passwordHash: req.body.passwordHash,
    userPrivilege: 1,
  }

  console.log("Received for Registration:\n"+ JSON.stringify(response))
  registerUser(response,res)

})


app.post('/search', function (req, res) {
  const response = {
    dateRequired: req.body.dateRequired, 
    worshipRequired: req.body.worshipRequired, 
    traditionRequired: req.body.traditionRequired, 
    searchRadius: req.body.searchRadius,
    churchPostcode: req.body.churchPostcode 
  };

 
  try {
    
    const query = `SELECT DISTINCT fmap_available.availableDate, fmap_profile.id, 
                    fmap_profile.userID, 
                    fmap_profile.userHash, 
                    fmap_profile.profileTitle, 
                    fmap_profile.profileFirstName, 
                    fmap_profile.profileSurname, 
                    fmap_profile.profileAddress1, 
                    fmap_profile.profileAddress2, 
                    fmap_profile.profileAddress3, 
                    fmap_profile.profileAddress4, 
                    fmap_profile.profilePostcode, 
                    fmap_profile.profileHomePhone, 
                    fmap_profile.profileMobile, 
                    fmap_profile.profileEmail, 
                    fmap_profile.profileGender, 
                    fmap_profile.profileSeminary, 
                    fmap_profile.profileOrdainedBy, 
                    fmap_profile.profilePTO, 
                    fmap_profile.profileWorship, 
                    fmap_profile.profileTradition, 
                    fmap_profile.profileRadius, 
                    fmap_profile.profileFee, 
                    fmap_profile.profileTravel
                   FROM fmap_available 
                   INNER JOIN fmap_profile ON fmap_available.userID = fmap_profile.userID 
                   WHERE fmap_available.availableDate = ?;`

    pool.query(query, [response.dateRequired], (err, results, fields) => {
      if (err) {
          console.error('Query error: ' + err.stack)
          res.json({status: 'FAIL', message: 'Query execution error' })
          return
      }
      //console.log(results);
      if (results.length === 0) {
          res.json({status: 'FAIL', message: 'No matches Found for that date' })
      } else {

        console.log(`Found ${results.length} matches based on date:\n${JSON.stringify(results)}`)

        callGetGoogleDistance(response, results, res)
       
      }
  })

  } catch (error) {
    console.error('Error:', error)
  }

});

app.post('/changePassword', function (req, res) {
  const response = {
     userName: req.body.userName,
     passwordHash: req.body.passwordHash
  };

  changePassword(response, res);
});

app.post('/getProfile', function (req, res) {
  const response = {
     userHash: req.body.userHash
  };

  getProfile(response.userHash, res);
});

app.post('/getAvatar', function (req, res) {
  const response = {
     userID: req.body.userID
  };

  getAvatar(response.userID, res);
});

app.get('/a', function (req, res) {
  const response = {
     userHash: req.query.ck
  };

  console.log("Authorising user based on userHash: " + response.userHash)

  const query = 'UPDATE fmap_user SET userPrivilege = ? WHERE userHash = ?;';
  pool.query(query, [2, response.userHash], (err, results, fields) => {
      if (err) {
          console.error('Query error: ' + err.stack);
          res.json({status: 'FAIL', message: 'Query execution error' });
          return;
      }

          res.redirect(process.env.CM_WEBSITE);
          
})}); 

app.post('/forgotPassword', function (req, res) {
  const response = {
    userMail: req.body.userMail
  }
  const newPasswordHash=generatePass(30)

  const query = "UPDATE fmap_user SET userHash = ? WHERE eMail = ?";

  pool.query(query, [newPasswordHash, response.userMail], (err, results, fields) => {
    if (err) {
        console.error('Query error: ' + err.stack)
        res.json({status: 'FAIL', message: 'Query execution error' })
        return;
    }

    res.json({status: 'SUCCESS', message: newPasswordHash})
})
})

app.get('/reset', function (req, res) {
  const response= {
    userHash: req.query.ck
  }

  const query = 'SELECT userHash FROM fmap_user WHERE userHash = ?;'
  pool.query(query, [response.userHash], (err, results, fields) => {
      if (err) {
          console.error('Query error: ' + err.stack)
          res.json({status: 'FAIL', message: 'Query execution error' })
          return
      }
    
      if (results.length === 0) {
          res.json({status: 'FAIL', message: 'User not found' })
      } else {
            const encryptedMessage = encodeURIComponent(CryptoJS.AES.encrypt(results[0].userHash, process.env.CM_SECRET).toString())
            console.log(`Reset response:\n${JSON.stringify(results)} to ${results[0].userHash} encoded to ${encryptedMessage}`)
            res.redirect(process.env.CM_WEBSITE + `?a=cp&user=${encryptedMessage}`)
        }
})
})

app.post('/emS', function (req, res) {

  let ElasticEmail = require('@elasticemail/elasticemail-client')
 
  let defaultClient = ElasticEmail.ApiClient.instance
   
  let apikey = defaultClient.authentications['apikey']
  apikey.apiKey = process.env.CM_EMAIL_API
   
  let api = new ElasticEmail.EmailsApi()
   
  let email = ElasticEmail.EmailMessageData.constructFromObject({
    Recipients: [
      new ElasticEmail.EmailRecipient(req.body.To)
    ],
    Content: {
      Body: [
        ElasticEmail.BodyPart.constructFromObject({
          ContentType: "HTML",
          Content: req.body.Body
        })
      ],
      Subject: req.body.Subject,
      From: "simon@codemonkey.design"
    }
  })
   
  var callback = function(error, data, response) {
    if (error) {
      console.error(error)
    } else {
      console.log(`Email sent to ${req.body.To} about ${req.body.Subject}`)
      res.json({status: 'SUCCESS', message: req.body.To})
    }
  }
  api.emailsPost(email, callback)
  

})   

app.post('/getAvailability', function (req, res) {
  const response = {
     userHash: req.body.userHash
  };

  getAvailability(response.userHash, res)
})

app.post('/updateAvailability', function (req, res) {
  const response = {
     userHash: req.body.userHash,
     userAvailability: req.body.userAvailability
  };
  // console.log("Received at getProfile:\n" + JSON.stringify(response)); 
  updateAvailability(response.userHash, response.userAvailability, res);
});

app.post('/updateProfile', function (req, res) {
  const response = {
                userHash: req.body.userHash,
                profileTitle:req.body.profileTitle,
                profileFirstName: req.body.profileFirstName,
                profileSurname: req.body.profileSurname,
                profileAddress1: req.body.profileAddress1,
                profileAddress2: req.body.profileAddress2,
                profileAddress3: req.body.profileAddress3,
                profileAddress4: req.body.profileAddress4,
                profilePostcode: req.body.profilePostcode,
                profileHomePhone: req.body.profileHomePhone,
                profileMobile: req.body.profileMobile,
                profileEmail: req.body.profileEmail,
                profileAvatar: req.body.profileAvatar,
                profileGender: req.body.profileGender,
                profileSeminary: req.body.profileSeminary,
                profileOrdainedBy: req.body.profileOrdainedBy,
                profilePTO: req.body.profilePTO,
                profileWorship: req.body.profileWorship,
                profileTradition: req.body.profileTradition,
                profileFee: req.body.profileFee,
                profileTravel: req.body.profileTravel,
                profileRadius:req.body.profileRadius
  };
  // console.log("Received at getProfile:\n" + JSON.stringify(response)); 
  updateProfile(response, res);
});

app.listen(PORT, () => console.log('Server running on Port ' + PORT));
