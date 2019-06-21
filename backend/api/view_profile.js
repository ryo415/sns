var express = require('express');
var { Client } = require('pg');
var router = express.Router();

const client = new Client({
	user: 'postgres',
	host: 'localhost',
	database: 'sns',
	password: 'postgres',
	port: 5432
});
client.connect();

async function get_profile(userid) {
	var profile;
	var result;
	var query = "SELECT * FROM profile WHERE id='" + userid + "'";
	result = await client.query(query);
	profile = {userid: userid};
	if(result.rows[0].intro != null) {
		profile.intro = result.rows[0].intro;
	} else {
		profile.intro = '';
	}
	if(result.rows[0].image_name != null) {
		profile.image = result.rows[0].image_name;
	} else {
		profile.image = '';
	}
	if(result.rows[0].bd_month != null) {
		profile.month = result.rows[0].bd_month;
	} else {
		profile.month = 'XX';
	}
	if(result.rows[0].bd_day != null) {
		profile.day = result.rows[0].bd_day;
	} else {
		profile.day = 'XX';
	}
	if(result.rows[0].hide == true) {
		profile.hide = 'ON';
	} else {
		profile.hide = 'OFF';
	}
	return profile
}

router.get('/*', function (req, res, next) {
	(async () => {
		var userid = req.params[0];
		//var profile = await get_profile(userid);
		var profile = {userid: 'test', intro: 'test', month: 7, day: 21, hide: 'OFF'};
		if(profile.hide == 'ON') {
			res.render("hide_profile", {});
		} else {
			res.render("view_profile",{userid: userid, intro: profile.intro, month: profile.month, day: profile.day})
		}
	})().catch(next);
});

module.exports = router
