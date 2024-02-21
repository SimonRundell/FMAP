const mysql = require('mysql');

const connection = mysql.createConnection({
  host: '"localhost:3306',
  user: 'dh_76zuga',
  password: 'f3oHCjb7',
  database: 'fmap'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting: ' + err.stack);
    return;
  }

  console.log('Connected as id ' + connection.threadId);

  connection.query('SELECT * FROM fmap_profile', (err, results, fields) => {
    if (err) throw err;

    console.log('Results: ', results);
    // Process the results here
  });

  connection.end((err) => {
    // The connection is terminated now
  });
});
