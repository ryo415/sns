var express = require('express');
var bcrypt = require('bcrypt');
var fs = require('fs');
var bodyParser = require('body-parser');
var { Client } = require('pg');
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

var server = app.listen(3000, function(){
	console.log("Node.js is listening to PORT:" + server.address().port);
});

function get_passwd_hash(id) {
	var msg = fs.readFileSync("member.txt", {encoding: "utf-8"});
	var line = msg.toString().split('\n');
	var userid;

	for(i=0;i<line.length;i++) {
		line_split = line[i].split(',');
		userid = line_split[0];
		passwd = line_split[1];
		if(userid == id) {
			return passwd;
		}
	}
	return -1
}

app.set('view engine', 'ejs');

app.get("/", function(req, res, next) {
	res.render("index", {});
});

app.post("/login", (req, res, next) => {
	(async () => {
		var input_userid = req.body.userid;
		var input_passwd = req.body.passwd;
		var input_passwd_hash;
		//var db_passwd_hash = get_passwd_hash(input_userid);
		var db_passwd_hash;
	
		var query = "select passwd from member where id='" + input_userid + "'";
		await client.connect();
		var result = await client.query(query);
		await client.end();

		if(typeof result.rows[0] !== 'undefined') {
			db_passwd_hash = result.rows[0].passwd;
		} else {
			db_passwd_hash = -1;
		}
		
		console.log(db_passwd_hash);
		console.log(input_passwd);

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
