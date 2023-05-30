const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const jsonwebtoken = require("jsonwebtoken");
const {Client} = require("@googlemaps/google-maps-services-js");
const nodemailer = require('nodemailer');
const {IV, SECRET, IVOTEL, SECRETOTEL, SECRETUSER, SECRETDOVMECI, ADMIN_JWT_SECRET, SECRETADMIN} = process.env;
const algorithm = 'aes-256-cbc';
const imageThumbnail = require("image-thumbnail");
const thumb = (req) => {
    if (req.file.mimetype == 'application/pdf' || req.file.mimetype == 'application/octet-stream' || req.file.mimetype.startsWith('video')) return
    const inkb = req.file.size / 1024;
    const yuzkb = 100;

    let options = {percentage: inkb > yuzkb ? (yuzkb / inkb) * 100 : 100, responseType: 'base64'}
    imageThumbnail(req.file.path, options).then((thumbnail) => {
        var base64Data = thumbnail.replace(/^data:image\/png;base64,/, "");
        require("fs").writeFile(req.file.destination + "thumb_" + req.file.filename, base64Data, 'base64', function (err) {

        });
    });
}

function randomEmail() {
    var chars = 'abcdefghijklmnopqrstuvwxyz1234567890';
    var string = '';
    for (var ii = 0; ii < 15; ii++) {
        string += chars[Math.floor(Math.random() * chars.length)];
    }
    return string + '@fakie.com'
}

function jwtMaker(user) {
    user.token = '';
    const token = jwt.sign({user}, process.env.JWT_SECRET, {
        expiresIn: '30d',
    })
    return token;
}

function jwtMakerAdmin(user) {
    user.token = '';
    const token = jwt.sign({user}, process.env.ADMIN_JWT_SECRET, {
        expiresIn: '30d',
    })
    return token;
}

const authenticate = (salt, password, hash) => {
    if (!password || !salt) return false;

    return encryptPassword(salt, password) === hash;
};
const makeSalt = () => crypto.randomBytes(16).toString('base64');
const encryptPassword = (_salt, password) => {
    const salt = Buffer.from(_salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('base64');
};
const getRandomFiveDigit = () => Math.floor(10000 + Math.random() * 90000);
const getRandomFourDigit = () => Math.floor(1000 + Math.random() * 9000);
const signJWTSystemUser = (payload) => {
    const token = jsonwebtoken.sign(payload, ADMIN_JWT_SECRET, {expiresIn: '7d'});
    return token;
};
const verifyJWTSystemUser = (token) => {
    try {
        const decoded = jsonwebtoken.verify(token, ADMIN_JWT_SECRET);
        return decoded;
    } catch (err) {
        console.error(`[ JWT VERIFY ] ${err}`);
        return null;
    }
}

function distanceCalc(lat1, lon1, lat2, lon2, unit) {
    if ((lat1 == lat2) && (lon1 == lon2)) {
        return 0;
    } else {
        var radlat1 = Math.PI * lat1 / 180;
        var radlat2 = Math.PI * lat2 / 180;
        var theta = lon1 - lon2;
        var radtheta = Math.PI * theta / 180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180 / Math.PI;
        dist = dist * 60 * 1.1515;
        if (unit == "K") {
            dist = dist * 1.609344
        }
        if (unit == "N") {
            dist = dist * 0.8684
        }
        return dist;
    }
}

const signJWT = (payload) => {
    const token = jsonwebtoken.sign(payload, SECRET, {});
    return token;
};
const signJWTAdmin = (payload) => {
    const token = jsonwebtoken.sign(payload, SECRETADMIN, {});
    return token;
};


const encryptJwt = (jwtToken) => {
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(SECRET, 'hex'), Buffer.from(IV, 'hex'));
    const encrypted = Buffer.concat([cipher.update(jwtToken), cipher.final()]);
    return encrypted.toString('hex');
}
const encryptJwtOtel = (jwtToken) => {
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(SECRETOTEL, 'hex'), Buffer.from(IVOTEL, 'hex'));
    const encrypted = Buffer.concat([cipher.update(jwtToken), cipher.final()]);
    return encrypted.toString('hex');
}
const isReallyNull = (value) =>
    !!(typeof value === 'undefined' || Object.keys(value).length === 0 || value === undefined || value === null || value.length === 0);

