// const {myEmitter} = require("./middleware/event-emitter");
const request = require('request');
const axios = require('axios')
require('dotenv').config();
require('express-async-errors');
const morgan = require('morgan')
const jwt = require('jsonwebtoken');
const fs = require('fs');
var ejsLayouts = require('express-ejs-layouts');

const express = require('express')
const app = express();
const bodyParser = require('body-parser')
const connectDb = require('./data/db')
const cors = require('cors');
const port = process.env.PORT || 5000
const multer = require('multer');
const path = require('path')
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');
const http = require('http').Server(app);

const cron = require('node-cron');

const io = require('socket.io')(http);
// ----------
const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const middleware = require('i18next-http-middleware');

var DIR = './uploads/';

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DIR)
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    }
})
// const upload = multer();
let upload = multer()
app.use(multer({
    dest: './uploads/',
    rename: function (fieldname, filename) {
        return filename + Date.now() + '.' + path.extname(filename.originalname);
    },
    onFileUploadStart: function (file) {
    },
    onFileUploadComplete: function (file) {
    },
    storage: storage
}).single('photo'));


app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
});


i18next
    .use(Backend)
    .use(middleware.LanguageDetector)
    .init({
        fallbackLng: 'tr',
        backend: {
            loadPath: './locales/{{lng}}/translation.json'
        }
    })
app.use(middleware.handle(i18next));
const todoRouter = require('./routers/todo.router');



app.use(morgan('dev'))
// app.use(bodyParser.text({ type: '/' }));
app.use(bodyParser.json({limit: '50mb'}))
app.use(bodyParser.urlencoded({extended: true}))

app.use(express.static('./public'));
app.use(express.static('./externalFiles'));
app.use(express.json());
// app.use(express.static('./apidoc'));
app.use('/paytrFiles', express.static('paytr/files'))
app.set('views', path.join(__dirname, '/paytr/views'));
app.set('view engine', 'ejs')
app.use(ejsLayouts);

const https = require("https");
const {
    roomIdGenerator,
    decryptJwtUser,
    decryptJwtotel,
    verifyJWTOtel,
    verifyJWTDovmeci,
    verifyJWTUser,
    thumb, verifyJWT
} = require("./helpers/utils");

app.use(cors());
app.get('/docs', function (req, res) {
    res.sendfile('apidoc/index.html');
});
app.use('/uploads', express.static('uploads'))
app.post('/api/upload', upload.single('photo'), function (req, res,next) {

    // return res.status(200).send()
    if (!req.file) {
        return res.status(400).send()
    }
    return res.send({success: true, filename: process.env.UPLOADURL+ '/uploads/' + req.file.filename})
})
app.get("/privacy", function (req, res) {
    res.sendfile("privacy.html");
});
app.get("/terms", function (req, res) {
    res.sendfile("terms.html");
});
app.use('/api/todo', todoRouter);




app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);


let interval
app.set('io', io);
global.io = io
io.use(function (socket, next) {
    if (socket.handshake.query && socket.handshake.query != null && socket.handshake.query != "null" && socket.handshake.query.token && socket.handshake.query.token != null && socket.handshake.query.token != "null") {
        socket.token = socket.handshake.query.token

        const isVerifyJWT = verifyJWT(socket.token);
        if (!isVerifyJWT || isVerifyJWT === undefined) {
            console.error('JWT Token Not Valid');
            next(new Error('Authentication error for socket'));

        } else {
            const {user} = isVerifyJWT;
            socket.decoded = socket.token
            socket.userId = user._id
            socket.userType = user.userType
            myEmitter.emit('socketLogin', {id: socket.id, userId: socket.userId, userType: socket.userType})
            next();
        }

    } else {
        next(new Error('Authentication error for socket'));
    }
}).on('connection', function (socket) {
    //kapoğlu
    // emitter.on('aracBul', (data) => {
    //     console.log("*-*-*-")
    // })
    socket.on('login', function (obj) {
        obj.userid = socket.userId;
        myEmitter.emit('socketLogin', obj)
        // let check = onlineUsers.filter(a => a.socketid === obj.socketid);

        // if (check.length === 0) {
        //     onlineUsers.push(obj)
        //     emitter.emit('sockerUserLoggedIn', onlineUsers)
        // }
        io.emit('custom', {msg: "Sa yiğido"})

        // io.emit('newUserLoggedIn',{aaa  : "qwşlkjeh" , userId : socket.userId, userType : socket.userType})
    });
    socket.on('disconnect', function () {
        // myEmitter.emit('socketLogin',"obj")
        // if (onlineUsers.hasOwnProperty(socket.name)) {
        //     var obj = {userid: socket.name, username: onlineUsers[socket.name]};
        //     delete onlineUsers[socket.name];
        //
        //     io.emit('logout', {onlineUsers: onlineUsers, user: obj});
        // }
    });


});
const start = async () => {
    // amazonUpload()

    let q = await connectDb();


    http.listen(port, function () {
        // setInterval(()=>{
        //     reqMyself('cron',1,{},null)
        // },10000)
        // // packagePurchaseRouter.post('/notificationForAlmost')
        // cron.schedule('48 10 * * *', () => {
        //     reqMyself('packagePurchase/notificationForAlmost', 2, {}, null)
        // });
        // cron.schedule('14 11 * * *', () => {
        //     reqMyself('randevu/remind1dayago', 2, {}, null)
        // });

    })

}

function reqMyself(ext, method, data, token) {
    const url = process.env.SOCKET + '/api/' + ext
    let headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
    }
    switch (method) {
        case 2:
            axios.post(url, data, {
                headers: headers
            })
                .then((response) => {
                    // dispatch({
                    //     type: FOUND_USER,
                    //     data: response.data[0]
                    // })
                })
                .catch((error) => {
                    // dispatch({
                    //     type: ERROR_FINDING_USER
                    // })
                })
        case 1:
            axios.get(url, {
                headers: headers
            })
                .then((response) => {
                    // dispatch({
                    //     type: FOUND_USER,
                    //     data: response.data[0]
                    // })
                })
                .catch((error) => {
                    // dispatch({
                    //     type: ERROR_FINDING_USER
                    // })
                })

    }
}

start().then(r => {
    console.log("lets get it started " + port)
})


module.exports = {
    storage,
    upload,

}
