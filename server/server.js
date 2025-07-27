const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const mysql = require('mysql2');
const axios = require('axios');
const CryptoJS = require('crypto-js');

fs.readFile('config.json', 'utf8', (err, jsonString) => {
  if (err) {
      console.log("Error reading file from disk:", err);
      return;
  }
  try {
      const config = JSON.parse(jsonString);
      console.log("Host is:", config.HOST);
      console.log("Database port is:", config.DBPORT);
      // ... and so on for the other config values
  } catch(err) {
      console.log('Error parsing JSON string:', err);
  }
});

// HTTPS options 

// Initialize HTTP server with the Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: '*', // Adjust if your front-end origin is different
  optionsSuccessStatus: 200
}));

// Create HTTPS server with the Express app and credentials
const server = http.createServer(app);

// Create a WebSocket server
const wss = new WebSocket.Server({ port: config.SOCKETPORT });

// Global variable to store sockets
let ws = null;
wss.on('connection', (websocket) => {
    ws = websocket;
    console.log(`Websocket connected on ${config.SOCKETPORT}`);

// routing for websocket connections
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);

  console.log('Received message:', message);

  switch (message.type) {
      case 'userID':
          // do nothing yet
          break;
      case 'message':
           //do nothing yet
      break;
      case 'broadcast':
          // Broadcast the message to all connected clients
          wss.clients.forEach(client => {
              if (client.readyState === websocket.OPEN) {
                  client.send(JSON.stringify(message));
              }
          });
          break;
      default:
          setError(`Unknown message type: ${message.type}`);
  }
}});

const PORT = config.SERVERPORT;
server.listen(PORT, () => {
  console.log(`Node Server running on port ${PORT}`);
});

const pool = mysql.createPool({
    connectionLimit : 30, 
    host: config.HOST,
    port: config.DBPORT,
    user: config.USER,
    password: config.PASSWORD,
    database: config.DATABASE,
    connectTimeout: 50000,
});

//manage extra slash in url
app.use((req, res, next) => {
  req.url = req.url.replace(/\/{2,}/g, '/');
  next();
});

const getUserId = (userHash) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT id FROM fmap_user WHERE userHash = ?;'
    pool.query(query, [userHash], (err, results, fields) => {
      if (err) {
        console.error('Query error: ' + err.stack)
        reject('Query execution error ' + err.stack);
      } else if (results.length === 0) {
        resolve(0);
      } else {
        resolve(results[0]['id'])
      }
    });
  });
};

// calculate distance between 2 points based upon Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {

  // console.log(`Pt1: ${lat1}, ${lon1} Pt2: ${lat2}, ${lon2}`)
  const R = 3958.8; // Radius of the Earth in miles
  const radLat1 = Math.PI * lat1 / 180; // Convert degrees to radians
  const radLat2 = Math.PI * lat2 / 180; // Convert degrees to radians
  const deltaLat = radLat2 - radLat1; // Delta latitude in radians
  const deltaLon = Math.PI * (lon2 - lon1) / 180; // Delta longitude in radians

  // Haversine formula
  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(radLat1) * Math.cos(radLat2) *
            Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in miles
  // console.log(`Calculated Distance: ${distance}`)
  return distance.toFixed(1);
}

function filterAndAddDistance(found, churchLat, churchLong, searchRadius) {
  // First, map over the array to add a 'distance' property to each item
  const withDistance = found.map(foundItem => {
    const distance = calculateDistance(churchLat, churchLong, foundItem.profileLat, foundItem.profileLong);
    return {
      ...foundItem, // Spread the original foundItem properties
      distance // Add the calculated distance in miles
    };
  });

  // Then, filter the modified array to keep only items within the searchRadius
  const foundWithinDistance = withDistance.filter(foundItem => foundItem.distance <= searchRadius);

  return foundWithinDistance;
}

