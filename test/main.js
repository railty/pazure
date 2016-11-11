//import "babel-polyfill";
import chai from 'chai';
var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();
import { Pazure } from '../src/main';

function handleError(error) {
    var text = error + (error.request ? ' - ' + error.request.status : '');
    console.error(text);
}

describe('#online test', function() {
  it('online table test', function(done) {
    var pazure = new Pazure({
      azureConnStr: 'https://eevee.azurewebsites.net',
    });
    var table = pazure.getOnlineTable('todoitem');

    table.clear().then(function(){
      return table.getRecordCount();
    }).then(function(n){
      n.should.equal(0);

      table.insert({text: 'bla', complete: false})
      .then(function(item){
        return table.insert({text: 'bla bla', complete: false});
      }).then(function(item){
        return table.insert({text: 'bla bla bla', complete: false});
      }).then(function(item){
        item.text.should.equal('bla bla bla');
        return table.update({id:item.id, text: 'bla bla bla bla', complete: false});
      }).then(function(item){
        item.text.should.equal('bla bla bla bla');
        return table.getRecordCount();
      }).then(function(n){
        n.should.equal(3);
        return table.clear();
      }).then(function(){
        return table.getRecordCount();
      }).then(function(n){
        n.should.equal(0);
        done();
      });

    });
  });
});


describe('#offline test', function() {
  it('sqlite3 offline table test', function(done) {
    var pazure = new Pazure({
      azureConnStr: 'https://eevee.azurewebsites.net',
      localStoreConfig: {
        adapter: 'sqlite3',
        database: 'store.db',
      }
    });

    pazure.getOfflineTable({
      name: 'todoitem',
      columnDefinitions: {
        id: 'string',
        text: 'string',
        deleted: 'boolean',
        complete: 'boolean'
      }
    }).then(function(table){

      table.clear()
      .then(function(){
        return table.getRecordCount();
      }).then(function(n){
        n.should.equal(0);
        return table.insert({text: 'abc', complete: false});
      }).then(function(item){
        return table.insert({text: 'abc abc', complete: false});
      }).then(function(item){
        return table.insert({text: 'abc abc abc', complete: false});
      }).then(function(item){
        return table.update({id:item.id, text: 'abc abc abc abc', complete: false});
      }).then(function(item){
        item.text.should.equal('abc abc abc abc');
        return table.getRecordCount();
      }).then(function(n){
        n.should.equal(3);
        return pazure.push();
      }).then(function(){
        return table.pull();
      }).then(function(){
        done();
      });


    });
  });

  it('pg offline table test', function(done) {
    var pazure = new Pazure({
      azureConnStr: 'https://eevee.azurewebsites.net',
      localStoreConfig: {
        adapter: 'pg',
        database: 'sqlloop',
        user: 'sning',
        password: 'sning',
        host: 'localhost',
        port: '5432',
        idleTimeoutMillis: 1000
      }
    });

    pazure.getOfflineTable({
      name: 'todoitem',
      columnDefinitions: {
        id: 'string',
        text: 'string',
        deleted: 'boolean',
        complete: 'boolean'
      }
    }).then(function(table){
      table.clear()
      .then(function(){
        return table.getRecordCount();
      }).then(function(n){
        n.should.equal(0);
        return table.insert({text: 'pg abc', complete: false});
      }).then(function(item){
        return table.insert({text: 'pg abc abc', complete: false});
      }).then(function(item){
        return table.insert({text: 'pg abc abc abc', complete: false});
      }).then(function(item){
        return table.update({id:item.id, text: 'pg abc abc abc abc', complete: false});
      }).then(function(item){
        item.text.should.equal('pg abc abc abc abc');
        return table.getRecordCount();
      }).then(function(n){
        n.should.equal(3);
        pazure.push();
      }).then(function(){
        return table.pull();
      }).then(function(){
        done();
      });
    });
  });
});
