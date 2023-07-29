let db = require('../dbconfig/connection')
let collection = require('../dbconfig/collection')
const { ObjectId } = require('mongodb');
let objectId= require('mongodb'). ObjectId
const { resolve } = require('path');




module.exports={

    addProduct: (product) => {
        
        product.price = parseInt(product.price);
        return new Promise((resolve, reject) => {

            db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((res) => {
                resolve({ id: res.insertedId })
            })
        })

    },
   

    getAllproduct: () => {
        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(product)
        })
    },

    deleteProduct: (prodId) => {
        console.log(prodId , "mmmmmmmmmm");
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: ObjectId(prodId) }).then((response) => {
                resolve(response)
            })
        })
    },
    getProductDetails:(prodId)=>{

       
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:ObjectId(prodId)}).then((product)=>{
                resolve(product)
            })
        })
    },
    getProductByCategory: (categoryName) => {
        return new Promise((resolve, reject) => {
            let products = db.get().collection(collection.PRODUCT_COLLECTION).find({ category: categoryName }).toArray()
            resolve(products)
        })
    },
    updateProduct:(prodId, proDetails)=>{
        console.log(proDetails,"&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
        proDetails.price = parseInt(proDetails.price);
       
        return new Promise((resolve,reject)=>{
            
            db.get().collection(collection.PRODUCT_COLLECTION). 
            updateOne({_id:ObjectId(prodId)},{
                $set: {
                    name:proDetails.name,
                    size:proDetails.size,
                   categoryid:proDetails.categoryid,
                    price:proDetails.price,
                    color:proDetails.color,
                    description: proDetails.description,
                    image:proDetails.image
                   
                   
                }
            }).then((response)=>{
                resolve(response)
            })
        })
    },
    viewProduct:(prodId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:ObjectId(prodId)}).then((product)=>{
                resolve(product)
            })
        })
    },
    getAllcategory:()=>{
        return new Promise(async(resolve,reject)=>{
            let category=await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            resolve(category)
        })
    },


    

    filterByCategory:(proCategory)=>{
       
        return new Promise(async(resolve,reject)=>{

            let ShowProducts=await db.get().collection(collection.PRODUCT_COLLECTION).find({categoryid:proCategory.name}).toArray()
            
            resolve(ShowProducts)
        }).catch((error)=>{

            reject()
        })
    },
    getProductQuantity: (details) => {
        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(details.product) })
            let availableQty = product.quantity
            resolve(availableQty)
        })
    },
    getProductCount: () => {
        return new Promise(async (resolve, reject) => {
            let count = await db.get().collection(collection.PRODUCT_COLLECTION).countDocuments()
            resolve(count)
        })
    },
    getPaginatedProducts: (skip, limit) => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().skip(skip).limit(limit).toArray()
            resolve(products)
        })
    },
    getAllOrders: () => {
        return new Promise(async (resolve, reject) => {
          try {
            let order = await db.get().collection(collection.ORDER_COLLECTION).find().sort({ _id: -1 }).toArray();
            resolve(order);
          } catch (error) {
            reject(error);
          }
        });
      },

      getOrderProduct: (oneProId) => {
        return new Promise(async (resolve, reject) => {
            let orderProduct = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: objectId(oneProId) }
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
           
            resolve(orderProduct)
        })
    },

    editStock : ((prodId , details) => {
        
        return new Promise((resolve , reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id : ObjectId(prodId)} , {$set : {stock : details.stock}}).then((response) => {
                resolve()
            })           
        })
    }),

    updateStock : (prodId , quantity) => {
        console.log(prodId,'>>>>>>>>>>><<<<<<<<<<');
        console.log(quantity,'quantityyyyyyyyyyy');
        return new Promise((resolve , reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id : objectId(prodId)} , {$inc : {stock : -quantity}})
            resolve()
        })
    },

    cancelStockUpdate : (prodId , quantity) => {
        return new Promise((resolve , reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id : ObjectId(prodId)} , {$inc : {stock : quantity}})
            resolve()
        })
    },


    
    addProductOffer: (details, prodId, code) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            let prodIdExist = await db.get().collection(collection.PRODUCT_OFFER).findOne({ prodId: prodId })
            if (prodIdExist) {
                db.get().collection(collection.PRODUCT_OFFER).updateOne({prodId : prodId},{
                    $set: {
                        discount: details.discount,
                        startDate: details.startdate,
                        endDate: details.endingdate,
                    }
                }).then((response) => {
                    resolve(response)
                })
            }
            else {
                db.get().collection(collection.PRODUCT_OFFER).insertOne(
                    {
                        prodId: prodId,
                        code: code,
                        discount: details.discount,
                        startDate: details.startdate,
                        endDate: details.endingdate,
                        status: true
                    }
                ).then((response) => {
                    resolve(response)
                })
            }

        })
    },

    addOfferPrice : async (data , product) => {
        let price = product.price
        let discount = data.discount
        let prodId = product._id
        const response = await new Promise((resolve, reject) => {
            let offerPriceInt = Math.floor(price - (price * discount) / 100);
            let offerPrice = offerPriceInt.toString();
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(prodId) }, { $set: { offerPrice: offerPrice, discount: discount } });
        });
        resolve(response);
    },
    
   

}