const mongoose = require('mongoose');
const { Schema } = mongoose.Schema;

const transactionSchema = Schema({
    transactionId : String,
    status : { enum : ['success', 'failed', 'pending'] },
    amount : Number,
    currency : String,
    gateway : String,
    payee : String,
    user : {
        type : Schema.Types.ObjectId,
        ref : 'Person'
    },
    timeStamp : Date,
    isRefunded : Boolean,
    refundId : String,
    meta : {
        type : String,
        ip : String,
        description : String
    }
});

module.exports = mongoose.model('Transaction', transactionSchema);