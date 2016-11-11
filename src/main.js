import xmlhttprequest from "xmlhttprequest";
import { openDatabase } from "./websql";
import immediate from 'immediate';

class Pazure {
  constructor(option) {
    this.option = option;

    global.cordova = {version: global.process.versions.node};
    global.XMLHttpRequest = xmlhttprequest.XMLHttpRequest;
    global.window = {sqlitePlugin: {openDatabase: openDatabase}};

    //cannot import this at the global level, because this is loaded dynamicly, according to if cordova is set
    this.WindowsAzure =  require('azure-mobile-apps-client');
    this.client = new this.WindowsAzure.MobileServiceClient(option.azureConnStr);
  }

  push() {
    return this.syncContext.push();
  }

  getRecordCount(){
    var promise_resolve, promise_reject, p = new Promise(function (resolve, reject) { promise_resolve = resolve; promise_reject = reject; });
    this.read().then(function(items){
      promise_resolve(items.length);
    });
    return p;
  };

  clear(){
    var promise_resolve, promise_reject, p = new Promise(function (resolve, reject) { promise_resolve = resolve; promise_reject = reject; });
    this.read().then(function(items){
      //this only works for small dataset, for testing is ok
      //for large dataset need to partation them and delete by block
      var n = items.length;
      if (n == 0) {
        immediate(function(){
          promise_resolve(0);
        });
      } else{
        var i = 0;
        items.map(function(item){
          //console.log("delete "+item.id);
          this.del({id: item.id}).then(function(){
            i++;
            if (i==n) promise_resolve(n);
          });
        }.bind(this));
      }
    }.bind(this));

    return p;
  };

  getOfflineTable(tableOption) {
    this.tableOption = tableOption;
    this.store = new this.WindowsAzure.MobileServiceSqliteStore(this.option.localStoreConfig);
    this.store.defineTable(this.tableOption);
    this.syncContext = this.client.getSyncContext();

    var promise_resolve, promise_reject, p = new Promise(function (resolve, reject) { promise_resolve = resolve; promise_reject = reject; });

    this.syncContext.initialize(this.store).then(function(){
      console.log("initialize success");

      var table = this.client.getSyncTable(this.tableOption.name);
      if (typeof table.getRecordCount == "undefined") table.getRecordCount = this.getRecordCount;
      if (typeof table.clear == "undefined") table.clear = this.clear;
      if (typeof table.sync == "undefined") table.sync = this.sync;

      this.syncContext.pushHandler = {
        onConflict: function (serverRecord, clientRecord, pushError) {
          console.log("Sync conflict! " + pushError.getError().message);
          pushError.cancelAndDiscard();
        },
        onError: function (pushError) {
          console.log("Sync error! " + pushError.getError().message);
        }
      };

      promise_resolve(table);
    }.bind(this));

    return p;
  }

  getOnlineTable(tableName) {
    var table = this.client.getTable(tableName)
    if (typeof table.getRecordCount == "undefined") table.getRecordCount = this.getRecordCount;
    if (typeof table.clear == "undefined") table.clear = this.clear;
    return table;
  }
}

export { Pazure };
