var express = require('express');
var bcrypt = require('bcrypt');
var { Client } = require('pg');
var router = express.Router();

const saltRounds = 10;
const client = new Client({
	user: 'postgres',
	host: 'localhost',
	database: 'sns',
	password: 'postgres',
	port: 5432
});
client.connect();

router.get('/', function (req, res, next) {
	(async () => {
		var query = "SELECT id FROM member";
		var result = await client.query(query);
		res.send(result.rows);
	})().catch(next);
});

router.get('/profile', function (req, res, next) {
	(async () => {
		var query = "SELECT * FROM profile";
		var result = await client.query(query);
		res.send(result.rows);
	})().catch(next);
});

router.get('/member', function (req, res, next) {
	(async () => {
		var query = "SELECT * FROM member";
		var result = await client.query(query);
		res.send(result.rows);
	})().catch(next);
});

router.get('/member/*', function(req, res, next) {
	(async () => {
		var userid = req.params[0];
		var query = "SELECT * FROM member WHERE id='" + userid + "'";
		var result = await client.query(query);
		res.send(result.rows[0]);
	})().catch(next);
});

router.get('/profile/*', function(req, res, next) {
	(async () => {
		var userid = req.params[0];
		var query = "SELECT * FROM profile WHERE id='" + userid + "'";
		var result = await client.query(query);
		res.send(result.rows[0]);
	})().catch(next);
});

router.get('/add/*', function(req, res, next) {
	(async () => {
		var userid = req.params[0];
		var passwd = bcrypt.hashSync(userid, saltRounds);
		var id_query = "SELECT id FROM member WHERE id='" + userid + "'";
		var id_result = await client.query(id_query)
		if(typeof id_result.rows[0] !== 'undefined') {
			res.send(false)
		} else {
			var query = "INSERT INTO member VALUES ('" + userid + "', '" + passwd + "',00001 )";
			await client.query(query);
			query = "INSERT INTO profile VALUES ('" + userid + "',null,null,null,null,false)";
			await client.query(query);
			res.send(true)
		}
	})().catch(next);
});

router.get('/delete/*', function(req, res, next) {
	(async () => {
		var userid = req.params[0];
		var error = '';
		var query = "DELETE FROM member WHERE id='" + userid + "'";
		var member_result = await client.query(query);
		query = "DELETE FROM profile WHERE id='" + userid + "'";
		var profile_result = await client.query(query);
		if(member_result.rowCount != 1) {
			error = error + "member削除エラー";
		}
		if(profile_result.rowCount != 1) {
			error = error + "profile削除エラー";
		}
		if(error == '') {
			res.send(true)
		} else {
			res.send(error)
		}
	})().catch(next);
});

module.exports = router
