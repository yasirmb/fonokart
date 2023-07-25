let db = require('../dbconfig/connection')
let collection = require('../dbconfig/collection')
const bcrypt = require('bcrypt')
const { ObjectId } = require('mongodb')
let objectId= require('mongodb'). ObjectId
const { log } = require('console')
const { resolve } = require('path')
const { rejects } = require('assert')
const { response } = require('express')
const Razorpay = require('razorpay')
var instance = new Razorpay({
    key_id: 'rzp_test_6TwAbY5JkBXwMZ',
    key_secret: '6p6uiapcPlsrAlNbaAe5XVh6',
  });

let moment = require('moment');

// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const serviceid= process.env.TWILIO_SERVICE_SID;
// const client = require("twilio")(accountSid, authToken);

require('dotenv').config()
const client = require("twilio")(process.env.TWILIO_ACCOUNT_SID,process.env.TWILIO_AUTH_TOKEN);



module.exports={

    

    doSignup:(userData)=>{
        userData.date=new Date()
        userData.address=[]
         userData.isBlocked=false 
        return new Promise(async (resolve, reject) => {

            let userWithMobile = await db.get().collection(collection.USER_COLLECTION).find({ mobile : userData.mobile }).toArray()
            let userWithEmail = await db.get().collection(collection.USER_COLLECTION).find({email : userData.email}).toArray()
            let rejectResponse={}
            if (userWithEmail.length > 0 && userWithEmail.length) {
                rejectResponse.emailExists=true
                reject(rejectResponse)
            }
            
            else if (userWithMobile.length > 0) {
                rejectResponse.mobileExists=true
                reject(rejectResponse)
            }
            else{
                userData.password = await bcrypt.hash(userData.password, 10)
                db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((userData) => {
                    let user =  db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
                   
                    resolve(user)
                })
            }


    
           
        }) 
    
    
    },
// doSignup:(userData)=>{
//     userData.date=new Date()
//     userData.address=[]
//      userData.isBlocked=false 
//     return new Promise(async (resolve, reject) => {

//         userData.password = await bcrypt.hash(userData.password, 10)
//         db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((userData) => {
//             resolve(userData)
//         })
//     }) 


// },
dologin:(userData)=>{
    console.log(userData.email, '>>>');

    return new Promise(async (resolve, reject) => {
        let loginStatus = false
        let response = {}
        let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
        if (user) {
            if(user.isBlocked){
                reject({error:"user is blocked"})
            }else{
                bcrypt.compare(userData.password, user.password).then((status) => {
                if (status) {

                    console.log("login success");
                    response.user = user
                    response.status = true
                    resolve(response)
                } else {
                    
                    reject({ error:"invalid password" })
                }
            }).catch(()=>{
                    reject(error)
                })}
            
        }
        else {
            
            reject({ error:"invalid email" })

        }
    })
},

getAllUser: () => {
    return new Promise(async (resolve, reject) => {
        let AllUsers = await db.get().collection(collection.USER_COLLECTION).find().sort({date:-1}).toArray()
        resolve(AllUsers)
       
    })
},
getUserDetails: (userId) => {

    return new Promise(async (resolve, reject) => {
        try {
            let userProfile = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) })
            resolve(userProfile)
        } catch (error) {
            reject(error)
        }
    })
},

// editAddress: (userDetails) => {
//     return new Promise((resolve, reject) => {
//         console.log(userDetails.userId, "userDetails,userId")
//         db.get().collection(collection.USER_COLLECTION).updateOne({ _id:ObjectId(userDetails.userId) }, {
//             $set:
//             {
//                 name: userDetails.name,
//                 email: userDetails.email,
//                 mobile: userDetails.mobile,
//                 "address.0.address":userDetails.address,
//             }
//         }).then((response) => {
//             console.log('updated')
//             resolve(response)
//         })
// })
// },
// editAddress: (userDetails) => {

