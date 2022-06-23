const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contentSchema = new Schema({ 
    question : String,
    options : [String]
 }, { _id : false });

const examSchema = Schema({
    name : {
        type : String,
        required : true,
        default: 'New Test Name'
    },
    category : [{ 
        type : String,
        enum : ['JEE', 'NEET', 'SSC'],
        required : true
    }],
    marking : {
        positive : Number,
        negative : Number,
    },
    duration : Number,
    startTime : Number,
    lastStartTime : Number,
    price : {
        type : Number,
        default : 0
    },
    solutions : {
        type : Number,
        default : 0
    },
    contents : [contentSchema],
    answers : [Number],
    meta : {
        isPublished : {
            type : Boolean,
            default : false
        },
        studentsEnrolled : { 
            type : Number,
            default : 0
        },
        resultDeclared : {
            type : Boolean,
            default : false
        },
        isPrivate : {
            type : Boolean,
            default : false
        },
        createdOn : Number,
        resultDeclaredOn : Number,
        creater : {
            type : Schema.Types.ObjectId,
            ref : 'Person'
        }
    }
});

module.exports = mongoose.model('Exam', examSchema);