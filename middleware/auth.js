// const SystemUserSchema = require('../models/systemUser.model')
// const UserSchema = require('../models/user.model')
const jwt = require('jsonwebtoken')
const atob = require('atob');
const {UnauthenticatedError} = require('../errors')
const {
    isReallyNull, decryptJwt, verifyJWT, verifyJWTUser, decryptJwtUser, decryptJwtotel, verifyJWTOtel,
    verifyJWTDovmeci, verifyJWTSystemUser, verifyJWTAdmin
} = require("../helpers/utils");
const mongoose = require("mongoose");
const userMiddleware = async (req, res, next) => {
    let authHeader = req.headers.authorization
    if (!authHeader) {
        throw new UnauthenticatedError('No token provided')
    }
    if (authHeader.startsWith('Bearer ')) {
        authHeader = authHeader.replace('Bearer ', '')
    }
    try {

        let authToken = authHeader
        if (!authToken || isReallyNull(authToken)) {
            console.error('Request Header Token Not Found');
            return res.sendStatus(401);
        }

        const isVerifyJWT = verifyJWT(authToken);
        if (!isVerifyJWT || isVerifyJWT === undefined) {
            console.error('JWT Token Not Valid');

            return res.sendStatus(401);
        }
        const {user} = isVerifyJWT;
        let id = new mongoose.Types.ObjectId(user._id)
        req.headers.user = id
        req.headers.userDetail = user

        if (req.body.values) {
            let q = JSON.parse(req.body.values)
            Object.keys(q).forEach(o => {
                req.body[o] = q[o]
            })
        }
        next()
    } catch (error) {
        throw new UnauthenticatedError('Not authorized to access this route')
    }
}
const adminAuthenticationMiddleware = async (req, res, next) => {
    let authHeader = req.headers.authorization

    if (!authHeader) {
        throw new UnauthenticatedError('No token provided')
    }
    if (authHeader.startsWith('Bearer ')) {
        authHeader = authHeader.replace('Bearer ', '')
    }

    try {

        let authToken = authHeader
        if (!authToken || isReallyNull(authToken)) {
            console.error('Request Header Token Not Found');
            return res.sendStatus(401);
        }

        const isVerifyJWT = verifyJWTAdmin(authToken);
        if (!isVerifyJWT || isVerifyJWT === undefined) {
            console.error('JWT Token Not Valid');

            return res.sendStatus(401);
        }
        const {user} = isVerifyJWT;
        let id = new mongoose.Types.ObjectId(user._id)
        req.headers.user = id
        req.headers.userDetail = user
        if (req.body.values) {
            try {
                let q = JSON.parse(req.body.values)
                Object.keys(q).forEach(o => {
                    req.body[o] = q[o]
                })
            } catch (e){
                next()
                return
            }

            // if(req.body['key']) req.body.id = req.body.key
        }
        next()
    } catch (error) {
        console.log(error)
        throw new UnauthenticatedError('Not authorized to access this route')
    }
}
const mobileAuthenticationMiddleware = async (req, res, next) => {
    let authHeader = req.headers.authorization
    let mobileToken = req.headers.mobileheader
    console.log(mobileToken)
    if (!mobileToken || mobileToken !== 'nAvn4gsYD=;2:.4"') {
        throw new UnauthenticatedError('No mobile token provided')
    }else{
        next()
        return
    }
    if (!authHeader) {
        throw new UnauthenticatedError('No token provided')
    }
    if (authHeader.startsWith('Bearer ')) {
        authHeader = authHeader.replace('Bearer ', '')
    }
    try {

        let authToken = authHeader
        if (!authToken || isReallyNull(authToken)) {
            console.error('Request Header Token Not Found');
            return res.sendStatus(401);
        }

        const isVerifyJWT = verifyJWTAdmin(authToken);
        if (!isVerifyJWT || isVerifyJWT === undefined) {
            console.error('JWT Token Not Valid');

            return res.sendStatus(401);
        }
        const {user} = isVerifyJWT;
        let id = new mongoose.Types.ObjectId(user._id)
        req.headers.user = id
        req.headers.userDetail = user

        if (req.body.values) {
            let q = JSON.parse(req.body.values)
            Object.keys(q).forEach(o => {
                req.body[o] = q[o]
            })

            // if(req.body['key']) req.body.id = req.body.key
        }
        next()
    } catch (error) {
        throw new UnauthenticatedError('Not authorized to access this route')
    }
}



async function companyFilter(company) {

    try {
        // for (let item in SystemUserSchema.collection.conn.models) {
        //     console.log(item)
        //
        // }
        // SystemUserSchema.schema.pre('find', function (next) {
        //     // do stuff
        //     console.log("main filtering for systemUser")
        //     this.where({company});
        //     next();
        // })
        //
        // SystemUserSchema.pre('find', function (next) {
        //     // do stuff
        //     console.log("main filtering for systemUser")
        //     this.where({company});
        //     next();
        // });
        for (const item of mongoose.modelNames()) {
            // let q = mongoose.model(item)
            // q.schema.pre('find', function (next) {
            //     console.log("pre filter")
            //     // next()
            // })
            // let o = await q.findById('626e5e413a703f041e2e3861')
            // console.log(o)
            // const schema = new q();
            // schema.pre('find', function(next) {
            //     // do stuff
            //     next();
            // });
        }

    } catch (e) {
        console.error(e)
    }
}

function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const result = JSON.parse(jsonPayload)
    console.info(result)
    return result['user']['_id']
};
module.exports = {
    userMiddleware,
    adminAuthenticationMiddleware,
    mobileAuthenticationMiddleware
}
