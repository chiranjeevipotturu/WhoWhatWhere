/**
 * Created by Chiranjeevi on 9/3/2016.
 */

var _ = require('lodash');

module.exports = function (yelp, foursquare) {
	/*Merge Array on the basis of name so wont be any duplicate entries*/
	var mergedData = _.unionBy(yelp, foursquare, 'name');
	return mergedData;
};