var express = require('express');
var router = express.Router();
const {adminLoginpage,adminHome,loginAdmin,signOut,adminAlluser,productTable,addproduct,
  addProductSubmit,removeProduct,editProduct,dashboard,editProductSubmit,adminBlockUser,adminUnBlockUser,categorypage,
  addcategory,addCategorySubmit,getOrders,viewOrderProduct,viewOffer,addCoupenPost,removeCoupen,productStatus,
  inventoryManagement,editStockPost,productCoupen,productOfferPost,sales}=require('../controler/admincontroller')

const{sessionCheck,loginRedirect,nocache}=require('../middlwares/admin-middlwares')

const multer = require('multer');
const storage = multer.diskStorage({
  
    destination: function (req, file, cb) {
      cb(null, './public/product-pictures')
    },
    filename: function (req, files, cb) {
      cb(null, Date.now() + '-' + files.originalname)
    }
  })
const upload = multer({ storage: storage });


router.get('/', nocache , loginRedirect,adminLoginpage)

router.get('/adminhome',adminHome),

router.post('/adminlogin',loginAdmin),

router.get('/dashboard',dashboard),

router.get('/signout',signOut)

router.get('/alluser',adminAlluser);

router.get('/productTable',productTable)
router.get('/sales',sales)

router.get('/add-product',addproduct)
router.post('/edit-product',editProduct)



// router.post('/addProductSubmit', upload.fields( [ { name : 'productImage1' , maxCount : 1 } ,{ name : 'productImage2' , maxCount : 1 } , { name : 'productImage3' , maxCount : 1 } ] ) ,
//  addProductSubmit);
router.post('/addProductSubmit', upload.array('image'), addProductSubmit);
 router.get('/delete-product/:id',removeProduct)

//  router.post('/edit-product/:id',  upload.fields( [
//   { name : 'productImage1' , maxCount : 1 } ,
// { name : 'productImage2' , maxCount : 1 } , 
// { name : 'productImage3' , maxCount : 1 } ] ) ,
// editProductSubmit)
router.post('/edit-product/:id', upload.array('image'), editProductSubmit);


 router.get('/blockUser', adminBlockUser)
 router.get('/unBlockUser',  adminUnBlockUser)

//  router.get('/category',categoryManagement)

router.get('/allcategory',categorypage);
router.get('/add-category',addcategory);
router.post('/addCategorySubmit',addCategorySubmit)



router.get('/orderTable',getOrders)
router.get('/view-product',viewOrderProduct)
router.post('/product-status' , productStatus)




router.get('/offer' , viewOffer)
router.post('/addcoupon' , addCoupenPost)
router.get('/delete-coupen/:id' , removeCoupen)

router.get('/productOffer',productCoupen)
router.post('/addProductOffer/:id' , productOfferPost)


router.get('/inventory' , inventoryManagement)
router.post('/edit-stock/:id' , editStockPost)

module.exports = router;
