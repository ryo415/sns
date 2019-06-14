var express = require('express');
var bcrypt = require('bcrypt');
var fs = require('fs');
var bodyParser = require('body-parser');
const saltRounds = 10;
var app = express();

app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

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

app.post("/login", function(req, res, next) {
	var input_userid = req.body.userid;
	var input_passwd = req.body.passwd;
	var input_passwd_hash;
	var db_passwd_hash = get_passwd_hash(input_userid);

	if(db_passwd_hash != -1) {
		if(bcrypt.compareSync(input_passwd, db_passwd_hash)) {
			res.send("good login");
		} else {
			res.send("bad login");

		}
	} else {
		res.send("no user");
	}
});
