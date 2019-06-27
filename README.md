# sns
Node.jsを学びつつ、SNSに実装されている基本的な機能を作成  
  
## 用いたミドルウェア  
 - Node.js  
 - postgresql  
  
## 用いたフレームワーク  
 - express  
 - pg  
 - bcrypt  
 - ejs 

## 導入方法
```
# cd /opt
# git clone https://github.com/ryo415/sns.git
# cd sns/backend
$ su - postgres
$ cd /opt/sns/backend
$ createdb sns
$ psql sns < postgres.dump
$ exit 
# node server.js
```
  
## API機能  
GETリクエストでアクセスすると以下のJSONが返ってくるAPIを実装した  
 - /users: 登録ユーザのid一覧  
 - /users/profile: 登録ユーザのプロフィール情報一覧  
 - /users/member: 登録ユーザのidとhash化されたpassword一覧  
 - /users/profile/{ユーザ名}: ユーザのプロファイル情報
 - /users/member/{ユーザ名}: ユーザのid, hash化されたpassword情報
そのほか
 - /users/add/{ユーザ名}: passwordがIDのユーザを作成する
 - /user/delete/{ユーザ名}: 指定のユーザを削除する
