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
	})().catch(next)
});

router.get('/profile/*', function(req, res, next) {
	(async () => {
		var userid = req.params[0];
		var query = "SELECT * FROM profile WHERE id='" + userid + "'";
		var result = await client.query(query);
		res.send(result.rows[0]);
	})().catch(next)
});

module.exports = router
