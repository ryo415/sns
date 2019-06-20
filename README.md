# sns
SNSに実装されている基本的な機能を作成  
  
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
$ psql sns < postgres.dump
$ exit 
# node server.js
```
  
## API機能  
アクセスすると以下が返ってくるAPIを実装した  
 - /users: 登録ユーザのid一覧  
 - /users/profile: 登録ユーザのプロフィール情報一覧  
 - /users/member: 登録ユーザのidとhash化されたpassword一覧  
