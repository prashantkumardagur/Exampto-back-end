const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionSchema = Schema({
    paymentId : String,
    eventId : String,
    status : { 
        type: String,
        enum : ['success', 'failed', 'pending'],
        default : 'pending'
    },
    amount : Number,
    method : {
        type : String,
        default : 'internal'
    },
    currency : {
        type : String,
        default : 'EXAMPTO_COINS'
    },
    user : {
        type : Schema.Types.ObjectId,
        ref : 'Person'
    },
    timeStamp : {
        type : Number,
        default : Date.now()
    },
    razorpayEntity : Object,
    meta : {
        title : String,
        description : String,
        kind : {
            type : String,
            enum : ['withdraw', 'deposit', 'credit', 'debit']
        }
    }
});

module.exports = mongoose.model('Transaction', transactionSchema);