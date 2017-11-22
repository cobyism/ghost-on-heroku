#!/usr/bin/env node

var mysql      = require('mysql');
var envValues  = require('./common/env-values');

console.error(`Awaiting MySQL database…`);
pingDatabaseUntilConnected();

function pingDatabaseUntilConnected() {
  var connection = mysql.createConnection(envValues.mysqlDatabaseUrl);
  connection.query('SELECT 1', function (error, results, fields) {
    if (error) {
      console.error(`Database not yet available: ${error.message}`);
      setTimeout(pingDatabaseUntilConnected, 5000);
    } else {
      console.error('Database connected.');
      connection.end();
      process.exit(0);
    }
  });
}
