var db = require('../dbconfig/connection')
var collection = require('../dbconfig/collection')
const bcrypt = require('bcrypt')
const { ObjectId } = require('mongodb')
const { resolve } = require('path')
const Handlebars = require('handlebars');

Handlebars.registerHelper('isEqual', function (value1, value2, options) {
  if (value1 === value2) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});




module.exports = {

    doadminLoged: (adminData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false;
            let response = {}
            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ email: adminData.email })

            if (admin) {
                bcrypt.compare(adminData.password, admin.password).then((status) => {

                    if (status) {
                        response.admin = admin
                        response.status = true
                        resolve(response);
                    } else {
                        console.log('Login failedddddd');
                        reject({ status: false })
                    }
                }).catch(() => {
                    reject(error)
                })
            }
            else {
                console.log('Login failed');
                reject({ status: false })
            }
        })
    },


    blockUser: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(userId) }, {
                $set: {
                    isBlocked: true
                }
            }).then((response) => {

                resolve()
            })
        })

    },


    unblockUser: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(userId) }, {
                $set: {
                    isBlocked: false
                }
            }).then((response) => {
                resolve()
            })
        })

    },
    

    // addCoupen: (coupenDetails, code) => {
    //     return new Promise(async (resolve, reject) => {
    //         let response = {}
    //         let coupenExist = await db.get().collection(collection.COUPON_COLLECTION).findOne({ code: coupenDetails.code })

    //         if (coupenExist) {
    //             response.status = true
    //             response.message = "Coupen with this code is already exists"
    //             resolve(response)
    //         }
    //         else {
    //             db.get().collection(collection.COUPON_COLLECTION).insertOne(
    //                 {
    //                     name: coupenDetails.name,
    //                     code: code,
    //                     startDate: coupenDetails.startdate,
    //                     endingDate: coupenDetails.endingdate,
    //                     value: coupenDetails.discount,
    //                     minAmount: coupenDetails.minAmount,
    //                     maxAmount: coupenDetails.maxAmount,
    //                     status: true
    //                 }
    //             ).then((response) => {
    //                 response.status = false
    //                 response.message = "Coupen added successfully"
    //                 resolve(response)
    //             })
    //         }

    //     })
    // },

    addCoupen: (couponDetails, code) => {
        return new Promise(async (resolve, reject) => {
            let response = {};
            let couponExist = await db.get().collection(collection.COUPON_COLLECTION).findOne({ code: couponDetails.code });
    
            if (couponExist) {
                response.status = true;
                response.message = "Coupon with this code already exists";
                resolve(response);
            } else {
                db.get().collection(collection.COUPON_COLLECTION).insertOne({
                    name: couponDetails.name,
                    code: code,
                    startDate: couponDetails.startdate,
                    endingDate: couponDetails.endingdate,
                    value: couponDetails.discount,
                    minAmount: couponDetails.minAmount,
                    maxAmount: couponDetails.maxAmount,
                    status: true
                }).then((response) => {
                    response.status = false;
                    response.message = "Coupon added successfully";
                    resolve(response);
                });
            }
        });
    },

    viewCoupens: () => {
        return new Promise((resolve, reject) => {
            let coupen = db.get().collection(collection.COUPON_COLLECTION).find().toArray()
            resolve(coupen)
        })
    },

    
    deleteCoupen: (coupenId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.COUPON_COLLECTION).deleteOne({ _id: ObjectId(coupenId) }).then((response) => {
                resolve(response)
            })
        })
    },


    getYearlySalesGraph: () => {
        return new Promise(async (resolve, reject) => {
            try {
                const sales = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                    {
                        $project: {
                            date: { $toDate: "$date" },
                            totalAmount: 1
                        }
                    },
                    {
                        $group: {
                            _id: { $dateToString: { format: "%Y", date: "$date" } },
                            total: { $sum: "$totalAmount" },
                            count: { $sum: 1 }
                        }
                    },
                    {
                        $sort: {
                            _id: 1
                        }
                    },
                    {
                        $limit: 7
                    }
                ]).toArray();
                resolve(sales);
            } catch (error) {
                reject(error);
            }
        });
    },

    getDailySalesGraph: () => {
        return new Promise(async (resolve, reject) => {
            let dailysales = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $project: {
                        date: { $toDate: "$date" },
                        totalAmount: 1
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%d-%m-%Y", date: "$date" } },
                        total: { $sum: "$totalAmount" },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: {
                        _id: 1
                    }
                },
                {
                    $limit: 7
                }
            ]).toArray()

            resolve(dailysales)
        })
    },

    getWeeklySalesGraph: () => {
        return new Promise(async (resolve, reject) => {
            let dailysales = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $project: {
                        date: { $toDate: "$date" },
                        totalAmount: 1
                    }
                },
                {
                    $group: {
                        _id: { $week: "$date" },
                        total: { $sum: "$totalAmount" },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: {
                        _id: 1
                    }
                },
                {
                    $limit: 7
                }
            ]).toArray()
            resolve(dailysales)
        })
    },

    getTotalOrders: () => {
        return new Promise(async (resolve, reject) => {
            let totalCount = await db.get().collection(collection.ORDER_COLLECTION).find().count()
            resolve(totalCount)
        })
    },

    getTotalUsers: () => {
        return new Promise(async (resolve, reject) => {
            let totalUsers = await db.get().collection(collection.USER_COLLECTION).aggregate([

                
                {
                    $match: {
                        "isBlocked": false
                    }
                },
                {
                    $project: {
                        user: {
                            _id: 1
                        }
                    }
                },
                {
                    $count: 'user'
                }
            ]).toArray();
            

            if (totalUsers.length > 0) {
                resolve(totalUsers[0].user);
            } else {
                resolve(0);
            }
        });
    },

    getAllProductCount: () => {
        return new Promise(async (resolve, reject) => {
            let productCount = await db.get().collection(collection.PRODUCT_COLLECTION).find().count()
            resolve(productCount)
        })
    },
    
    getDailySales: () => {
        return new Promise(async (resolve, reject) => {
            let salesData = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $project: {
                        date: { $toDate: "$date" },
                        totalAmount: 1
                    }
                },
                {
                    $group: {
                        _id: { day: { $dayOfYear: { $toDate: "$date" } } },
                        total: { $sum: '$totalAmount' },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { _id: -1 }
                },
                {
                    $limit: 5
                }
            ]).toArray()
            resolve(salesData[0]?.total)
        })
    },

    getWeeklySales: () => {
        return new Promise(async (resolve, reject) => {
            let weeklySales = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $project: {
                        date: { $toDate: "$date" },
                        totalAmount: 1
                    }
                },
                {
                    $group: {
                        _id: { week: { $week: { $toDate: "$date" } } },
                        total: { $sum: "$totalAmount" },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { _id: -1 }
                },
                {
                    $limit: 5
                }
            ]).toArray()
            resolve(weeklySales[0]?.total)
        })
    },


    getYearlySales: () => {
        return new Promise(async (resolve, reject) => {
            let yearlySales = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $project: {
                        date: { $toDate: "$date" },
                        totalAmount: 1
                    }
                },
                {
                    $match: {
                        date: {
                            $gte: new Date(new Date().getFullYear(), 0, 1),
                            $lte: new Date(new Date().getFullYear(), 11, 31)
                        }
                    }
                },
                {
                    $group: {
                        _id: { year: { $year: { $toDate: "$date" } } },
                        total: { $sum: "$totalAmount" },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { _id: -1 }
                },
                {
                    $limit: 1
                }
            ]).toArray()
            resolve(yearlySales[0]?.total)
        })
    },

    getAllData: () => {
        return new Promise(async (resolve, reject) => {
            let data = {}

            data.COD = await db.get().collection(collection.ORDER_COLLECTION).find({ paymentMethod: "COD" }).count()
            // data.PAYPAL = await db.get().collection(collection.ORDER_COLLECTION).find({ paymentMethod: "PAYPAL" }).count()
            data.RAZORPAY = await db.get().collection(collection.ORDER_COLLECTION).find({ paymentMethod: "RAZORPAY" }).count()
            data.WALLET = await db.get().collection(collection.ORDER_COLLECTION).find({ paymentMethod: "WALLET" }).count()
            resolve(data)
        })
    },

    getAllOrderData: () => {
        return new Promise(async (resolve, reject) => {
            let orderData = {}

            orderData.PLACED = await db.get().collection(collection.ORDER_COLLECTION).find({ status: "placed" }).count()
            orderData.DELIVERED = await db.get().collection(collection.ORDER_COLLECTION).find({ status: "Delivered" }).count()
            orderData.CANCEL = await db.get().collection(collection.ORDER_COLLECTION).find({ status: "order cancelled" }).count()
            orderData.PENDING = await db.get().collection(collection.ORDER_COLLECTION).find({ status: "pending" }).count()
            orderData.RETURNED = await db.get().collection(collection.ORDER_COLLECTION).find({ status: "product returned" }).count()
            orderData.ORDERCANCEL = await db.get().collection(collection.ORDER_COLLECTION).find({ status: "order cancelled" }).count()

            resolve(orderData)
        })
    },



    

}