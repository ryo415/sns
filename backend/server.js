var express = require('express');
var bcrypt = require('bcrypt');
var bodyParser = require('body-parser');
var { Client } = require('pg');
var session = require('express-session');
var url = require('url');
const saltRounds = 10;
var app = express();
var users = require('./api/users');

app.use(express.static('../views'));
app.use(bodyParser.urlencoded({
	    extended: true
}));
app.use(bodyParser.json());
app.use(session({
	secret: 'sns',
	resave: false,
	saveUninitialized: true,
	cookie: {maxAge: null}
}));
app.use('/users', users);

const client = new Client({
	user: 'postgres',
	host: 'localhost',
	database: 'sns',
	password: 'postgres',
	port: 5432
})

async function get_profile(userid) {
	var profile;
	var result;
	var query = "SELECT * FROM profile WHERE id='" + userid + "'";
	result = await client.query(query);
	profile = {userid: userid};
	if(result.rows[0].intro == null) {
		profile.intro = '';
	} else {
		profile.intro = result.rows[0].intro;
	}
	if(result.rows[0].image_name == null) {
		profile.image = '';
	} else {
		profile.image = result.rows[0].image_name;
	}
	if(result.rows[0].bd_month == null) {
		profile.month = 'XX';
	} else {
		profile.month = result.rows[0].bd_month;
	}
	if(result.rows[0].bd_day == null) {
		profile.day = 'XX';
	} else {
		profile.day = result.rows[0].bd_day;
	}
	if(result.rows[0].hide == true) {
		profile.hide = 'ON';
	} else {
		profile.hide = 'OFF';
	}

	return profile
}

function search_result_html(result) {
	var html;
	if(result.rows.length != 0){
		var id;
		var intro;
		html = "<table border=1><tr><th>ID</th><th>introduction</th>";
		for(var i=0;i<result.rows.length;i++) {
			id = result.rows[i].id;
			if(result.rows[i].intro == null){
				intro = '';
			} else {
				intro = result.rows[i].intro;
			}
			html = html + "<tr><td><a href='/view_profile?userid=" + id + "'>"+ id + "</a></td><td>" + intro + "</td></tr>";
		}
		html = html + "</table>"
	} else {
		html = "<p>検索結果なし</p>";
	}

	return html;
}
client.connect();

var server = app.listen(3000, function(){
	console.log("Node.js is listening to PORT:" + server.address().port);
});

app.set('views', '../views');
app.set('view engine', 'ejs');

app.get("/", function(req, res, next) {
	if (req.session.userid != undefined) {
		res.render("mypage", {userid: req.session.userid});
	} else {
		res.render("index", {});
	}
});

app.get("/useradd", function(req, res, next) {
	res.render("add_user",{});
});

app.get("/edit_profile", function(req, res, next) {
	( async () => {
		if(req.session.userid != undefined) {
			var profile = await get_profile(req.session.userid);
			res.render("edit_profile", {userid: profile.userid, intro: profile.intro, month: profile.month, day: profile.day, hide: profile.hide});
		} else {
			res.render("index",{});
		}
	})().catch(next);
});

app.get("/restore", function(req, res, next) {
	if(req.session.userid != undefined) {
		res.render("restore",{});
	} else {
		res.render("index",{});
	}
});

app.get("/profile", function(req, res, next) {
	(async () => {
		var profile_query;
		var result;
		var image_name;
		var intro;
		var month;
		var day;

		if(req.session.userid == undefined) {
			res.render("index",{});
		} else {
			var profile = await get_profile(req.session.userid);
			res.render("profile", {userid: profile.userid, intro: profile.intro, month: profile.month, day: profile.day, hide: profile.hide});
		}
	})().catch(next);
});

app.get("/do_restore", function(req, res, next) {
	(async () => {
		if(req.session.userid == undefined) {
			render("index", {});
		} else {
			var query;
			var referer = req.headers.referer;
			if(referer != undefined) {
				var url_parse = url.parse(referer)
				if(url_parse.path == '/restore') {
					query = "DELETE FROM member WHERE id='" + req.session.userid + "'";
					await client.query(query);
					query = "DELETE FROM profile WHERE id='" + req.session.userid + "'";
					await client.query(query);
					delete req.session.userid;
					res.render("restore_complete",{});
				} else {
					res.render("restore_error",{error: 'リンク元が正しくありません。'})
				}
			} else {
				res.render("restore_error", {error: '直接リンクは禁止されています。'});
			}
		}
	})().catch(next);
});