//     return new Promise((resolve, reject) => {
//         console.log(userDetails.mobile, "userDetails,userId")
//         db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(userDetails.userId) }, {
//             $set: {
//                 name: userDetails.name,
//                 email: userDetails.email,
//                 mobile: userDetails.mobile,
//                 "address.0.address": userDetails.address,
               
//             }
//         }).then((response) => {
//             console.log('updated')
//             resolve(response)
//         }).catch((error) => {
//             console.log('error', error);
//             reject(error);
//         });
//     });
// }

doOtp : (userData) => {
    console.log(userData,">>>>>>>>>>>>>>>>,,,,,,,,,,,,,,");
    let response = {}
    return new Promise(async(resolve , reject) => {
        let user =await db.get().collection(collection.USER_COLLECTION).findOne({mobile : userData.mobile})

        if(user){
            response.status = true
            response.user = user

            client.verify.services(process.env.TWILIO_SERVICE_SID)
            .verifications
            .create({ to: `+91${userData.mobile}`, channel: 'sms' })
            .then((data) => {

            })
            resolve(response)
        }
        else{
            response.status = false
            resolve(response)
        }
    })
},

getOtp: (userData) => {
    let response = {};
  
    return new Promise((resolve, reject) => {
      db.get().collection(collection.USER_COLLECTION).findOne({ mobile: userData.mobile })
        .then((userNumber) => {
          if (userNumber) {
              response.status = true;
              response.user = userNumber;
              
  
            client.verify.services(process.env.TWILIO_SERVICE_SID)
              .verifications
              .create({ to: `+91${userData.mobile}`, channel: 'sms' })
              .then((data) => {
                resolve(response);
              })
              .catch((error) => {
                reject(error);
              });
          } else {
            response.status = false;
            resolve(response);
          }
        })
        .catch((error) => {
          reject(error);
        });
    });

  },

//   changePassword: (data, userData) => {

//     userId = userData._id

  
//     return new Promise(async(resolve, reject) => {
//     data.password = await bcrypt.hash(data.password, 10)
//       db.get().collection(collection.USER_COLLECTION).updateOne(
//         { _id: new ObjectId(userId) },
//         {
//           $set: {
//             password: data.password,
//           },
//         }
//       )
//         .then(() => {
//           client.verify.services(process.env.TWILIO_SERVICE_SID)
//             .verificationChecks
//             .create({
//               to: `+91${userData.mobile}`,
//               code: data.mobile,
//             })
//             .then((data) => {
//               if (data.status == "approved") {
//                 resolve({ status: true });
//               } else {
//                 resolve({ status: false });
//               }
//             })
//             .catch((error) => {
//               console.log(error);
//               reject("An error occurred while verifying SMS code");
//             });
//         })
//         .catch((error) => {
//           console.log(error);
//           reject("An error occurred while updating password");
//         });
//     });
//   },



otpConfirm : (confirmotp , userData) => {
    console.log(confirmotp, "aaaaaaaaaaaaaaaaaaaa");
    console.log(userData,"oooooooooooooooooooooooooo");
    let otp = confirmotp.digit1 +confirmotp .digit2 + confirmotp.digit3 + confirmotp.digit4 + confirmotp.digit5 + confirmotp.digit6;
    console.log(otp,"nnnnnnnnnnnnnnnnnnnnnnn");
    return new Promise((resolve , reject) => {

        client.verify.services(process.env.TWILIO_SERVICE_SID)
        .verificationChecks
        .create({
            to: `+91${userData}`,
            code: otp
        }).then(async(data) => {
            if(data.status == 'approved'){
                let user = await db.get().collection(collection.USER_COLLECTION).findOne({ mobile: userData })

                resolve({status : true,user})
            }
            else{
                resolve({status : false})
            }
        })
    })
},



  viewTotalProduct: (pageNum, limit) => {
   
    let skipNum = parseInt((pageNum - 1) * limit)

    console.log(skipNum,"++++++++++++++++++++++++++++++++++++++++++++++++++++");

    return new Promise(async (resolve, reject) => {
        let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().skip(skipNum).limit(limit).toArray()
        console.log(products,"llllllllllllllllllllllllll");
        resolve(products)
    })
},

