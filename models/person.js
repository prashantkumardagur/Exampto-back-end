const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const personSchema = new Schema({
    name : {
        type : String,
        required : true,
        minLength : 3,
        maxLength : 32
    },
    email : {
        type : String,
        required : true,
        minLength : 3,
        maxLength : 64
    },
    role : {
        type : String,
        enum : ['user', 'coordinator', 'admin'],
        default : 'user'
    },
    phone : String,
    dob : Date,
    gender : String,
    program : { 
        type: String,
        enum: ['JEE', 'NEET', 'SSC']
    },
    nationality : String,
    institution : {
        name : String,
        location : String,
        country : String
    },
    wallet : {
        coins : {
            type : Number,
            min : 0,
            default : 0
        },
        transactions : {
            type : Schema.Types.ObjectId,
            ref : 'Transaction'
        },
        withdrawDetails : {
            method : String,
            id : String
        }
    },
    examsEnrolled : [{
        type : Schema.Types.ObjectId,
        ref : 'Exam'
    }],
    results : [{
        type : Schema.Types.ObjectId,
        ref : 'Result'
    }],
    meta : {
        createdOn : {
            type : Date,
            default : Date.now
        },
        lastUpdated : {
            type : Date,
            default : Date.now
        },
        registrationCompleted : {
            type : Boolean,
            default : false
        },
        isDisabled : {
            type : Boolean,
            default : false
        },
        isBanned : {
            type : Boolean,
            default : false
        },
        lastLogin : {
            time : {
                type : Date,
                default : Date.now
            },
            ip : {
                type : String,
                default : '0.0.0.0'
            }
        }
    }
});

personSchema.plugin(passportLocalMongoose);

module.exports =  mongoose.model('Person', personSchema);