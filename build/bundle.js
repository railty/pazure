/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(1);
	module.exports = __webpack_require__(2);


/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = require("babel-polyfill");

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Pazure = undefined;
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _xmlhttprequest = __webpack_require__(3);
	
	var _xmlhttprequest2 = _interopRequireDefault(_xmlhttprequest);
	
	var _websql = __webpack_require__(4);
	
	var _immediate = __webpack_require__(5);
	
	var _immediate2 = _interopRequireDefault(_immediate);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Pazure = function () {
	  function Pazure(option) {
	    _classCallCheck(this, Pazure);
	
	    this.option = option;
	
	    global.cordova = { version: global.process.versions.node };
	    global.XMLHttpRequest = _xmlhttprequest2.default.XMLHttpRequest;
	    global.window = { sqlitePlugin: { openDatabase: _websql.openDatabase } };
	
	    //cannot import this at the global level, because this is loaded dynamicly, according to if cordova is set
	    this.WindowsAzure = __webpack_require__(16);
	    this.client = new this.WindowsAzure.MobileServiceClient(option.azureConnStr);
	  }
	
	  _createClass(Pazure, [{
	    key: "push",
	    value: function push() {
	      return this.syncContext.push();
	    }
	  }, {
	    key: "getRecordCount",
	    value: function getRecordCount() {
	      var promise_resolve,
	          promise_reject,
	          p = new Promise(function (resolve, reject) {
	        promise_resolve = resolve;promise_reject = reject;
	      });
	      this.read().then(function (items) {
	        promise_resolve(items.length);
	      });
	      return p;
	    }
	  }, {
	    key: "clear",
	    value: function clear() {
	      var promise_resolve,
	          promise_reject,
	          p = new Promise(function (resolve, reject) {
	        promise_resolve = resolve;promise_reject = reject;
	      });
	      this.read().then(function (items) {
	        //this only works for small dataset, for testing is ok
	        //for large dataset need to partation them and delete by block
	        var n = items.length;
	        if (n == 0) {
	          (0, _immediate2.default)(function () {
	            promise_resolve(0);
	          });
	        } else {
	          var i = 0;
	          items.map(function (item) {
	            //console.log("delete "+item.id);
	            this.del({ id: item.id }).then(function () {
	              i++;
	              if (i == n) promise_resolve(n);
	            });
	          }.bind(this));
	        }
	      }.bind(this));
	
	      return p;
	    }
	  }, {
	    key: "getOfflineTable",
	    value: function getOfflineTable(tableOption) {
	      this.tableOption = tableOption;
	      this.store = new this.WindowsAzure.MobileServiceSqliteStore(this.option.localStoreConfig);
	      this.store.defineTable(this.tableOption);
	      this.syncContext = this.client.getSyncContext();
	
	      var promise_resolve,
	          promise_reject,
	          p = new Promise(function (resolve, reject) {
	        promise_resolve = resolve;promise_reject = reject;
	      });
	
	      this.syncContext.initialize(this.store).then(function () {
	        console.log("initialize success");
	
	        var table = this.client.getSyncTable(this.tableOption.name);
	        if (typeof table.getRecordCount == "undefined") table.getRecordCount = this.getRecordCount;
	        if (typeof table.clear == "undefined") table.clear = this.clear;
	        if (typeof table.sync == "undefined") table.sync = this.sync;
	
	        this.syncContext.pushHandler = {
	          onConflict: function onConflict(serverRecord, clientRecord, pushError) {
	            console.log("Sync conflict! " + pushError.getError().message);
	            pushError.cancelAndDiscard();
	          },
	          onError: function onError(pushError) {
	            console.log("Sync error! " + pushError.getError().message);
	          }
	        };
	
	        promise_resolve(table);
	      }.bind(this));
	
	      return p;
	    }
	  }, {
	    key: "getOnlineTable",
	    value: function getOnlineTable(tableName) {
	      var table = this.client.getTable(tableName);
	      if (typeof table.getRecordCount == "undefined") table.getRecordCount = this.getRecordCount;
	      if (typeof table.clear == "undefined") table.clear = this.clear;
	      return table;
	    }
	  }]);
	
	  return Pazure;
	}();
	
	exports.Pazure = Pazure;
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = require("xmlhttprequest");

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.openDatabase = undefined;
	
	var _immediate = __webpack_require__(5);
	
	var _immediate2 = _interopRequireDefault(_immediate);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function openDatabase(options, success_callback, error_callback) {
	  function createDb(dbName, dbVersion) {
	    var database;
	    if (dbName.adapter == 'sqlite3') {
	      var SQLiteDatabase = __webpack_require__(6);
	      database = new SQLiteDatabase(dbName.database);
	    } else if (dbName.adapter == 'pg') {
	      var PGDatabase = __webpack_require__(9);
	      database = new PGDatabase(dbName);
	    }
	
	    var WebSQLDatabase = __webpack_require__(11);
	    return new WebSQLDatabase(dbVersion, database);
	  }
	
	  var dbName = options.name;
	  var location = options.location;
	
	  var db = createDb(dbName);
	
	  (0, _immediate2.default)(function () {
	    success_callback(db);
	  });
	
	  return db;
	}
	
	exports.openDatabase = openDatabase;

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = require("immediate");

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var sqlite3 = __webpack_require__(7);
	var SQLiteResult = __webpack_require__(8);
	
	var READ_ONLY_ERROR = new Error('could not prepare statement (23 not authorized)');
	
	function SQLiteDatabase(name) {
	  this._db = new sqlite3.Database(name);
	}
	
	function runSelect(db, sql, args, cb) {
	  db.all(sql, args, function (err, rows) {
	    if (err) {
	      return cb(new SQLiteResult(err));
	    }
	    var insertId = void 0;
	    var rowsAffected = 0;
	    var resultSet = new SQLiteResult(null, insertId, rowsAffected, rows);
	    cb(resultSet);
	  });
	}
	
	function runNonSelect(db, sql, args, cb) {
	  db.run(sql, args, function (err) {
	    if (err) {
	      return cb(new SQLiteResult(err));
	    }
	    /* jshint validthis:true */
	    var executionResult = this;
	    var insertId = executionResult.lastID;
	    var rowsAffected = executionResult.changes;
	    var rows = [];
	    var resultSet = new SQLiteResult(null, insertId, rowsAffected, rows);
	    cb(resultSet);
	  });
	}
	
	SQLiteDatabase.prototype.exec = function exec(queries, readOnly, callback) {
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
	
	    //console.log("SQL: " + sql);
	
	    // TODO: It seems like the node-sqlite3 API either allows:
	    // 1) all(), which returns results but not rowsAffected or lastID
	    // 2) run(), which doesn't return results, but returns rowsAffected and lastID
	    // So we try to sniff whether it's a SELECT query or not.
	    // This is inherently error-prone, although it will probably work in the 99%
	    // case.
	    var isSelect = /^\s*SELECT\b/i.test(sql);
	    var isTableInfo = /^\s*PRAGMA\s*table_info\b/i.test(sql);
	
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
	
	module.exports = SQLiteDatabase;

/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = require("sqlite3");

/***/ },
/* 8 */
/***/ function(module, exports) {

	'use strict';
	
	function SQLiteResult(error, insertId, rowsAffected, rows) {
	  this.error = error;
	  this.insertId = insertId;
	  this.rowsAffected = rowsAffected;
	  this.rows = rows;
	}
	
	module.exports = SQLiteResult;

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var pgPool = __webpack_require__(10);
	var SQLiteResult = __webpack_require__(8);
	
	var READ_ONLY_ERROR = new Error('could not prepare statement (23 not authorized)');
	
	function PGDatabase(name) {
	  this._db = new pgPool(name);
	}
	
	function runSelect(db, sql, args, cb) {
	  var matches = sql.match(/PRAGMA\s*table_info\((.*)\)\;/);
	  if (matches && matches[1]) {
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
	    where c.table_name='" + tableName + "';";
	  }
	
	  db.query(sql, args, function (err, result) {
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
	
	  db.query(sql, args, function (err, rows) {
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
	
	    if (sql.search(/\s+OR\s+IGNORE\s+/) != -1) {
	      if (sql.split(';').length > 1) {
	        //end with ;
	        sql = sql.split(';').slice(0, -1).join(';');
	      }
	      sql = sql.replace(/OR\s+IGNORE\s+/, '') + ' ON CONFLICT DO NOTHING ;';
	    }
	
	    var k = 1;
	    while (sql.search(/\s*\?\s*/) != -1) {
	      sql = sql.replace('?', '$' + k);k++;
	    }
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

/***/ },
/* 10 */
/***/ function(module, exports) {

	module.exports = require("pg-pool");

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Queue = __webpack_require__(12);
	var immediate = __webpack_require__(5);
	var noop = __webpack_require__(13);
	
	var WebSQLTransaction = __webpack_require__(14);
	
	var ROLLBACK = [{ sql: 'ROLLBACK;', args: [] }];
	
	var COMMIT = [{ sql: 'END;', args: [] }];
	
	// v8 likes predictable objects
	function TransactionTask(readOnly, txnCallback, errorCallback, successCallback) {
	  this.readOnly = readOnly;
	  this.txnCallback = txnCallback;
	  this.errorCallback = errorCallback;
	  this.successCallback = successCallback;
	}
	
	function WebSQLDatabase(dbVersion, db) {
	  this.version = dbVersion;
	  this._db = db;
	  this._txnQueue = new Queue();
	  this._running = false;
	  this._currentTask = null;
	}
	
	WebSQLDatabase.prototype._onTransactionComplete = function (err) {
	  var self = this;
	
	  function done() {
	    if (err) {
	      self._currentTask.errorCallback(err);
	    } else {
	      self._currentTask.successCallback();
	    }
	    self._running = false;
	    self._currentTask = null;
	    self._runNextTransaction();
	  }
	
	  if (self._currentTask.readOnly) {
	    done(); // read-only doesn't require a transaction
	  } else if (err) {
	    self._db.exec(ROLLBACK, false, done);
	  } else {
	    self._db.exec(COMMIT, false, done);
	  }
	};
	
	WebSQLDatabase.prototype._runTransaction = function () {
	  var self = this;
	  var txn = new WebSQLTransaction(self);
	
	  immediate(function () {
	    self._currentTask.txnCallback(txn);
	    txn._checkDone();
	  });
	};
	
	WebSQLDatabase.prototype._runNextTransaction = function () {
	  if (this._running) {
	    return;
	  }
	  var task = this._txnQueue.shift();
	
	  if (!task) {
	    return;
	  }
	
	  this._currentTask = task;
	  this._running = true;
	  this._runTransaction();
	};
	
	WebSQLDatabase.prototype._createTransaction = function (readOnly, txnCallback, errorCallback, successCallback) {
	  errorCallback = errorCallback || noop;
	  successCallback = successCallback || noop;
	
	  if (typeof txnCallback !== 'function') {
	    throw new Error('The callback provided as parameter 1 is not a function.');
	  }
	
	  this._txnQueue.push(new TransactionTask(readOnly, txnCallback, errorCallback, successCallback));
	  this._runNextTransaction();
	};
	
	WebSQLDatabase.prototype.transaction = function (txnCallback, errorCallback, successCallback) {
	  this._createTransaction(false, txnCallback, errorCallback, successCallback);
	};
	
	WebSQLDatabase.prototype.readTransaction = function (txnCallback, errorCallback, successCallback) {
	  this._createTransaction(true, txnCallback, errorCallback, successCallback);
	};
	
	WebSQLDatabase.prototype.executeSql = function (sql, args, txnCallback, errorCallback) {
	  this.transaction(function (tran) {
	    tran.executeSql(sql, args, function (transaction, result) {
	      txnCallback(result);
	    }, errorCallback);
	  });
	};
	
	module.exports = WebSQLDatabase;

/***/ },
/* 12 */
/***/ function(module, exports) {

	module.exports = require("tiny-queue");

/***/ },
/* 13 */
/***/ function(module, exports) {

	module.exports = require("noop-fn");

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var noop = __webpack_require__(13);
	var Queue = __webpack_require__(12);
	var immediate = __webpack_require__(5);
	var WebSQLResultSet = __webpack_require__(15);
	
	function errorUnhandled() {
	  return true; // a non-truthy return indicates error was handled
	}
	
	// WebSQL has some bizarre behavior regarding insertId/rowsAffected. To try
	// to match the observed behavior of Chrome/Safari as much as possible, we
	// sniff the SQL message to try to massage the returned insertId/rowsAffected.
	// This helps us pass the tests, although it's error-prone and should
	// probably be revised.
	function massageSQLResult(sql, insertId, rowsAffected, rows) {
	  if (/^\s*UPDATE\b/i.test(sql)) {
	    // insertId is always undefined for "UPDATE" statements
	    insertId = void 0;
	  } else if (/^\s*CREATE\s+TABLE\b/i.test(sql)) {
	    // WebSQL always returns an insertId of 0 for "CREATE TABLE" statements
	    insertId = 0;
	    rowsAffected = 0;
	  } else if (/^\s*DROP\s+TABLE\b/i.test(sql)) {
	    // WebSQL always returns insertId=undefined and rowsAffected=0
	    // for "DROP TABLE" statements. Go figure.
	    insertId = void 0;
	    rowsAffected = 0;
	  } else if (!/^\s*INSERT\b/i.test(sql)) {
	    // for all non-inserts (deletes, etc.) insertId is always undefined
	    // Â¯\_(ãƒ„)_/Â¯
	    insertId = void 0;
	  }
	  return new WebSQLResultSet(insertId, rowsAffected, rows);
	}
	
	function SQLTask(sql, args, sqlCallback, sqlErrorCallback) {
	  this.sql = sql;
	  this.args = args;
	  this.sqlCallback = sqlCallback;
	  this.sqlErrorCallback = sqlErrorCallback;
	}
	
	function runBatch(self, batch) {
	
	  function onDone() {
	    self._running = false;
	    runAllSql(self);
	  }
	
	  var readOnly = self._websqlDatabase._currentTask.readOnly;
	
	  self._websqlDatabase._db.exec(batch, readOnly, function (err, results) {
	    /* istanbul ignore next */
	    if (err) {
	      self._error = err;
	      return onDone();
	    }
	    for (var i = 0; i < results.length; i++) {
	      var res = results[i];
	      var batchTask = batch[i];
	      if (res.error) {
	        if (batchTask.sqlErrorCallback(self, res.error)) {
	          // user didn't handle the error
	          self._error = res.error;
	          return onDone();
	        }
	      } else {
	        batchTask.sqlCallback(self, massageSQLResult(batch[i].sql, res.insertId, res.rowsAffected, res.rows));
	      }
	    }
	    onDone();
	  });
	}
	
	function runAllSql(self) {
	  if (self._running || self._complete) {
	    return;
	  }
	  if (self._error) {
	    self._complete = true;
	    return self._websqlDatabase._onTransactionComplete(self._error);
	  }
	  if (!self._sqlQueue.length) {
	    self._complete = true;
	    return self._websqlDatabase._onTransactionComplete();
	  }
	  self._running = true;
	  var batch = [];
	  var task;
	  while (task = self._sqlQueue.shift()) {
	    batch.push(task);
	  }
	  runBatch(self, batch);
	}
	
	function executeSql(self, sql, args, sqlCallback, sqlErrorCallback) {
	  self._sqlQueue.push(new SQLTask(sql, args, sqlCallback, sqlErrorCallback));
	  if (self._runningTimeout) {
	    return;
	  }
	  self._runningTimeout = true;
	  immediate(function () {
	    self._runningTimeout = false;
	    runAllSql(self);
	  });
	}
	
	function WebSQLTransaction(websqlDatabase) {
	  this._websqlDatabase = websqlDatabase;
	  this._error = null;
	  this._complete = false;
	  this._runningTimeout = false;
	  this._sqlQueue = new Queue();
	  if (!websqlDatabase._currentTask.readOnly) {
	    // Since we serialize all access to the database, there is no need to
	    // run read-only tasks in a transaction. This is a perf boost.
	    this._sqlQueue.push(new SQLTask('BEGIN;', [], noop, noop));
	  }
	}
	
	WebSQLTransaction.prototype.executeSql = function (sql, args, sqlCallback, sqlErrorCallback) {
	  args = Array.isArray(args) ? args : [];
	  sqlCallback = typeof sqlCallback === 'function' ? sqlCallback : noop;
	  sqlErrorCallback = typeof sqlErrorCallback === 'function' ? sqlErrorCallback : errorUnhandled;
	
	  executeSql(this, sql, args, sqlCallback, sqlErrorCallback);
	};
	
	WebSQLTransaction.prototype._checkDone = function () {
	  runAllSql(this);
	};
	
	module.exports = WebSQLTransaction;

/***/ },
/* 15 */
/***/ function(module, exports) {

	'use strict';
	
	function WebSQLRows(array) {
	  this._array = array;
	  this.length = array.length;
	}
	
	WebSQLRows.prototype.item = function (i) {
	  return this._array[i];
	};
	
	function WebSQLResultSet(insertId, rowsAffected, rows) {
	  this.insertId = insertId;
	  this.rowsAffected = rowsAffected;
	  this.rows = new WebSQLRows(rows);
	}
	
	module.exports = WebSQLResultSet;

/***/ },
/* 16 */
/***/ function(module, exports) {

	module.exports = require("azure-mobile-apps-client");

/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map