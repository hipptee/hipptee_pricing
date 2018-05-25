// **** Shopify Private App for Getting Crypto Prices
// and Updating Product Prices in Shopify Store *****

// INDEX.JS (MAIN FILE)

// INSTALL DEPENDENCIES
// All of these dependencies can be found on npmjs.com
const express = require('express'); // Install request (jquery for node)
const app = express();  // Establish the express app
var request = require('request'); // Library for making API calls
var bodyParser = require('body-parser'); // For decoding JSON
var schedule = require('node-schedule'); // For running cron jobs
var cors = require('cors');

app.use(cors());
require('dotenv').config(); // Require local config file. .env files aren't publicly available so good for API Keys etc.

var port = 3000;
var shopURL = "hipptee.myshopify.com";

// API CREDENTIALS FOR ACCESSING THE STORE (Need to update the .env file with your own private app credentials)
const API_KEY = process.env.API_KEY;
const PASSWORD = process.env.PASSWORD;

// This is needed because Coinmarketcap uses bitcoin names, but you're using
// the codes in the variant names.
var coinCodes = {
  "BTC" : "bitcoin",
  "ETH" : "ethereum",
  "DASH" : "dash",
  "LTC" : "litecoin",
  "DOGE" : "dogecoin",
  "XMR" : "monero",
  "XVG" : "verge",
  "ZEC" : "zcash",
  "NEO" : "neo",
  "DGB" : "digibyte"
  
};


// DETECT IF IT'S RUNNING ON LOCAL ENVIRONMENT OR HEROKU
if (app.get('env') === 'development') {
  // Settings for local
  require('dotenv').config(); // Load env file
  port = 3000;
} else {
  // Settings for Heroku
  port = process.env.PORT;
}

function cryptoCron() {
  // CRON JOB
  // This will run every 10 seconds to get bitcoin price
  // var timer = '*/10 * * * * *'; // For info on timer see https://www.npmjs.com/package/node-schedule
  var timer = '* */5 * * * '; // 5 minute
  // var timer = '* * * * * 1'
}
  

function getAllCryptoPrice(callback) {
  // FUNCTION TO GET CRYPTO PRICE.
  // When this function is called, it makes an API call CoinMarketCap and returns JSON
  // callback is what is done after the API all returns.
  // This function essentially returns the same data as if you were to visit this URL - https://api.coinmarketcap.com/v1/ticker/?convert=CAD&limit=10
  // The data it returns is an array of objects. Which means each cryptoprice is at a different index.

  request({
    url : "https://api.coinmarketcap.com/v1/ticker/?convert=CAD&limit=100",
    method: "GET",
    dataType: "json"
  }, function(err, resp) {
    if (err) {
      // Something went wrong. Log to console.
      console.log(err);
    } else {
      var data = JSON.parse(resp["body"]); // The response is a HTTPS response object, so we want to let it know it's JSON and parse just the body as such
      callback(data); // Return the data to our callback so it can do stuff with it.
    }
  });
}

function getCryptoPrice(coinName, callback) {
  // This function returns a specific crypto price by their id (case sensitive).
  // Valid values examples: bitcoin, ethereum, ripple etc
  // Send an API request to coinmarketcap
  console.log('Getting ' + coinName + " price!" );
  request({
    url : "https://api.coinmarketcap.com/v1/ticker/" + coinName + "/?convert=CAD&limit=10",
    method: "GET",
    dataType: "json"
  }, function(err, resp) {
    if (err) {
      // Something went wrong. Log to console.
      console.log(err);
    } else {
      var data = JSON.parse(resp["body"]);
      callback(data);
    }
  });
}



// These are specific Routes you can use to see the data for yourself by visiting localhost:3000 followed by the route.
app.get('/', function(req, res) {
  // Visiting this URL ('ie: localhost:3000') will display all crypto price data
  getAllCryptoPrice(function(data) {
    // data now contains all of our crypto price in a neat array. As seen here - https://api.coinmarketcap.com/v1/ticker/?convert=CAD&limit=10
    // data[0] = bitcoin dataType
    // data[1] = ethereum data
    // data[0].price_cad = bitcoin price in canadian
    // data[2].symbol = "XRP"

    // Because the data is returned in an array, this program assumes that Bitcoin
    // will always be priced the highest, and therefore the first in the array.
    // To be safe it would be smarter to loop over them all
    res.send(data);
  });
});

app.listen(port, function() {
  cryptoCron(); // Start running our cronJob
  console.log("Crypto App running on port: " + port);
})
