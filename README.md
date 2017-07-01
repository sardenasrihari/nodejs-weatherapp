#  Nodejs + Express + Open Weather

Following instructions from
https://codeburst.io/build-a-weather-website-in-30-minutes-with-node-js-express-openweather-a317f904897b


* OpenWeatherMap.org account https://openweathermap.org/api
* Create an empty directory named weather-app.
* Open up your console, navigate to our new directory and run npm init.
* Fill out the required information to initialize our project.
* Within our weather-app directory, create a file named server.js — this file will house the code for our application.
* npm install --save express
* install in server.js
```javascript
const express = require('express')
const app = express()

app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
```

* Run: `node server.js`

* Now open your browser and visit: http://localhost:3000

* Install template system: `npm install ejs --save`

* Edit server.js: `app.set('view engine', 'ejs')`

* Create directory/file: `views\index.ejs`

* Edit into index.ejs file basic boilerplate for front end:

```
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Test</title>
    <link rel="stylesheet" type="text/css" href="/css/style.css">
    <link href='https://fonts.googleapis.com/css?family=Open+Sans:300' rel='stylesheet' type='text/css'>
  </head>
  <body>
    <div class="container">
      <fieldset>
        <form action="/" method="post">
          <input name="city" type="text" class="ghost-input" placeholder="Enter a City" required>
          <input type="submit" class="ghost-button" value="Get Weather">
        </form>
      </fieldset>
    </div>
  </body>
</html>
```

* In server.js, connect the template by replaceing Hello World line `res.render('index');`
* Run again: `node server.js`

* Add css directory and file: `public\css\index.js`

* Expose this fule with express by adding line to server.js:
`app.use(express.static('public'));`

* Set up POST route:
```javascript
app.post('/', function (req, res) {
  res.render('index');
})
```

* install Middleware: `npm install body-parser --save`

* Edit server.js to add middleware:
```javascript
const bodyParser = require('body-parser');
// ...
app.use(bodyParser.urlencoded({ extended: true }));
```

* In server.js - log city to the console (add to existing post):
```javascript
app.post('/', function (req, res) {
  res.render('index');
  console.log(req.body.city);
})
```

* Test it (to make sure city shows in console): `node server.js`

* http://localhost:3000/








.
