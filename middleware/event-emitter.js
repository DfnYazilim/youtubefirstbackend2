const EventEmitter = require('events');
const {sendToOneUser} = require("../controllers/notification.controller");
let onlineUsers = [];

class MyEmitter extends EventEmitter {
}

const myEmitter = new MyEmitter();
myEmitter.on('*', function (value1, value2) {
    console.log(this.event, value1, value2);
    console.log("all events listening")
});
myEmitter.on('socketLogin', (data) => {
    onlineUsers = onlineUsers.filter(a => a.userId !== data.userId)
    onlineUsers.push(data)
})
myEmitter.on('aracBul', (data) => {
    // console.log(data)

    let uss = whoToSend(data.users)
    uss.forEach(u => {
        console.log(u)
        global.io.to(u.id).emit('aracBul', data.data)
        let notObj = {
            to : u.userId,
            title : "Yeni bir araç talebi",
            content : "Yeni bir araç talebi",
            fromUser: true,
            isFromAdmin: false,
            extData: {}
        }
        sendToOneUser(notObj,false)
    })

})
myEmitter.on('qrReadCustomer', (data) => {
    console.log(data.data.user)
    let uss = whoToSend([data.data.user.toString()])
    uss.forEach(u => {
        let notObj = {
            to : u.userId,
            title : "Yolculuk bitiriliyor",
            content : "Yolculuk bitiriliyor",
            fromUser: true,
            isFromAdmin: false,
            extData: {}
        }
        sendToOneUser(notObj,false)
        global.io.to(u.id).emit('qrReadCustomer', data.data)
    })
})
myEmitter.on('makeItDone', (data) => {
    let uss = whoToSend([data.data.acceptedTaksi.toString()])
    console.log(uss)
    uss.forEach(u => {
        global.io.to(u.id).emit('makeItDone', data.data)
    })
})
myEmitter.on('aracBulDelete', (data) => {
    global.io.emit('aracBulDelete', data)
})
myEmitter.on('aracBulRejected', (data) => {
    let uss = whoToSend([data.user])

    uss.forEach(u => {
        global.io.to(u.id).emit('aracBulRejected', data.data)
    })

})
myEmitter.on('aracBulAcceptedUser', (data) => {
    let uss = whoToSend([data.data.user.toString()])
    uss.forEach(u => {
        let notObj = {
            to : u.userId,
            title : "Ödeme bekleniyor",
            content : "Ödeme Bekleniyor",
            fromUser: true,
            isFromAdmin: false,
            extData: {}
        }
        sendToOneUser(notObj,false)
        global.io.to(u.id).emit('aracBulAcceptedUser', data.data)
    })
})
myEmitter.on('cancelBeforeStart', (data) => {
    console.log(data)
    let uss = whoToSend([data.data.acceptedTaksi.toString()])
    uss.forEach(u => {
        global.io.to(u.id).emit('cancelBeforeStart', data.data)
    })
})

myEmitter.on('payed', (data) => {
    console.log(data)
    let uss = whoToSend([data.user])
    uss.forEach(u => {
        global.io.to(u.id).emit('payed', data)
    })
})
myEmitter.on('aracBulAccepted', (data) => {
    global.io.emit('aracBulAccepted', data)
})

function myEmitterMiddleware(channel) {
    // myEmitter.once('myEvent', (data) => {
    //     console.log('myEvent received with data:', data);
    //     // Do some actions based on the event
    //
    // });
}

function whoToSend(users) {
    console.log("onlineUsers is below")
    console.log(onlineUsers)
    const commonObjects = onlineUsers.filter(obj1 => users.some(obj2 => obj1.userId === obj2));
    return commonObjects

}

module.exports = {myEmitter, myEmitterMiddleware};
