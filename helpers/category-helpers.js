var db = require('../dbconfig/connection')
var collection = require('../dbconfig/collection')
const bcrypt = require('bcrypt')
const { ObjectId } = require('mongodb')
const { resolve } = require('path')


module.exports={

    

    // AddCategorys: (addcategory) => {
    //     console.log(addcategory);
    //     addcategory.date = new Date()
    //     return new Promise(async (resolve, reject) => {

    //         let adminWithcategory = await db.get().collection(collection.CATEGORY_COLLECTION).find({ name: addcategory.name }).toArray()

    //         let rejectResponse = {}

    //         if (adminWithcategory.length > 0) {
    //             rejectResponse.categoryExists = true
    //             reject(rejectResponse)
    //         }else{
    //             db.get().collection(collection.CATEGORY_COLLECTION).insertOne(addcategory).then((addcategory) => {

    //                 resolve(addcategory)
    //             })

    //         }
    //     })
    // },

    AddCategorys: (addcategory) => {
      return new Promise(async (resolve, reject) => {
        if (!addcategory || !addcategory.name) {
          // If addcategory is null or doesn't have a valid name property, reject the Promise with an error
          const errorMessage = 'addcategory is null or does not have a valid name property';
          console.error(errorMessage);
          return reject(new Error(errorMessage));
        }
    
        console.log(addcategory);
        addcategory.date = new Date();
        let categoryName = addcategory.name.toLowerCase(); // Convert category name to lowercase
        let existingCategory = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ name: { $regex: new RegExp('^' + categoryName + '$', 'i') } });
    
        if (existingCategory) {
          // Category with the same name already exists
          let rejectResponse = { categoryExists: true };
          reject(rejectResponse);
        } else {
          addcategory.name = categoryName; // Assign the lowercase category name
          db.get().collection(collection.CATEGORY_COLLECTION).insertOne(addcategory).then((category) => {
            resolve(category);
          });
        }
      });
    },
    
      

    getAllcategory:()=>{

        return new Promise(async(resolve,reject)=>{

            let getcategory=await db.get().collection(collection.CATEGORY_COLLECTION).find().sort({date:-1}).toArray()
            resolve(getcategory)
        })
    },

    
   
}