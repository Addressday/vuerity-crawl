const mysql = require('mysql');
const config = require('../../config');
const connection = mysql.createConnection(config.SQL);
let User = require('../../models/user/user');
const crypto = require('crypto');
const secret = config.KEY.secret;
const jwt = require('jsonwebtoken')

exports.login = (req, res) => {
    User.user_id = req.body.id;
    User.user_pwd = req.body.pwd;
    let jwt_secret = 'DinnerKang';
    console.log(req.body.id);
    if (User.user_id) {
        connection.query(`SELECT user_pwd, user_role FROM naver_user WHERE user_id = "${User.user_id}"`, function (error, results, fields) {
            if (error) {
                console.log(error);
            }
            console.log(results);

            const hash = crypto.createHmac('sha256', secret)
                .update(req.body.pwd)
                .digest('base64');
            User.user_role = results[0].user_role;
            if (hash == results[0].user_pwd) {
                const getToken = new Promise((resolve, reject) => {
                    jwt.sign({
                        id: User.user_id,
                        role: User.user_role
                    },
                        jwt_secret, {
                        expiresIn: '7d',
                        issuer: 'Dinner',
                        subject: 'userInfo'
                    }, (err, token) => {
                        if (err) reject(err)
                        resolve(token)
                    })
                });

                getToken.then(
                    token => {
                        res.status(200).json({
                            'status': 200,
                            'msg': 'login success',
                            token
                        });
                    }
                );
            } else {
                res.status(400).json({
                    'status': 400,
                    'msg': 'password 가 틀림'
                });
            }
        });
    } else {
        res.status(400).json({
            'status': 400,
            'msg': 'id값이 없음'
        });
    }
}

exports.check = (req, res) => {
    const token = req.headers['x-access-token'] || req.query.token;
    let jwt_secret = 'DinnerKang';

    if (!token) {
        res.status(400).json({
            'status': 400,
            'msg': 'Token 없음'
        });
    }
    const checkToken = new Promise((resolve, reject) => {
        jwt.verify(token, jwt_secret, function (err, decoded) {
            if (err) reject(err);
            resolve(decoded);
        });
    });

    checkToken.then(
        token => {
            console.log(token);
            res.status(200).json({
                'status': 200,
                'msg': 'success',
                token
            });
        }
    )
}

