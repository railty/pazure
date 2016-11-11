'use strict';

var pgPool = require('pg-pool');
var SQLiteResult = require('./SQLiteResult');

var READ_ONLY_ERROR = new Error(
  'could not prepare statement (23 not authorized)');

function PGDatabase(name) {
  this._db = new pgPool(name);
}

function runSelect(db, sql, args, cb) {
  var matches = sql.match(/PRAGMA\s*table_info\((.*)\)\;/);
  if (matches && matches[1]){
    var tableName = matches[1];

    sql = "select ordinal_position as cid, \
    c.column_name as name, \
    data_type as type, \
    case when is_nullable='YES' then 0 else 1 end as notnull, \
    column_default as dflt_value, \
    tc.pk \
    from information_schema.columns c \
    left join (select tc.table_name as table_name, ccu.column_name as column_name, 1 as pk from information_schema.table_constraints tc join information_schema.constraint_column_usage ccu \
	  on tc.table_name=ccu.table_name and tc.constraint_name=ccu.constraint_name) tc \
	  on c.table_name = tc.table_name and c.column_name = tc.column_name \
    where c.table_name='" + tableName + "';"
  }

  db.query(sql, args, function(err, result) {
    if (err) {
      return cb(new SQLiteResult(err));
    }
    var insertId = void 0;
    var rowsAffected = result.rowCount;
    var resultSet = new SQLiteResult(null, insertId, rowsAffected, result.rows);
    cb(resultSet);
  });
}

function runNonSelect(db, sql, args, cb) {
  //console.log(sql);

  db.query(sql, args, function(err, rows) {
    if (err) {
      return cb(new SQLiteResult(err));
    }
    var insertId = 0;
    if (rows.length == 0) insertId = 0;
    var rowsAffected = rows.length;
    var resultSet = new SQLiteResult(null, insertId, rowsAffected, rows);
    cb(resultSet);
  });
}

PGDatabase.prototype.exec = function exec(queries, readOnly, callback) {

  var db = this._db;
  var len = queries.length;
  var results = new Array(len);

  var i = 0;

  function checkDone() {
    if (++i === len) {
      callback(null, results);
    } else {
      doNext();
    }
  }

  function onQueryComplete(i) {
    return function (res) {
      results[i] = res;
      checkDone();
    };
  }

  function doNext() {
    var query = queries[i];
    var sql = query.sql;
    var args = query.args;

    sql = sql.replace(/\[|\]/g, '');
    sql = sql.replace(/@p/g, '$');
    sql = sql.replace(/COLLATE NOCASE/g, '');

    if (sql.search(/\s+OR\s+IGNORE\s+/)!=-1){
      if (sql.split(';').length > 1) {//end with ;
        sql = sql.split(';').slice(0, -1).join(';');
      }
      sql = sql.replace(/OR\s+IGNORE\s+/, '') + ' ON CONFLICT DO NOTHING ;';
    }

    var k = 1;
    while(sql.search(/\s*\?\s*/)!=-1) {sql = sql.replace('?', '$'+k); k++;}
    //console.log(sql);
    //console.dir(args);
    // TODO: It seems like the node-sqlite3 API either allows:
    // 1) all(), which returns results but not rowsAffected or lastID
    // 2) run(), which doesn't return results, but returns rowsAffected and lastID
    // So we try to sniff whether it's a SELECT query or not.
    // This is inherently error-prone, although it will probably work in the 99%
    // case.
    var isSelect = /^\s*SELECT\b/i.test(sql);
    var isTableInfo = /^\s*PRAGMA\s*table_info\b/i.test(sql);

    //console.log("SQL:" + sql);
    if (readOnly && !isSelect) {
      onQueryComplete(i)(new SQLiteResult(READ_ONLY_ERROR));
    } else if (isSelect || isTableInfo) {
      runSelect(db, sql, args, onQueryComplete(i));
    } else {
      runNonSelect(db, sql, args, onQueryComplete(i));
    }
  }

  doNext();
};

module.exports = PGDatabase;
