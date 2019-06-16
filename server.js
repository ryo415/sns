var express = require('express');
var bcrypt = require('bcrypt');
var bodyParser = require('body-parser');
var { Client } = require('pg');
var session = require('express-session');
const saltRounds = 10;
var app = express();

app.use(bodyParser.urlencoded({
	    extended: true
}));

app.use(bodyParser.json());

const client = new Client({
	user: 'postgres',
	host: 'localhost',
	database: 'sns',
	password: 'postgres',
	port: 5432
})
client.connect();

var server = app.listen(3000, function(){
	console.log("Node.js is listening to PORT:" + server.address().port);
});

app.set('view engine', 'ejs');

app.get("/", function(req, res, next) {
	res.render("index", {});
});

app.get("/useradd", function(req, res, next) {
	res.render("useradd",{});
});

app.post("/login", (req, res, next) => {
	(async () => {
		var input_userid = req.body.userid;
		var input_passwd = req.body.passwd;
		var input_passwd_hash;
		var db_passwd_hash;
	
		var query = "SELECT passwd FROM member WHERE id='" + input_userid + "'";
		var result = await client.query(query);

		if(typeof result.rows[0] !== 'undefined') {
			db_passwd_hash = result.rows[0].passwd;
		} else {
			db_passwd_hash = -1;
		}

		if(db_passwd_hash != -1) {
			if(bcrypt.compareSync(input_passwd, db_passwd_hash)) {
				res.send("good login");
			} else {
				res.send("bad login");
	
			}
		} else {
			res.send("no user");
		}
	})().catch(next);
});

app.post("/add",(req, res, next) => {
	(async () => {
		var input_userid = req.body.userid;
		var input_passwd1 = req.body.passwd1;
		var input_passwd2 = req.body.passwd2;
		var input_passwd_hash = bcrypt.hashSync(input_passwd1, saltRounds);

		var id_query = "SELECT id FROM member WHERE id='" + input_userid + "'";
		var id_result = await client.query(id_query);

		if(typeof id_result.rows[0] !== 'undefined') {
			res.send("id duplicate");
		}
		if(input_passwd1 != input_passwd2) {
			res.send("wrong password");
		}

		var add_query = "INSERT INTO member VALUES ('" + input_userid + "', '" + input_passwd_hash + "', 00001 )";
		console.log(add_query);
		res.send("user added");
	})().catch(next);

});
