pazure
=========

# pazure
sync azure easy table to local postgresql

## features
- use it in node enviroment instead of browser/cordova
- offline / sync support

## Why
- my setup is many client running in cordova, save their data in sqlite with offline support, and then sync to azure. the there is a master station to analyse the data and generate reports, which is already done in rails/postgres. so I need download all azure data into this local database
- to upload /download the azure data into local postgresql database (for rails)
- better understand how the sync works

## Difference with node sdk
this simulate cordova, so has offline support

##How
- there are many way to do it, on database level I can have triggers in sqlite to copy the data to postgres, I choose the following way.
- use xmlhttprequest module to simulate the http request in node
- simulate the websql interface on top of postgres, based on websql module

## Installation
  npm install pazure --save

## Usage

## Tests

  npm test

## to do
a interface for mysql?

## Acknowledge
Thanks
- https://github.com/driverdan/node-XMLHttpRequest.git
- https://github.com/nolanlawson/node-websql.git

## Release History

* 0.1.0 Initial release

## Dev setup
npm init
npm install babel-core babel-loader --save-dev
# For ES6/ES2015 support
npm install babel-preset-es2015 --save-dev

# If you want to use JSX
npm install babel-preset-react --save-dev

# If you want to use experimental ES7 features
npm install babel-preset-stage-0 --save-dev

npm install babel-polyfill --save
npm install babel-runtime --save
npm install babel-plugin-transform-runtime --save-dev

npm install chai mocha --save-dev
npm install should --save-dev
