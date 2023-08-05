const { response } = require('express');

const {doadminLoged,blockUser,unblockUser,viewCoupens,addCoupen,deleteCoupen,getYearlySalesGraph,getDailySalesGraph,getWeeklySalesGraph,
    getTotalOrders,getTotalUsers,getAllProductCount,getDailySales,getWeeklySales,getYearlySales,getAllData,getAllOrderData} = require('../helpers/admin-helpers')
const{getAllproduct,addProduct,deleteProduct,getProductDetails,updateProduct,addProductOffer,}= require('../helpers/product-helpers')

const { getAllUser,changeProductStatus} = require('../helpers/user-helpers');

const{getAllcategory,AddCategorys}=require('../helpers/category-helpers');

const productHelpers = require('../helpers/product-helpers');
const { log } = require('console');




module.exports={
    
 
    adminLoginpage(req,res){
       
        res.render('admin/adminLogin',{ layout: 'admin-layout' });

    },

    adminHome:(async(req,res)=>{
        const yearly = await getYearlySalesGraph()
        const daily = await getDailySalesGraph()
        const weekly = await getWeeklySalesGraph()
        const totalOrders = await getTotalOrders()
        const totalUsers = await getTotalUsers()
        const productCount = await getAllProductCount()
        const dailySales = await getDailySales()
        const weeklySales = await getWeeklySales()
        const yearlySales = await getYearlySales()
        const data = await getAllData()
        const orderData = await getAllOrderData()
        res.render('admin/adminHome',{ layout: 'admin-layout', admin: true,yearly,daily,weekly,totalOrders,totalUsers,productCount,dailySales,weeklySales,yearlySales,data,orderData})
    }),


    dashboard(req,res){

        res.redirect('/admin/adminHome')
    },
    sales:(async(req,res)=>{
        const yearly = await getYearlySalesGraph()
        const daily = await getDailySalesGraph()
        const weekly = await getWeeklySalesGraph()
        const totalOrders = await getTotalOrders()
        const totalUsers = await getTotalUsers()
        const productCount = await getAllProductCount()
        const dailySales = await getDailySales()
        const weeklySales = await getWeeklySales()
        const yearlySales = await getYearlySales()
        const data = await getAllData()
        const orderData = await getAllOrderData()
        res.render('admin/sales',{ layout: 'admin-layout', admin: true,yearly,daily,weekly,totalOrders,totalUsers,productCount,dailySales,weeklySales,yearlySales,data,orderData})
    }),


  dashbord(req,res){
        res.redirect('admin/sales',{ layout: 'admin-layout', admin: true,yearly,daily,weekly,totalOrders,totalUsers,productCount,dailySales,weeklySales,yearlySales,data,orderData})
      
    },

    loginAdmin(req,res,next){
        
        doadminLoged(req.body).then((response) => {
            req.session.adminloggedIn = true;
            req.session.admin= response;
            res.redirect('/admin/adminHome')
    // res.render('admin/admin-land', { layout: 'admin-layout', admin: true });
      }).catch((error) => {
        console.log(error);
       
    res.render('admin/adminLogin', {  layout: 'admin-layout',error: 'Invalid login details' })
     }) 
      },

    signOut(req,res){
        req.session.admin=null;
        req.session.adminloggedIn=false;

        res.redirect('/admin')
    },


    adminAlluser(req, res) {
        getAllUser().then((AllUsers) => {
             
             res.render('admin/userTable', { layout: 'admin-layout', AllUsers, admin: true })
         })
     },
    //  adminBlockUser(req,res){

    //     let userId=req.params.id
    //     blockUser(userId).then(()=>{
    //         res.redirect('/admin/alluser')
    //     })

    // },
    adminBlockUser: (req, res) => {
        const blockUserId = req.query.id
        blockUser(blockUserId)
        res.redirect('/admin/alluser')
        
       
    },
    // adminUnBlockUser(res,req){
    //     console.log("hhhhhhhhhhhhhhhhhhhhhh");

    //     let userId=req.params.id
    //     unblockUser(userId).then(()=>{
    //         console.log("aaaaaaaaaaaaaaaaaaaaaaaaa");
    //         res.redirect('/admin/alluser')
    //     })

    // },
    adminUnBlockUser: (req, res) => {
        const unblockUserId = req.query.id
        unblockUser(unblockUserId)
        res.redirect('/admin/alluser')
    },

     productTable(req,res){
        getAllproduct().then((product)=>{

            console.log(product,"66666666666666666666666");
           

            res.render('admin/productTable',{layout:'admin-layout',admin: true,product})

        })

        },
        addproduct(req,res){

            productHelpers.getAllcategory().then((category)=>{
                res.render('admin/addProduct',{layout:'admin-layout',admin: true , category })
            })

        },

       

        addProductSubmit: async (req, res) => {
            console.log(req.body)
    
            const image = []
            req.files.forEach(function (value, index) {
                image.push(value.filename)
            })
            req.body.image = image
            
            await addProduct(req.body)
            res.redirect('/admin/productTable')
    
        },
          
        removeProduct(req,res){
            const prodId=req.params.id
            deleteProduct(prodId).then((response)=>{
                res.redirect('/admin/productTable')
            })
            
        },
        async editProduct(req,res){
            const product=await getProductDetails(req.body.id)

            productHelpers.getAllcategory().then((getcategory)=>{
                res.render('admin/editProduct', { layout: 'admin-layout',admin: true,product,getcategory})

            })
           
        },

        editProductSubmit(req,res){

            console.log(req.files,">>>>>>>>okbro<<<<<<<<")
            const image=[]
            req.files.forEach(function (value, index) {
                image.push(value.filename)
            })
            req.body.image = image
            console.log(req.body.image, ">>>>>>>>>><<<<<<<<<<<<<<<<<");
            console.log(req.body,'bodyyyyyyyynewwww');
               updateProduct(req.params.id,req.body).then((response)=>{
   
                   console.log(response,"%%%%%%%%%%%");
                   res.redirect('/admin/productTable')
               })
           },


       


        // editProductSubmit(req,res){

        //  console.log(req.files,">>>>>>>>okbro<<<<<<<<")

        //  req.body.img1 = req.files.productImage1[0].filename
        //     req.body.img2 = req.files.productImage2[0].filename
        //     req.body.img3 = req.files.productImage3[0].filename
            
        //     updateProduct(req.params.id,req.body).then((response)=>{

        //         console.log(response,"%%%%%%%%%%%");
        //         res.redirect('/admin/productTable')
        //     })
        // },
        // categoryManagement(req , res){
        //     console.log('lllllllllllllllllll');
            
        //     getAllCategory().then((category)=>{
        //         console.log("bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb");
        //         res.render('admin/categoryManagement' , {layout : 'admin-layoutnew' , category})
        //     })
        // }
        categorypage(req,res,next){
     
            getAllcategory().then((getcategory)=>{
                
                
              res.render('admin/adminCategory',{layout: 'admin-layout', admin:true,getcategory})
            })
            
           },

           addcategory(req,res){

            res.render('admin/addCategory',{layout: 'admin-layout', admin:true,errMessage: req.flash('userExists')})

           },

        

        addCategorySubmit(req,res){

            AddCategorys(req.body).then((addcategory)=>{
                
                console.log(req.body);

                res.redirect('/admin/allcategory')
            }).catch((response)=>{

                if (response.categoryExists) {
                    req.flash('userExists', 'This category is already exitsted !')
                    res.redirect('/admin/add-category')
                  }
            })
       },
       getOrders(req, res) {
        productHelpers.getAllOrders().then((order) => {
            res.render('admin/OrderTable', { layout: 'admin-layout', admin:true, order })
        })

    },
    viewOrderProduct(req, res) {
        const oneProductId = req.query.id
        console.log(oneProductId,"oooooooooo");
        productHelpers.getOrderProduct(oneProductId).then((oneOrderProduct) => {
            productHelpers.getAllOrders().then((order) => {
                console.log('orderrrrrrrr',order);
                res.render('admin/viewOrderProduct', { layout: 'admin-layout', admin:true, oneOrderProduct ,order})

            })
            
        })
    },
    // viewOrderProduct(req, res) {
    //     const oneProductId = req.query.id
    //     console.log(oneProductId,"oooooooooo");
    //     productHelpers.getOrderProduct(oneProductId).then((oneOrderProduct) => {
    //         res.render('admin/viewOrderProduct', { layout: 'admin-layout', admin:true, oneOrderProduct })
    //     })
    // },

    productStatus(req, res) {
        const data = req.body

        changeProductStatus(data).then((response) => {

            res.json(response)
        })
    }, 



    

    addCoupenPost(req, res) {
        const couponCode = Math.random().toString(36).substring(2, 10);
        const { startdate, endingdate } = req.body;
      
        if (startdate < endingdate) {
          addCoupen(req.body, couponCode)
            .then((response) => {
              if (response.message) {
                console.log('pppppppppp');
                req.session.error = response.message;
              }
              res.redirect('/admin/offer');
            })
            .catch((error) => {
                console.log(erooreeeeeeee);
              console.error(error);
              // Handle error
              res.redirect('/admin/offer');
            });
        } else {
            console.log('llllllllllllll');
          req.session.Eror = "Starting date must be greater than ending date";
          res.redirect('/admin/offer');
        }
      },
      
   
    
    
    


    viewOffer (req , res) {
        viewCoupens().then((coupen) => {
            res.render('admin/view-offer' , {layout: 'admin-layout', admin:true,coupen , oferEror:req.session.Eror})
            req.session.Eror = null
        })
    },

    removeCoupen (req , res){
        const coupenId = req.params.id
        deleteCoupen(coupenId).then((response) => {
            res.redirect('/admin/offer')
        })
    },


    inventoryManagement : (req , res) => {
        productHelpers.getAllproduct().then((product) => {

            res.render('admin/inventoryManagement' , { layout: 'admin-layout', admin:true , product})
        })
    },

    editStockPost : (async(req , res) => {
        const prodId = req.params.id
        const product = await productHelpers.getProductDetails(prodId)
        const stock = parseInt(req.body.stock)
        req.body.stock = stock
        productHelpers.editStock(prodId , req.body).then(() => {
            res.redirect('/admin/inventory')
        })       
    }),


    productCoupen (req , res) {
        productHelpers.getAllproduct().then((product) => {       
            res.render('admin/productOffer' , { layout: 'admin-layout', admin:true, product})
        })
    },
 









    productOfferPost (req , res) {
        const prodId = req.params.id
        console.log(prodId,'prodIdddddddddddddddd');
        const productCode = Math.random().toString(36).substring(2, 10);
        
         productHelpers.addProductOffer(req.body , prodId , productCode).then(async(response) => {
             const singleProduct = await productHelpers.getProductDetails(prodId)
             productHelpers.addOfferPrice(req.body , singleProduct).then((response) => {
             })
             res.redirect('/admin/productOffer')
         })
     },
       
           
    
     
     
      
}