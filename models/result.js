const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const resultSchema = Schema({
    user : {
        type : Schema.Types.ObjectId,
        ref : 'Person',
        required : true
    },
    exam : {
        type : Schema.Types.ObjectId,
        ref : 'Exam',
        required : true
    },
    marksAllocated : {
        type : Number,
        default : 0
    },
    percentile : {
        type : Number,
        default : 0
    },
    rank : {
        type : Number,
        default : 0
    },
    responses : [Number],
    meta : {
        ended : {
            type : Boolean,
            default : false
        },
        endedOn : Number,
        startedOn : {
            type : Number,
            default : Date.now
        },
        deviceDetails : {
            browser : String,
            os : String,
            ip : String,
        },
        disconnections : {
            type : Number,
            default : 0
        },
        isValid : { 
            type : Boolean,
            default : true
        }
    }
});

module.exports = mongoose.model('Result', resultSchema);