app.get("/search", function(req, res, next) {
	if(req.session.userid != undefined) {
		res.render("search", {});
	} else {
		res.render("index", {});
	}
});

app.get('/view_profile', function (req, res, next) {
	(async () => {
		var userid = req.query.userid
		var profile = await get_profile(userid);
		if(profile.hide == 'ON') {
			res.render("hide_profile", {});
		} else {
			res.render("view_profile", {userid: profile.userid, intro: profile.intro, month: profile.month, day: profile.day});
		}
	})().catch(next);
});

app.post("/do_edit_profile", (req, res, next) => {
	(async () => {
		if(req.session.userid == undefined) {
			res.render("index", {});
		} else {
			var query;
			var image_name;
			var intro;
			var month;
			var day;
			var result;
			if(req.body.intro != '') {
				query = "UPDATE profile SET intro='" + req.body.intro + "' WHERE id='" + req.session.userid + "'";
				await client.query(query);
			}
			if(req.body.month != '') {
				query = "UPDATE profile SET BD_month=" + req.body.month + " WHERE id='" + req.session.userid + "'";
				await client.query(query);
			}
			if(req.body.day != '') {
				query = "UPDATE profile SET BD_day=" + req.body.day + " WHERE id='" + req.session.userid + "'";
				await client.query(query);
			}
			if(req.body.hide == 'ON') {
				query = "UPDATE profile SET hide=true WHERE id='" + req.session.userid + "'";
				await client.query(query);
			} else if(req.body.hide == 'OFF') {
				query = "UPDATE profile SET hide=false WHERE id='" + req.session.userid + "'";
				await client.query(query);
			}
			var profile = await get_profile(req.session.userid);
			res.render("profile", {userid: profile.userid, intro: profile.intro, month: profile.month, day: profile.day, hide: profile.hide});
		}
	})().catch(next);
});

app.post("/do_search", (req, res, next) => {
	(async () => {
		if(req.session.userid == undefined) {
			res.render("index", {});
		} else {
			var search_str = req.body.search;
			var query = "SELECT * FROM profile WHERE id LIKE '%" + search_str + "%' AND id NOT LIKE '" + req.session.userid + "' AND hide IS NOT true";
			var result = await client.query(query);
			html = search_result_html(result)
			res.render("search_result",{result: html});
		}
	})().catch(next);
});

app.post("/logout", (req, res, next) => {
	delete req.session.userid;
	res.render("logout",{});
});

app.post("/login", (req, res, next) => {
	(async () => {
		var input_userid = req.body.userid;
		var input_passwd = req.body.passwd;
		var input_passwd_hash;
		var db_passwd_hash;
	
		var query = "SELECT passwd FROM member WHERE id='" + input_userid + "'";
		var result = await client.query(query);

		if(!input_userid) {
			res.render("login_error", {error: 'IDを入力してください。'});
		} else {
			if(typeof result.rows[0] !== 'undefined') {
				db_passwd_hash = result.rows[0].passwd;
			} else {
				db_passwd_hash = -1;
			}
	
			if(db_passwd_hash != -1) {
				if(bcrypt.compareSync(input_passwd, db_passwd_hash)) {
					req.session.userid = input_userid;
					res.render("mypage", {userid: req.session.userid})
				} else {
					res.render("login_error",{error: 'IDもしくはパスワードが違います。'});	
				}
			} else {
				res.render("login_error",{error: 'IDもしくはパスワードが違います。'});
			}
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
			res.render("add_user_error", {error: 'IDが重複しています'});
		} else if(input_passwd1 != input_passwd2) {
			res.render("add_user_error", {error: 'パスワードが異なっています'});
		} else {
			var add_query = "INSERT INTO member VALUES ('" + input_userid + "', '" + input_passwd_hash + "', 00001 )";
			var add_profile_query = "INSERT INTO profile VALUES ('" + input_userid + "',null,null,null,null,false)";
			client.query(add_query);
			client.query(add_profile_query);
			res.render("add_user_complete",{});
		}
	})().catch(next);

});
