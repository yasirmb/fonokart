
var db = require('../dbconfig/connection')
var collection = require('../dbconfig/collection')
// const { Collection } = require('mongoose');
const { ObjectId } = require('mongodb')


module.exports={

    GET_ORDER_WALLET: (email, paymentMethod) => {
        return new Promise(async(resolve, reject) => {
          let orderDetails =await db.get().collection(collection.ORDER_COLLECTION).find({ emailId: email, paymentMethod: paymentMethod }).toArray()
            resolve(orderDetails)
            // .catch((error) => {
            //   console.log(error);
            //   reject(error);
            // });
        });
      },


      GET_WALLET : (email) => {
      
        return new Promise(async (resolve, reject) => {
          const walletDetails = await db.get().collection(collection.ORDER_COLLECTION).findOne(
            {
              emailId: email
            })
            
          resolve(walletDetails)
        })
      },

      WALLET_BALANCE : (email) => {
        return new Promise(async(resolve , reject) => {
          const balance =await db.get().collection(collection.WALLET_COLLECTION).findOne({emailId : email})
          resolve(balance)
        })
      },

      CREATE_WALLET : (data) => {
        return new Promise((resolve , reject) => {
            const walletDetails = db.get().collection(collection.WALLET_COLLECTION).insertOne({
                emailId : data.email,
                balance : 0.0
            })
            resolve()
        })
    },

      UPDATE_WALLET: (email, amount) => {
        console.log(email,'emailllllllllll');
        console.log(amount,'amountttttttttttt amount');
        return new Promise(async (resolve, reject) => {
          if (isNaN(amount)) {
            reject(new Error("Invalid amount. Amount must be a number."));
            return;
          }
      
          let status = await db
            .get()
            .collection(collection.WALLET_COLLECTION)
            .updateOne(
              {
                emailId: email,
              },
              {
                $inc: {
                  balance: amount,
                },
              }
            );
          resolve(status);
        });
      },
}
