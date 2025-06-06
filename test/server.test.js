const supertestRequest = require('supertest'); // Renamed to avoid conflict with the 'request' module we are mocking
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const proxyquire = require('proxyquire');

// For the GET / test, we still need the original app instance
const originalApp = require('../server');

describe('GET /', () => {
  it('should render the index page with no weather and no error', (done) => {
    supertestRequest(originalApp) // Use originalApp for GET test
      .get('/')
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).to.equal(200);
        expect(res.text).to.include('<title>Test</title>');
        expect(res.text).to.include('placeholder="Enter a City"');
        expect(res.text).to.not.include('<h3>'); // Weather info
        expect(res.text).to.not.include('<p>');   // Error message
        done();
      });
  });
});

describe('POST /', () => {
  it('should render weather info on successful API call', (done) => {
    const fakeCity = 'Testville';
    const fakeTemp = 75;
    const fakeHumidity = 60;
    const fakeApiResponse = {
      main: { temp: fakeTemp, humidity: fakeHumidity },
      name: fakeCity
    };

    const requestMock = sinon.stub();
    // Configure the mock for the specific call server.js makes
    requestMock.callsFake((url, callback) => {
      // Simulate OpenWeatherMap API call success
      callback(null, { statusCode: 200 }, JSON.stringify(fakeApiResponse));
    });

    // Load app with the mocked request using proxyquire
    // The path '../server' should be relative to this test file
    const appWithMockedRequest = proxyquire('../server', { 'request': requestMock });

    supertestRequest(appWithMockedRequest)
      .post('/')
      .send({ city: fakeCity }) // Express's body-parser will pick this up
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).to.equal(200);
        const expectedWeatherText = `It's ${fakeTemp} degrees, with ${fakeHumidity}% humidity in ${fakeCity}!`;
        expect(res.text).to.include(expectedWeatherText);
        expect(res.text).to.not.include('Error, please try again');

        expect(requestMock.calledOnce).to.be.true;
        // Check that the first argument to the mock (the URL) contains the city and API endpoint
        expect(requestMock.firstCall.args[0]).to.include(`q=${fakeCity}`);
        expect(requestMock.firstCall.args[0]).to.include('api.openweathermap.org/data/2.5/weather');
        done();
      });
  });

  it('should render error message on API call error', (done) => {
    const fakeCity = 'ErrorCity';
    const apiError = new Error('Network connection failed');

    const requestMock = sinon.stub();
    // Configure the stub to call our callback with an error
    requestMock.callsFake((url, callback) => {
      callback(apiError, null, null); // Simulate an error from the request module
    });

    // Load app with the mocked request
    const app = proxyquire('../server', { 'request': requestMock });

    supertestRequest(app)
      .post('/')
      .send({ city: fakeCity })
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).to.equal(200); // Server handles error and renders page
        expect(res.text).to.include('Error, please try again');
        // Check that no weather information is displayed
        expect(res.text).to.not.include("It's");
        expect(res.text).to.not.include("degrees");
        expect(requestMock.calledOnce).to.be.true;
        expect(requestMock.firstCall.args[0]).to.include(`q=${fakeCity}`);
        done();
      });
  });

  it('should render error if weather.main is undefined in API response', (done) => {
    const fakeCity = 'NoMainDataCity';
    const fakeApiResponse = {
      name: fakeCity
      // Deliberately not including 'main' property
    };

    const requestMock = sinon.stub();
    // Configure the stub to call our callback with a successful response but malformed/incomplete data
    requestMock.callsFake((url, callback) => {
      callback(null, { statusCode: 200 }, JSON.stringify(fakeApiResponse));
    });

    // Load app with the mocked request
    const app = proxyquire('../server', { 'request': requestMock });

    supertestRequest(app)
      .post('/')
      .send({ city: fakeCity })
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).to.equal(200); // Server handles error and renders page
        expect(res.text).to.include('Error, please try again');
        expect(res.text).to.not.include("It's"); // No weather info
        expect(res.text).to.not.include("degrees");
        expect(requestMock.calledOnce).to.be.true;
        expect(requestMock.firstCall.args[0]).to.include(`q=${fakeCity}`);
        done();
      });
  });
});