function filterRecords(records, searchTradition, searchWorship, churchLat, churchLong, searchRadius) {

  const found = records.filter(record => {
    const rowTradition = JSON.parse(record.profileTradition)
    const rowWorship = JSON.parse(record.profileWorship)
    // console.log(`This record: ${record.profileLat}, ${record.profileLong}`)

    const matchTradition = searchTradition.length > 0 ? rowTradition.some(tradition => searchTradition.includes(tradition)) : true
    const matchWorship = searchWorship.length > 0 ? rowWorship.some(worship => searchWorship.includes(worship)) : true
    return matchTradition && matchWorship
  });

  console.log(`Reduced down to ${found.length} matches based on tradition and service`)

  // now calculate distances and filter by range
  const foundWithinDistance = filterAndAddDistance(found, churchLat, churchLong, searchRadius);

  console.log(`Reduced down to ${foundWithinDistance.length} matches based on distance`)
  //return dataset sorted in ascending order
  return foundWithinDistance.sort((a, b) => a.distance - b.distance);;
}

async function getAvatar(userID, res) {
  try {
       
    const query = `SELECT id, userID, profileAvatar FROM fmap_profile WHERE userID = ?;`
    pool.query(query, [userID], (err, results, fields) => {
      if (err) {
          console.error('Query error: ' + err.stack);
          res.json({status: 'FAIL', message: 'Query execution error', error: err.stack })
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

async function insertBlankProfile(userId) {
  const query = `INSERT INTO fmap_profile(userID) VALUES (?);`

pool.query(query, [userId], (err, results, fields) => {
if (err) {
console.error('Query error: ' + err.stack);
return;
}})

}

async function getProfile(userHash, res) {
  try {
    const userId = await getUserId(userHash)
    
    const query = `SELECT id, userID, userHash, profileTitle, profileFirstName, profileSurname, 
                    profileAddress1, profileAddress2, profileAddress3, profileAddress4, profilePostcode,
                    profileLat, profileLong, 
                    profileHomePhone, profileMobile, profileEmail, profileGender, profileAvatar, profileSeminary, profileOrdainedBy, 
                    profilePTO, profileWorship, profileTradition, profileRadius, profileFee, profileTravel 
                    FROM fmap_profile WHERE userID = ?;`

    pool.query(query, [userId], (err, results, fields) => {
      if (err) {
          console.error('Query error: ' + err.stack);
          res.json({status: 'FAIL', message: 'Query execution error', error: err.stack })
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
          res.json({status: 'FAIL', message: 'Query execution error', error: err.stack })
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

async function getLastUID() {
  try {
        
    const query = 'SELECT LAST userID FROM fmap_user ASC;'
    pool.query(query, null, (err, results, fields) => {
      if (err) {
          console.error('Query error: ' + err.stack);
          return;
      }
      if (results.length === 0) {
          return 0
      } else {
        console.log(`Last UID us ${results}`)
          return results
      
  }})
  
  } catch (error) {
    console.error('Error:', error)
  }
}

async function updateAvailability(userHash, userAvailability, res) {
  const userId = await getUserId(userHash);
  const dateArray = JSON.parse(userAvailability);

  // console.log(dateArray);

  const values = dateArray.map(dateObj => [userId, dateObj.availableDate]).flat();
  const placeholders = dateArray.map(() => '(?, ?)').join(', ');

  const query = `INSERT INTO fmap_available (userID, availableDate) VALUES ${placeholders} 
                 ON DUPLICATE KEY UPDATE availableDate=VALUES(availableDate);`;

  pool.query(query, values, (err, results) => {
      if (err) {
          console.error('Error executing query:', err);
          res.status(500).json({status: 'ERROR', message: 'Error updating availability', error: err});
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
          // console.log("User Registration:\nSUCCESS", verify)
          const newUserId = getLastUID()

          insertBlankProfile(newUserId)

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
      profileLat = ?, profileLong = ?, 
      profileHomePhone = ?, profileMobile = ?, profileEmail = ?, profileAvatar = ?, profileGender = ?,
      profileSeminary = ?, profileOrdainedBy = ?, profilePTO = ?, profileWorship = ?, profileTradition = ?,
      profileRadius = ?, profileTravel = ?, profileFee = ? WHERE userID = ?;`
      pool.query(query, [profile.userHash, profile.profileTitle, profile.profileFirstName, profile.profileSurname,
        profile.profileAddress1, profile.profileAddress2, profile.profileAddress3, profile.profileAddress4, profile.profilePostcode, 
        profile.profileLat, profile.profileLong,
        profile.profileHomePhone, profile.profileMobile, profile.profileEmail, profile.profileAvatar, profile.profileGender,
        profile.profileSeminary, profile.profileOrdainedBy, profile.profilePTO, profile.profileWorship, profile.profileTradition,
        profile.profileRadius, profile.profileTravel, profile.profileFee, userId], (err, results, fields) => {
        if (err) {
            console.error('Query error: ' + err.stack);
            res.json({status: 'FAIL', message: 'Query execution error', error: err.stack })
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
          res.status(500).json({status: 'ERROR', message: 'Error updating password', error: err})
          return
      }
      // console.log(`Password change:\neMail: ${response.userName} passwordHash: ${response.passwordHash}`)
      res.json({status: 'SUCCESS', message: 'Password Updated'})
  });
}    

// ROUTING

app.get("/", (req, res) => {
    res.json({status: 'SUCCESS', message: "Find Me a Priest is running..." })
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
            res.json({status: 'FAIL', message: 'Query execution error', error: err.stack });
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

  // console.log("Received for Registration:\n"+ JSON.stringify(response))
  registerUser(response,res)

})


app.post('/search', function (req, res) {
  const response = {
      dateRequired: req.body.dateRequired,
      worshipRequired: req.body.worshipRequired,
      traditionRequired: req.body.traditionRequired,
      churchLat: req.body.churchLat,
      churchLong: req.body.churchLong,
      searchRadius: req.body.searchRadius,
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
                      fmap_profile.profileLat,
                      fmap_profile.profileLong,
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
                      WHERE fmap_available.availableDate = ?`;

      pool.query(query, [response.dateRequired], (err, results, fields) => {
          if (err) {
              console.error('Query error: ' + err.stack);
              res.json({ status: 'FAIL', message: 'Query execution error', error: err.stack });
              return;
          }
          if (results.length === 0) {
              res.json({ status: 'FAIL', message: 'No matches Found for that date' });
          } else {
              console.log(`Found ${results.length} matches based on date`);
              // Synchronously call filterRecords and handle the result
              const filteredRecords = filterRecords(results, response.traditionRequired, response.worshipRequired, response.churchLat, response.churchLong, response.searchRadius);
              
              if (filteredRecords.length > 0) {
                // Ensure the structure here aligns with what you expect on the frontend
                res.json({ status: 'SUCCESS', data: filteredRecords }); // Use 'data' for the actual payload
              } else {
                res.json({ status: 'FAIL', message: 'No matches found after applying filters' });
              }
          }
      });
  } catch (error) {
      console.error('Error:', error);
      res.json({ status: 'FAIL', message: 'Server error', error: error.toString() });
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

  // console.log("Authorising user based on userHash: " + response.userHash)

  const query = 'UPDATE fmap_user SET userPrivilege = ? WHERE userHash = ?;';
  pool.query(query, [2, response.userHash], (err, results, fields) => {
      if (err) {
          console.error('Query error: ' + err.stack);
          res.json({status: 'FAIL', message: 'Query execution error', error: err.stack });
          return;
      }

          res.redirect(config.CM_WEBSITE);
          
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
        res.json({status: 'FAIL', message: 'Query execution error', error: err.stack })
        return;
    }

    res.json({status: 'SUCCESS', message: newPasswordHash})
})
})

app.get('/test', function(req, res) {

  const query = 'SELECT * FROM fmap_user;'
  pool.query(query, [], (err, results, fields) => {
      if (err) {
          console.error('Query error: ' + err.stack)
          res.json({status: 'FAIL', message: 'Query execution error', error: err.stack })
          return
      }
    
      if (results.length === 0) {
          res.json({status: 'FAIL', message: 'User not found' })
      } else {
            res.json({status: 'SUCCESS', message: `The API actually works and returned ${results.length} records` })
        }
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
          res.json({status: 'FAIL', message: 'Query execution error', error: err.stack })
          return
      }
    
      if (results.length === 0) {
          res.json({status: 'FAIL', message: 'User not found' })
      } else {
            const encryptedMessage = encodeURIComponent(CryptoJS.AES.encrypt(results[0].userHash, config.CM_SECRET).toString())
            // console.log(`Reset response:\n${JSON.stringify(results)} to ${results[0].userHash} encoded to ${encryptedMessage}`)
            res.redirect(config.CM_WEBSITE + `?a=cp&user=${encryptedMessage}`)
        }
})
})

app.post('/emS', function (req, res) {

  let ElasticEmail = require('@elasticemail/elasticemail-client')
 
  let defaultClient = ElasticEmail.ApiClient.instance
   
  let apikey = defaultClient.authentications['apikey']
  apikey.apiKey = config.CM_EMAIL_API
   
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
      // console.log(`Email sent to ${req.body.To} about ${req.body.Subject}`)
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
                profileLat: req.body.profileLat,
                profileLong: req.body.profileLong,
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

// app.post('/getDistanceMatrix', async (req, res) => {
//   const { origins, destinations, apiKey } = req.body;

//   try {
//     const response = await axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json`, {
//       params: {
//         units: 'imperial',
//         origins,
//         destinations,
//         key: apiKey
//       }

//     });
//     res.json(response.data);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error fetching data from Google Maps API' });
//   }
// });

app.post('/getClergyRegister', async function (req, res) {
  const payload = {
     memberName: req.body.memberName,
  };
  console.log(`Searching Clergy Register for ${payload.memberName}`);
    try {
      const response = await axios.get(`https://www.churchofengland.org/about/national-register-clergy?member_name=${encodeURIComponent(payload.memberName)}`);
      res.json(response.data);
    } catch (error) {
      console.error('Error fetching clergy data:', error);
      res.status(500).json({ message: 'Error fetching data from National Clergy Register' });
    } 
}); 

app.post('/verify-captcha', async (req, res) => {
  const userResponse = req.body.captchaValue;
  const secretKey = config.CAPTCHA_SECRET;
  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${userResponse}`;

  try {
    const response = await axios.post(verifyUrl);
    const data = response.data;
    if (data.success) {
      const response = {
        userName: req.body.userName,
        passwordHash: req.body.passwordHash,
        userPrivilege: 1,
      }
    
      // console.log("Received for Registration:\n"+ JSON.stringify(response))
      registerUser(response,res)

    } else {
      res.json({status: 'FAIL', message : "reCaptcha failed. Are you human?"})
    }
  } catch (error) {
    console.error("Error verifying CAPTCHA:", error);
  }
});

app.post('/checkLoginName', function (req, res) {
  const response = {
     checkEmail: req.body.checkEmail,
  };

  const query = 'SELECT id FROM fmap_user WHERE eMail  = ?;'
  pool.query(query, [response.checkEmail], (err, results, fields) => {
      if (err) {
          console.error('Query error: ' + err.stack)
          res.json({status: 'FAIL', message: 'Query execution error', error: err.stack })
          return
      }
    console.log(`found ${results.length} records`); 
      if (results.length === 0) {
          res.json({status: 'SUCCESS', message: 'That name is unique' })
          console.log("...so sending back success")
      } else {
        res.json({status: 'FAIL', message: 'eMail Exists' }) 
        console.log("...so sending back failure")
        }
})
 
}); 

app.post('/updateLatLong', function (req, res) {
  const response = {
     postcode: req.body.profilePostcode,
  };

  const query = 'SELECT * FROM postcode_geodata WHERE pcds=?;'
  pool.query(query, [response.postcode], (err, results, fields) => {
      if (err) {
          console.error('Query error: ' + err.stack)
          res.json({status: 'FAIL', message: 'Postcode Query execution error', error: err.stack })
          return
      }
    console.log(`found ${results.length} records`); 
      if (results.length === 0) {
          res.json({status: 'FAIL', message: 'Unknown Postcode' })
      } else {
        res.json({status: 'SUCCESS', message: results }) 
        }
})
 
}); 

