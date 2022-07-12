const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contentSchema = new Schema({
    question : {
        text : String,
        image : String
    },
    options : [{
        kind : {
            type : String,
            enum : ['text', 'image']
        },
        text : String
    }]
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
        availableForPractice: {
            type : Boolean,
            default : false
        },
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

examSchema.index({name: 'text'});

module.exports = mongoose.model('Exam', examSchema);