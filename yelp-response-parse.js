/**
 * Created by Chiranjeevi on 9/3/2016.
 */

module.exports = function (data) {
	var parsed = [];
	for (var ite of data.businesses) {
		var entry = {};
		console.log(ite, data.businesses[0], 'yelp');
		if (ite.name) {
			entry.name = ite.name;
		} else {
			//we don't need a business without a name
			continue;
		}

		if (ite.location.address instanceof Array && ite.location.address.length > 0) {
			entry.address = ite.location.address.join();
		} else {
			entry.address = 'NA';
		}

		if (ite.categories instanceof Array && ite.categories.length > 0) {
			entry.categories = [];
			ite.categories.forEach(function (e) {
				if (e instanceof Array) {
					entry.categories.push(e[0]);
				}
			});
		} else {
			entry.categories = 'NA';
		}

		if (ite.location.coordinate instanceof Object &&
			ite.location.coordinate.latitude !== undefined &&
			ite.location.coordinate.longitude !== undefined) {
			entry.cords = {lat: ite.location.coordinate.latitude, lon: ite.location.coordinate.longitude};
		} else {
			//we don't need a business without coordinates
			continue;
		}

		if (ite.location.city) {
			entry.city = ite.location.city;
		} else {
			entry.city = 'NA';
		}

		if (ite.rating) {
			entry.rating = ite.rating;
		} else {
			entry.rating = 'NA';
		}

		if (ite.display_phone) {
			entry.phone = ite.display_phone;
		} else {
			entry.phone = 'NA';
		}

		if (ite.snippet_image_url) {
			entry.photo = ite.image_url;
		} else {
			entry.photo = 'http://www.megaicons.net/static/img/icons_sizes/8/60/256/science-business-icon.png';
		}

		if (ite.url) {
			entry.url = ite.url;
		} else {
			entry.url = 'NA';
		}

		if (ite.snippet_text) {
			entry.description = ite.snippet_text;
		} else {
			entry.description = 'NA';
		}

		parsed.push(entry);
	}
	return parsed;
};