const decryptJwt = (hash) => {
    try {
        const decipher = crypto.createDecipheriv(algorithm, Buffer.from(SECRET, 'hex'), Buffer.from(IV, 'hex'));
        const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash, 'hex')), decipher.final()]);
        return decrpyted.toString();
    } catch (error) {
        console.log(`[DECRYPT JWT ERROR]: ${error}`);
        return '';
    }
};
const decryptJwtUser = (hash) => {
    try {
        const decipher = crypto.createDecipheriv(algorithm, Buffer.from(SECRET, 'hex'), Buffer.from(IV, 'hex'));
        const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash, 'hex')), decipher.final()]);
        return decrpyted.toString();
    } catch (error) {
        console.log(`[DECRYPT JWT ERROR]: ${error}`);
        return '';
    }
};
const decryptJwtotel = (hash) => {
    try {
        const decipher = crypto.createDecipheriv(algorithm, Buffer.from(SECRETOTEL, 'hex'), Buffer.from(IVOTEL, 'hex'));
        const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash, 'hex')), decipher.final()]);
        return decrpyted.toString();
    } catch (error) {
        console.log(`[DECRYPT JWT ERROR]: ${error}`);
        return '';
    }
};
const verifyJWT = (token) => {
    try {
        const decoded = jsonwebtoken.verify(token, SECRET);
        return decoded;
    } catch (err) {
        console.error(`[ JWT VERIFY ] ${err}`);
        return null;
    }
}
const verifyJWTAdmin = (token) => {
    try {
        const decoded = jsonwebtoken.verify(token, SECRETADMIN);
        return decoded;
    } catch (err) {
        console.error(`[ JWT VERIFY ] ${err}`);
        return null;
    }
}
const verifyJWTUser = (token) => {
    try {
        const decoded = jsonwebtoken.verify(token, SECRETUSER);
        return decoded;
    } catch (err) {
        console.error(`[ JWT VERIFY ] ${err}`);
        return null;
    }
}
const verifyJWTDovmeci = (token) => {
    try {
        const decoded = jsonwebtoken.verify(token, SECRETDOVMECI);
        return decoded;
    } catch (err) {
        console.error(`[ JWT VERIFY ] ${err}`);
        return null;
    }
}

const verifyJWTOtel = (token) => {
    try {
        const decoded = jsonwebtoken.verify(token, SECRETOTEL);
        return decoded;
    } catch (err) {
        console.error(`[ JWT VERIFY ] ${err}`);
        return null;
    }
}

const usageDuration = (duration) => {
    let a = duration.split(':')
    let seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);

    return seconds
}
const roomIdGenerator = (user1, user2) => {
    let users = [user1, user2]
    users.sort((a, b) => a.toString().toLowerCase().localeCompare(b.toString().toLowerCase()))

    return users[0] + '_' + users[1]
}
const transporter = nodemailer.createTransport({
    service: 'gmail',
    // host: "mail.sigortaprime.com",
    port: 587,
    secure: false,
    tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false,
    },
    // auth: {

    //   user: 'famametric@gmail.com',
    //   pass: '9Xwe8mJkcEfTPh(/',
    // }
    auth: {
        user: 'utku@kaposoft.com',
        pass: 'pjatbokdrrdrxtyg',
        // user: 'apphelp@sigortaprime.com',
        // pass: 'N2fH3qM7-*'
    },
});
const mailOptions = {
    from: 'utku@kaposoft.com',
    to: 'ukapoglu@gmail.com',
    subject: 'Hello there',
    text: 'content is here',
};
const sendEmail = async (to, subject, content) => {
    try {
        mailOptions.to = to;
        mailOptions.subject = subject;
        mailOptions.text = content;
        let result = await transporter.sendMail(mailOptions);
    } catch (e) {
        console.error("mail error below : ")
        console.error(e)
    }
};
const getRandomSixDigit = () => Math.floor(100000 + Math.random() * 900000);





module.exports = {
    sendEmail,
    verifyJWT,
    randomEmail,
    jwtMaker,
    jwtMakerAdmin,
    authenticate,
    getRandomFiveDigit,
    getRandomFourDigit,
    encryptPassword,
    makeSalt,
    signJWTSystemUser,
    encryptJwt,
    isReallyNull,
    decryptJwt,
    signJWT,
    decryptJwtUser,
    verifyJWTUser,
    usageDuration,
    decryptJwtotel,
    verifyJWTOtel,
    encryptJwtOtel,
    roomIdGenerator,
    verifyJWTDovmeci,
    thumb,
    getRandomSixDigit,
    verifyJWTSystemUser,
    verifyJWTAdmin,
    signJWTAdmin,
    distanceCalc,

}
