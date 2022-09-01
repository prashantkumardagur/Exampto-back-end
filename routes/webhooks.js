const express = require('express');
const router = express.Router();

const Transaction = require('../models/transaction');
const Person = require('../models/person');

const { validateWebhookSignature } = require('razorpay/dist/utils/razorpay-utils');

// =============================================================================================================

router.post('/payment', async (req, res) => {
    let receivedSignature = req.headers['x-razorpay-signature'];
    let secret = process.env.RAZORPAY_SECRET;

    if(validateWebhookSignature(JSON.stringify(req.body), receivedSignature, secret)){

      let data = req.body.payload.payment.entity;

      let checkTransaction = await Transaction.findOne({paymentId: data.id});
      if(checkTransaction) return res.status(200).send('Transaction already exists');

      let transaction = new Transaction({
        paymentId: data.id,
        eventId: req.headers['x-razorpay-event-id'],
        status: data.status === 'captured' ? 'success' : 'failed',
        amount: (data.amount / 100),
        method: data.method,
        currency: data.currency,
        timeStamp: Date.now(),
        razorpayEntity: data,
        meta: {
          title: "Coins purchased",
          description: `Transaction ID: ${data.id} ${data.status !== 'captured' && 'Failed'}`,
          kind: 'deposit'
        }
      });

      let user = await Person.findOne({ email: data.email });

      if(user){
        transaction.user = user._id;
        await transaction.save();
        if(data.status === 'captured') user.wallet.coins += (data.amount / 100);
        user.wallet.transactions.push(transaction._id);
        await user.save();
      } else {
        transaction.status = 'pending';
        await transaction.save();
      }

      res.sendStatus(200);

    } else {
      res.sendStatus(400);
    }
});


// =============================================================================================================

module.exports = router;