'use strict';

var express = require('express');
var router = express.Router();

const request = require('request');
const snoowrap = require('snoowrap');
const credConfig = require('../data/credentials.json'); //Manage credential parameters here

const accessTokenUrl = 'https://www.reddit.com/api/v1/access_token';
const redirectUrl = 'http://localhost:3002/auth/';

var fs = require('fs');

var authRequest;
var authResponse;
var snoowrapRequest;

/* GET home page. */
router.get('/', (req, res, next)=> {
  res.render('index', { 
    authResponse: authResponse,
    credConfig: credConfig
  });
});

//Auth
router.get('/auth', (req, res) => {
  var reqObj = { 'state': req.query.state, 'code': req.query.code };

  if(typeof req.query.code === 'string') { //Add logic to check validity of reqObj.state
    authRequest = request.post(
      {
        url: accessTokenUrl,
        auth: {
          user: credConfig.user,
          pass: credConfig.pass
        },
        formData: {
          grant_type: 'authorization_code',
          code: reqObj.code,
          redirect_uri: redirectUrl
        }
      },
      function optionalCallback(err, httpResponse, body) {
        if (err) {
          return console.error('Auth POST Failed', err);
        } else {
          snoowrapRequest = new snoowrap({
            userAgent: credConfig.userAgent,
            clientId: credConfig.clientId,
            clientSecret: credConfig.clientSecret,
            refreshToken: JSON.parse(body).refresh_token
          });

          //console.log(httpResponse); //HTTP response object
          //console.log(JSON.parse(body)); //AUth response object
          //console.log(snoowrapRequest.config()); //Shows you the default config properties

          //Set specific config properties
          snoowrapRequest.config({
            requestDelay: 1000 //Millisecond delay between consecutive Reddit API requests
          });
            
          //Get current auth'd user information
          snoowrapRequest.getMe().then(function(response) {
            console.log(response); //Shows you the full user object
            authResponse = response;
            res.redirect('/'); //Send to homepage next
          });
        }
      }
    );

  } else {
    //Not an auth code request, bounce it
  }
});

//Get Subreddit Rules
router.get('/getsubredditrules', (req, res) => {
  snoowrapRequest.getSubreddit(req.param('subredditName')).getRules().then(function(response) {
    res.send(response);
  });
});

//Get Hot
router.get('/gethot', (req, res) => {
  snoowrapRequest.getSubreddit(req.param('subredditName')).getHot({ 'limit': parseInt(req.param('subredditPostCount')) }).then(function(response) {
    res.send(response);
  });
});

//Get New
router.get('/getnew', (req, res) => {
  snoowrapRequest.getSubreddit(req.param('subredditName')).getNew({ 'limit': parseInt(req.param('subredditPostCount')) }).then(function(response) {
    res.send(response);
  });
});

//Get Rising
router.get('/getrising', (req, res) => {
  snoowrapRequest.getSubreddit(req.param('subredditName')).getRising({ 'limit': parseInt(req.param('subredditPostCount')) }).then(function(response) {
    res.send(response);
  });
});

//Get Controversial
router.get('/getcontroversial', (req, res) => {
  snoowrapRequest.getSubreddit(req.param('subredditName')).getControversial({ 't': req.param('subredditTimeframe'), 'limit': parseInt(req.param('subredditPostCount')) }).then(function(response) {
    res.send(response);
  });
});

//Get Top
router.get('/gettop', (req, res) => {
  snoowrapRequest.getSubreddit(req.param('subredditName')).getTop({'t': req.param('subredditTimeframe'), 'limit': parseInt(req.param('subredditPostCount')) }).then(function(response) {
    res.send(response);
  });
});

//Get Comments
router.get('/getcomments', (req, res) => {
  snoowrapRequest.getSubmission(req.param('subredditId')).expandReplies({ limit: 2, depth: 0 }).then(function(response) {
    res.send(response);
  });
});

module.exports = router

//Custom Utilty Functions
function writeToFile(content, fileName) { //Can be used to write an output file of whatever you send to it
  fs.writeFile(fileName, content, (err) => {
    if (err) console.log(err);
    console.log("Successfully Written to File.");
  });
}

function isAuthenticated(req, res, next) {
  //Work in progress... will be used to check user authentication validity
}