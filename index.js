/**
 * Created by Chiranjeevi on 9/3/2016.
 */
'use strict';

var express     = require('express');
var serveStatic = require('serve-static');
var Yelp        = require('yelp');
var yelpParse   = require('./yelp-response-parse');
var Dodge       = require('dodge');
/*Merge function to combine data from both the servers*/
var merge      = require('./merge-results');
var fourParse  = require('./four-square-response-parse');
var bodyParser = require('body-parser');
var opener = require('opener');

var app = express();
app.use(serveStatic(__dirname + '/build'));
app.use(bodyParser.json());

/*Yelp middleware*/
var yelp = new Yelp({
	consumer_key   : 'hyIQVkkGLREDsZobyPp5dQ',
	consumer_secret: 'UgKdpO46BHlEOT-3K3MIPilF-Ro',
	token          : 'PCPmAjNSEpcZ4T7TFaQ3VKj8-nhhRhWJ',
	token_secret   : 'uF-cSlKj9usvzCIjSeVzwR2OcS8'
});

/*Foursquare middleware*/
var fourSquare = new Dodge({
	clientId    : 'QJSCCNNQJ54DFMUNL2MPZ555MV02GA2OLKP3WG0AUNXRU042',
	clientSecret: 'LAXYPDM2R313FVQALAVJMI12KFTULIJX12RY3EHNOTLJBNRJ'
});

function getFourSquare(term, location, isCoordinates, callBack) {
	var input   = {};
	input.query = term;
	input.limit = 15;

	if (isCoordinates) {
		input.ll = location;
	} else {
		input.near = location;
	}

	fourSquare.venues.search(input, function (err, venues) {
		if (err) {
			return callBack(err);
		}
		return callBack(null, fourParse(venues));
	});
}

function getYelpData(term, location, isCoordinates, callBack) {
	var input   = {};
	input.term  = term;
	input.limit = 15;

	if (isCoordinates) {
		input.ll = location;
	} else {
		input.location = location;
	}

	yelp.search(input)
		.then(function (data) {
			return callBack(null, yelpParse(data));
		}).catch(function (cause) {
		return callBack(cause);
	});
}


function getData(term, location, isCoordinates, callBack) {
	var gotError  = false;
	var firstData = null;

	getYelpData(term, location, isCoordinates, function (err, data) {
		if (err) {
			if (gotError) {
				return callBack(err);
			} else {
				gotError  = true;
				firstData = [];
			}
		} else {
			if (firstData) {
				return callBack(null, merge(data, firstData));
			} else {
				firstData = data;
			}
		}
	});

	getFourSquare(term, location, isCoordinates, function (err, data) {
		if (err) {
			if (gotError) {
				return callBack(err);
			} else {
				gotError  = true;
				firstData = [];
			}
		} else {
			if (firstData) {
				return callBack(null, merge(firstData, data));
			} else {
				firstData = data;
			}
		}
	});
}

app.post('/getdata', function (req, res) {
	var query         = req.body.query,
		location      = req.body.location,
		isCoordinates = req.body.isCoordinates;
	if (query && location) {
		return getData(query, location, isCoordinates, function (err, data) {
			if (err) {
				return res.send(JSON.stringify({err: true, code: err}));
			}
			return res.send(JSON.stringify(data));
		});
	} else {
		return res.send(JSON.stringify({err: true, code: 'INVALID_REQUEST'}));
	}
});

app.listen(9999, function(){
	opener('http://localhost:9999');
});