const mongodb   = require('mongodb')
const url       = 'mongodb://localhost:27017/edx-assignment3'
//const url = 'mongodb://localhost:27017/edx-course-db'
const async     = require('async')
const fs        = require('fs');

// Read json file m3-customer-address-data and m3-customer-data
var customers = JSON.parse(fs.readFileSync('m3-customer-data.json', 'utf8'));
var customerAddresses = JSON.parse(fs.readFileSync('m3-customer-address-data.json', 'utf8'));

var numInsert = (process.argv[2]) ? parseInt(process.argv[2]) : 10;
console.log(`${numInsert} will be inserted in one query`);

tasks = [];

// Check if customers and customersAddress have the same size of data
if (customers.length != customerAddresses.length)
  return process.exit(1);

// Connect to mongodb with url
mongodb.MongoClient.connect(url, (error, db) => {
  if (error) {
    console.log(error); 
    return process.exit(1);
  }

  for (var i = 0; i < customers.length; i++) {
    //console.log(customers[i]);
    //console.log(customersAddress[i]);
    customers[i] = Object.assign(customers[i], customerAddresses[i]);
    if (i % numInsert == 0) {
      const start = i;
      const end = (start + numInsert > customers.length) ? (customers.length) : (start + numInsert);
      
      //console.log(`[tasks] ${start} - ${end}`)
      tasks.push(function(callback) {
        console.log(`Updating cutomers data from ${start} to ${end-1}`)
        //console.log(customers.slice(start, end));
        db.collection('customers').insert(customers.slice(start, end), (insertErr, result) => {
          callback(insertErr, result);
        });
      });
    }
  }

  console.log(`Total ${tasks.length} of parallel jobs will be run asynchronously`);

  async.parallel(tasks, (error, results) => {
    if (error) console.error(error);
    //console.log(results);
    db.close();
  })
});