AddtoCart:(prodId,userId)=>{
    let prodObj = {
        item: objectId(prodId),
        quantity: 1
    }
    
    return new Promise(async(resolve,reject)=>{

        let userCart= await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
        if(userCart){
            let proExist = userCart.products.findIndex(product => product.item == prodId)

            if (proExist != -1) {
                db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId), 'products.item': objectId(prodId) },
                    {
                        $inc: { 'products.$.quantity': 1 }
                    }

                ).then(() => {
                    resolve()
                })

            }else{
                db.get().collection(collection.CART_COLLECTION)
            .updateOne({user:objectId(userId)},
            {
                
                    $push:{
                        products:prodObj
                    }

                
            }).then((response)=>{
                resolve()
            })
            }

            

        }else{
            let cartobj={
                user:objectId(userId),
                products: [prodObj]
               
            }
            db.get().collection(collection.CART_COLLECTION).insertOne(cartobj).then((response)=>{
                resolve()
            })
        }
        db.get().collection(collection.WISHLIST_COLLECTION).updateOne(
            { user:objectId(userId) }, // Specify the user ID
            { $pull: { products: { item: objectId(prodId) } } }
          )
    })

},
getCartproduct:(userId)=>{
    return new Promise(async(resolve,reject)=>{

        let cartItems=await db.get().collection(collection.CART_COLLECTION).aggregate([
            {
                $match:{user:objectId(userId)}
            },
            {
                $unwind: '$products'
            },
            {
                $project: {
                    item: '$products.item',
                    quantity: '$products.quantity',
                    user: 1
                }
            },
            {
                $lookup: {
                    from: collection.PRODUCT_COLLECTION,
                    localField: 'item',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            {
                $project: {
                    item: 1,
                    quantity: 1,
                    user: 1,
                    product: {
                        $arrayElemAt: ['$product', 0]
                    }
                }
            }
            
        ]).toArray()
        resolve(cartItems)

    })
},

getCartCount:(userId)=>{
    return new Promise(async(resolve,reject)=>{
        let count=0
            let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            if(cart){
               count=cart.products.length
            }
            resolve(count)
    })
},
changeProductQuantity: (details) => {
    console.log(details,"priceeeeeeeeeeee");
    details.count = parseInt(details.count)
    details.quantity = parseInt(details.quantity)
    return new Promise((resolve, reject) => {
         

        if (details.count == -1 && details.quantity == 1) {
            db.get().collection(collection.CART_COLLECTION)
            .updateOne({ _id: objectId(details.cart) },
                {
                    $pull: { products: { item: objectId(details.product) } }
                }
            ).then((response) => {
                resolve({ removeProduct: true })
            })
        }

        else {
            db.get().collection(collection.CART_COLLECTION)
            .updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },
                {
                    $inc: { 'products.$.quantity': details.count }
                }

            ).then((response) => {
                resolve({ status: true })
            })
        }
    
})
},

    deleteFromCart: (details) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION)
            .updateOne({ _id: objectId(details.cart) }, {

                $pull: { products: { item: objectId(details.product) } }

            }).then((response) => {
                resolve({removeProduct: true}) // response of deleting cart Item
            })
        })

    },
    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) },
                },
                {
                    $unwind: "$products",
                },
                {
                    $project: {
                        item: "$products.item",
                        quantity: { $toDouble: "$products.quantity" },
                    },
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: "item",
                        foreignField: "_id",
                        as: "product",
                    },
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: {
                            $arrayElemAt: ["$product", 0],
                        },
                    },
                },
                {
                    $project: {
                      item: 1,
                      quantity: 1,
                      product: 1,
                      totalPrice: {
                        $cond: {
                          if: { $gt: ["$product.offerPrice", null] },
                          then: { $multiply: [{ $toDouble: "$quantity" }, { $toDouble: "$product.offerPrice" }] },
                          else: { $multiply: [{ $toDouble: "$quantity" }, { $toDouble: "$product.price" }] },
                        },
                      },
                    },
                  },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$totalPrice" },
                    },
                },
            ]).toArray();
            console.log(total);
            resolve(total[0]?.total);
        });
    },

    //     getTotalAmount: (userId) => {
    //     return new Promise(async (resolve, reject) => {
    //         let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
    //             {
    //                 $match: { user: objectId(userId) },
    //             },
    //             {
    //                 $unwind: "$products",
    //             },
    //             {
    //                 $project: {
    //                     item: "$products.item",
    //                     quantity: { $toDouble: "$products.quantity" },
    //                 },
    //             },
    //             {
    //                 $lookup: {
    //                     from: collection.PRODUCT_COLLECTION,
    //                     localField: "item",
    //                     foreignField: "_id",
    //                     as: "product",
    //                 },
    //             },
    //             {
    //                 $project: {
    //                     item: 1,
    //                     quantity: 1,
    //                     product: {
    //                         $arrayElemAt: ["$product", 0],
    //                     },
    //                 },
    //             },
    //             {
    //                 $project: {
    //                     item: 1,
    //                     quantity: 1,
    //                     product: 1,
    //                     totalPrice: { $multiply: [{ $toDouble: "$quantity" }, { $toDouble: "$product.offerPrice" }] },
    //                 },
    //             },
    //             {
    //                 $group: {
    //                     _id: null,
    //                     total: { $sum: "$totalPrice" },
    //                 },
    //             },
    //         ]).toArray();
    //         console.log(total);
    //         resolve(total[0]?.total);
    //     });
    // },
    // getTotalAmount:(userId)=>{
    //     return new Promise(async(resolve,reject)=>{

    //         let total=await db.get().collection(collection.CART_COLLECTION).aggregate([
    //             {
    //                 $match:{user:objectId(userId)}
    //             },
    //             {
    //                 $unwind: '$products'
    //             },
    //             {
    //                 $project: {
    //                     item: '$products.item',
    //                     quantity: '$products.quantity',
    //                     user: 1
    //                 }
    //             },
    //             {
    //                 $lookup: {
    //                     from: collection.PRODUCT_COLLECTION,
    //                     localField: 'item',
    //                     foreignField: '_id',
    //                     as: 'product'
    //                 }
    //             },
    //             {
    //                 $project: {
    //                     item: 1,
    //                     quantity: 1,
    //                     user: 1,
    //                     product: {
    //                         $arrayElemAt: ['$product', 0]
    //                     }
    //                 }
    //             },
    //             {
    //                 $group:{
    //                     _id:null,
    //                     total:{$sum:{$multiply:['$quantity','$product.price']}}
    //                 }
    //             }
               
                
    //         ]).toArray()
            
            
    //         resolve(total[0]?.total);
    
    //     })

    // },
    placeorder:(order,products,total)=>{

        return new Promise((resolve,rejects)=>{
            console.log(order,products,total,"ooooooooooooooooooo");
            let status = order['payment-method'] === 'COD' ? 'placed' : 'pending'
            let orderObj = {
                deliveryDetails: {
                    name: order.uname,
                    mobile: order.mobile,
                    email: order.email,
                    address:order.address,
                    state: order.state,
                    homeNumber: order.houseNumber,
                    Town: order.town,
                    zip: order.pincode
                },
                userId: objectId(order.userId),
                paymentMethod: order['payment-method'],
                totalAmount:parseInt(total),
                products: products,
                date: moment().format('Do MMM  YY, hh:mm a'),
                created: new Date(Date.now()),
                status: status,
                
                

            }
            console.log(orderObj,"oooooooooooooooooooooo///////////////");
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                db.get().collection(collection.CART_COLLECTION).deleteOne({ user: objectId(order.userId) })
                resolve(response.insertedId)
            })
        })

    },
   
  
      changePaymentStatus : (orderId) => {
       
        return new Promise((resolve , reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({_id : objectId(orderId)} , 
        {
            $set : {
                status : 'placed'
            }
        }
        ).then(() => {
            resolve()
        })
        })
    },

    getAllorder: (userId) => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find({userId:objectId(userId)}).sort({date:-1}).toArray()
            console.log(orders,"ordeersssssssssssssss");
            resolve(orders)
           
        })
    },
    // getPaginatedUserOrders: (userID,limit,skip) => {
    //     return new Promise(async (resolve, reject) => {
    //         console.log(userID);
    //         let orders = await db.get().collection(collection.ORDER_COLLECTION)
    //             .find({ userID: objectId(userID) }).skip(skip).limit(limit).toArray()
    //         console.log(orders,'paginated orders');
            
    //         resolve(orders)
    //     })
    // },
    getCartProductList:(userId)=>{
        return new Promise(async(resolve,rejects)=>{
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            resolve(cart.products)
            console.log(cart,"pppppppppppppppppppppp");
        })
    }
    ,

   
    getUserorders:(userId)=>{
        return new Promise(async(resolve,reject)=>{
           let orders= await db.get().collection(collection.ORDER_COLLECTION).findOne({userId:objectId(userId)})
          
          
            resolve(orders)
        })
    },

    // getOrderProducts: (orderId) => {
    //     return new Promise(async (resolve, reject) => {
    //         let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
    //             {
    //                 $match: { _id: objectId(orderId) }
    //             },
    //             {
    //                 $unwind: '$products'
    //             },
    //             {
    //                 $project: {
    //                     item: '$products.item',
    //                     quantity: '$products.quantity',
    //                     MRP:'$products.price'
    //                 }
    //             },
    //             {
    //                 $lookup: {
    //                     from: collection.PRODUCT_COLLECTION,
    //                     localField: 'item',
    //                     foreignField: '_id',
    //                     as: 'product'
    //                 }
    //             },
    //             {
    //                 $project: {
    //                     item: 1, quantity: 1,MRP:1, product: { $arrayElemAt: ['$product', 0] }
    //                 }
    //             }


    //         ]).toArray()
    //         console.log(orderItems,']]]]]]]]]]]]]]]]]]]]');
    //         resolve(orderItems)
    //     })
    // },
    getOrderProducts: (orderId) => {

        return new Promise(async (resolve, reject) => {
            let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        _id: objectId(orderId)
                    }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity',
                        status: '$status'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] },
                        status: 1
                    }
                }

            ]).toArray()


            if(orderItems[0] != null){
                resolve(orderItems)
            }
            else{
                reject()
            }
        })

    },
   


    

    changeProductStatus: (data) => {
        let orderId = data.order
        let value = data.valueChange

        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) }, { $set: { "status": value } }).then((response) => {
                resolve(response)
            })
        })

    },

    orderCancel: (ordId) => {
        return new Promise(async(resolve, reject) => {
            let ordCancel =await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(ordId) },
                {
                    $set: {
                        status: "order cancelled"
                    }
                }
            )
            resolve(ordCancel)
        })

    },

    returnOrder: (ordId) => {
        return new Promise((resolve, reject) => {
            let ordReturn = db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(ordId) },
                {
                    $set: {
                        status: "product returned"
                    }
                }
            )
            resolve(ordReturn)
        })
    },

    getProductDetails: (ordId) => {
        
        return new Promise(async (resolve, reject) => {
            let productDetails = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: objectId(ordId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                }

            ]).toArray()
            resolve(productDetails)
        })
    },

    addAddress: (userAddress, userId) => {

        return new Promise((resolve, reject) => {
            userAddress.userAddressId = new Date().valueOf()
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) }, { $push: { Address: userAddress } })
            resolve()
        })

    },

    
    getAddress: (userId) => {
        return new Promise((resolve, reject) => {
            let address = db.get().collection(collection.USER_COLLECTION).aggregate([
                {
                    $match: { _id: objectId(userId) }
                },
                {
                    $unwind: '$Address'
                },
                {
                    $project: {
                        _id: 0,
                        Address: '$Address'
                    }
                }
            ]).toArray()
            resolve(address)
        })
    },

    getOneAddressById: (userId, address) => {

        let addressId = parseInt(address)

        return new Promise(async (resolve, reject) => {
            let address = await db.get().collection(collection.USER_COLLECTION).aggregate([
                {
                    $match: {
                        _id: objectId(userId)
                    }
                },
                {
                    $unwind: '$Address'
                },
                {
                    $match: { 'Address.userAddressId': addressId }
                },
                {
                    $project: {
                        Address: 1
                    }
                }
            ]).toArray()
            resolve(address[0])
        })
    },
    deleteOneAddressById: (userId, address) => {
        let addressId = parseInt(address);
    
        return new Promise(async (resolve, reject) => {
            try {
                const result = await db.get().collection(collection.USER_COLLECTION).updateOne(
                    { _id: objectId(userId) },
                    { $pull: { Address: { userAddressId: addressId } } }
                );
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    },
    

    changepassword: (data) => {
        console.log(data,'1111111111111111');
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: data.email })
            console.log(user,'2222222222222222222');
            bcrypt, bcrypt.compare(data.currentPassword, user.password).then(async (status) => {
                if (status) {
                    newPassword = await bcrypt.hash(data.newPassword, 10)
                    db.get().collection(collection.USER_COLLECTION).updateOne({ email: data.email }, {
                        $set: { password: newPassword }
                    })
                    resolve()
                }
                else {
                    reject()
                }
            })

        })
    },
    editAddress: (updatedAddress,addressId,userId) => {
        console.log(updatedAddress);
        updatedAddress.userAddressId=parseInt(updatedAddress.userAddressId);
        return new Promise(async (resolve, reject) => {
            try {
               
                await db.get().collection(collection.USER_COLLECTION).updateOne(
                    {
                        _id: objectId(userId),
                        'Address.userAddressId': addressId
                    },
                    { $set: { 'Address.$': updatedAddress } }
                );
                resolve();
            } catch (error) {
                reject(error);
            }
        });
      },
      getAllOffers: () => {
        return new Promise(async(resolve, reject) => {
            let coupen =await db.get().collection(collection.COUPON_COLLECTION).find().toArray()
            console.log(coupen,'coupennnnnnnnnn');
            resolve(coupen)
        })
    },

    applyCoupen : (details , userId , date , totalAmount) => {
        return new Promise(async(resolve , reject) => {
            let response = {}
            let coupen = await db.get().collection(collection.COUPON_COLLECTION).findOne({ code : details.coupon , status : true })
            
            if(coupen) {
                const expDate = new Date(coupen.endingDate)
                response.coupenData = coupen
                let user = await db.get().collection(collection.COUPON_COLLECTION).findOne({ code : details.coupon , users : ObjectId(userId) })

                if(user){
                    response.used = "coupen is already used"
                    resolve(response)
                }
                else{
                    if(date <= expDate){
                        response.dateValid = true
                        resolve(response)

                        let total = totalAmount

                        if(total >= coupen.minAmount){
                            response.veriftminAmount = true
                            resolve(response)

                            if(total <= coupen.maxAmount){
                                response.verifymaxAmount = true
                                resolve(response)
                            }
                            else{
                                response.veriftminAmount = true
                                response.verifymaxAmount = true
                                resolve(response)
                            }
                        }
                        else{
                            response.minAmountMsg = 'your min purchase should be : ' + coupen.minAmount
                            response.minAmount = true
                            resolve(response)
                        }
                    }
                    else{
                        response.invalidDateMsg = 'Coupen Expired'
                        response.invalidDate = true
                        response.Coupenused = false

                        resolve(response)
                    }
                }
            }
            else{
                response.invalidCoupen = true
                response.invalidCoupenMsg = 'Invalid Coupen'
                resolve(response)

            }
            if(response.dateValid && response.veriftminAmount && response.verifymaxAmount){
                response.verify = true

                db.get().collection(collection.CART_COLLECTION).updateOne({ user : ObjectId(userId) } , 
                {
                    $set : {
                        coupen : ObjectId(coupen._id)
                    }
                }
                )
                resolve(response)
            }
        })
    },
      
    userImage: (userimg,userId) => {
        console.log(userimg,'userimg');
        console.log(userId,'userId');
        
        
        return new Promise((resolve, reject) => {

            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) }, {  $set: { image: userimg } }).then((response)=>{
                resolve(response)
            })
        })

    },
    
    dosignupOtp : (userData) => {
        console.log(userData,">>>>>>>>>>>>>>>>,,,,,,,,,,,,,,");
        let response = {}
        return new Promise(async(resolve , reject) => {

    
           
                response.status = true
              
    
                client.verify.services(process.env.TWILIO_SERVICE_SID)
                .verifications
                .create({ to: `+91${userData.mobile}`, channel: 'sms' })
                .then((data) => {
    
                })
                resolve(response)
          
        })
    },
    addToWishlist: (productId, userId) => {
        let productObject = {
            item: objectId(productId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userWishlist = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ user: objectId(userId) })
            if (userWishlist) {
                let productExists = userWishlist.products.findIndex(products => products.item == productId)
                if (productExists != -1) {
                    db.get().collection(collection.WISHLIST_COLLECTION).updateOne({ user: objectId(userId) }, {
                        $pull: { products: { item: objectId(productId) } }
                    }).then(() => {
                        resolve()
                    })
                } else {
                    db.get().collection(collection.WISHLIST_COLLECTION)
                        .updateOne({ user: objectId(userId) }, {

                            $push: { products: productObject }

                        }).then((response) => {
                            resolve(response)
                        })
                }

            }
            else {
                let wishlistObject = {
                    user: objectId(userId),
                    products: [productObject]
                }
                db.get().collection(collection.WISHLIST_COLLECTION).insertOne(wishlistObject).then((response) => {
                    resolve(response)
                })
            }
        })
    },
    getWishlistId: (user) => {
        return new Promise(async (resolve, reject) => {
            let wishListItems = await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
                {
                    $match: { user: objectId(user) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        _id: 0

                    }
                },
                // {
                //     $project: {
                //         item: 1,
                //     }
                // }


            ]).toArray()

            finalArray = wishListItems.map(function (obj) {
                return obj.item;
            });
            resolve(finalArray)

        })
    },
     getWishlistProduct: (userId) => {
        return new Promise(async (resolve, reject) => {
            let wishListItems = await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, 
                        quantity: 1,
                         product: { $arrayElemAt: ['$product', 0] }
                    }
                }


            ]).toArray()
            resolve(wishListItems)
           
            console.log(wishListItems)
        })
    },
    deleteFromWishlist: (details) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.WISHLIST_COLLECTION).updateOne({ _id: objectId(details.wishlist) }, {
                $pull: { products: { item: objectId(details.product) } }
            }).then(() => {
                resolve() // response of deleting cart Item
            })
        })
    },
    generateRazorpay:(orderId,total)=>{
        return new Promise((resolve,reject)=>{
            var options = {
                amount: total*100,
                currency: "INR",
                receipt: orderId.toString(),
            }
            instance.orders.create(options, function (err, order) {

                if (err) {
                    console.log(err);
                    reject(err)
                }
                else {
                    console.log(order,"new orderrrrrrrrrrrrrrrr");
                    resolve(order)
                }
                
            })

        })

    },
    verifyRazorPayment: (details) => {

        return new Promise((resolve, reject) => {

          const crypto = require('crypto')
          const hmac = crypto.createHmac('sha256', '6p6uiapcPlsrAlNbaAe5XVh6')
          hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]'])
          const calculatedSignature = hmac.digest('hex')
         
      
          if (calculatedSignature === details['payment[razorpay_signature]']) {
            console.log("Signature is valid")
            let name='mghgh'
            resolve(name)
          } else {
            console.log("Signature is invalid")
            reject()
          }
        })
      },





    


}