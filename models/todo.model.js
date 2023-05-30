const mongoose = require('mongoose')
const {Schema} = require('mongoose');
const TodoSchema = new mongoose.Schema({
    title: {
        type: Schema.Types.String,
        required: true,
    },
    description: {
        type: Schema.Types.String,
        required: true,
    },

    isDone: {
        type: Schema.Types.Boolean,
        default: false
    },
    createdTime: {
        type: Schema.Types.Date,
        default: Date.now
    },

}, {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
})
module.exports = mongoose.model('Todo', TodoSchema)

