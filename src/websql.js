'use strict';
import immediate from 'immediate';

function openDatabase(options, success_callback, error_callback) {
  function createDb(dbName, dbVersion) {
    var database;
    if (dbName.adapter == 'sqlite3'){
      var SQLiteDatabase = require('./SQLiteDatabase');
      database = new SQLiteDatabase(dbName.database);
    }else if (dbName.adapter == 'pg'){
      var PGDatabase = require('./PGDatabase');
      database = new PGDatabase(dbName);
    }

    var WebSQLDatabase = require('./WebSQLDatabase');
    return new WebSQLDatabase(dbVersion, database);
  }

  var dbName = options.name;
  var location = options.location;

  var db = createDb(dbName);

  immediate(function () {
    success_callback(db);
  });

  return db;
}

export { openDatabase };
