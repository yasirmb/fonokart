const { log } = require("console")
const { response } = require('express');
const { doSignup, dologin, getUserDetails, doOtp, otpConfirm, viewTotalProduct, AddtoCart, getCartproduct, getCartCount, changeProductQuantity, deleteFromCart,
    getTotalAmount, placeorder, getCartProductList,generateRazorpay, verifyRazorPayment,addToWishlist, getWishlistId,getAllOffers, getWishlistProduct,viewAddress, deleteFromWishlist,
    getUserorders, getAllorder, getOrderProducts,changePaymentStatus,applyCoupen,
   orderCancel,getProductDetails,returnOrder,getOtp,changepassword,editAddress,addAddress,getAddress,getOneAddressById,userImage,deleteOneAddressById} = require("../helpers/user-helpers")
var productHelpers = require("../helpers/product-helpers");
var orderHelpers=require('../helpers/order-helpers')
const walletHelpers = require("../helpers/wallet-helpers")


const session = require("express-session");
var Handlebars = require('handlebars');

  Handlebars.registerHelper('for', function (from, to, incr, block) {
    var accum = '';
    for (var i = from; i <= to; i += incr)
        accum += block.fn(i);
    return accum;
});


module.exports = {

    //------------login page----------------

    loginPage(req, res) {
        if (req.session.loggedIn) {

           
            res.redirect('/')
        } else {

            console.log("calledddddddddddddddddddddd");
            res.render('user/login', { 'loginErr': req.session.loginErr })
            req.session.loginErr = false
        }

    },
    loginSubmit(req, res) {

        dologin(req.body).then((response) => {

            req.session.loggedIn = true;
            req.session.users = response.user;
            res.redirect('/')
        }).catch((error) => {
            console.log(error);
            req.session.loginErr = true;
            res.render('user/login', { error: error.error })
        })
    },

    //-------login page End-----


    // homePage: async (req, res) => {
    //     let user = req.session.users
    //     let categories;
    //     let cartCount=await getCartCount(user._id)
    //     await productHelpers.getAllcategory().then((categoryList) => {

    //         categories = categoryList;
    //     })
    //     productHelpers.getAllproduct().then((product) => {

    //         console.log(product, "=======================");



    //         let totalProducts = product.length
    //         let limit = 4
    //         let products = product.slice(0, limit)
    //         let pages = []

    //         for (let i = 1; i <= Math.ceil(totalProducts / limit); i++) {
    //             pages.push(i)
    //         }
    //         if (req.session.users) {
    //             getWishlistId(req.session.users._id).then((data) => {

    //               for (let i = 0; i < products.length; i++) {
    //                 for (let j = 0; j < data.length; j++) {

    //                   if (products[i]._id.toString() == data[j].toString()) {
    //                     products[i].isWishlisted = true;
    //                     console.log(products[i], 'hai');
    //                   }

    //                 }

    //               }



    //         console.log(pages, "pppppppppprrrrrrrrroooooooooodddddddduuuuuuuuuuuucccccccccctttttt");
    //         res.render('user/homepage', { user: true, logged: true, userData: user, product, products, categories, pages,cartCount})

    //     })
    // }

    //     })
    // },

    //--------------home Page------
    homePage: async (req, res) => {
        const user = req.session.users
        let categories;
        const cartCount = await getCartCount(user._id)

        await productHelpers.getAllcategory().then((categoryList) => {

            categories = categoryList;
        })



        const perPage = 8;
        let pageNum;
        let skip;
        let productCount;
        let pages;
        pageNum = parseInt(req.query.page) >= 1 ? parseInt(req.query.page) : 1;
        console.log(typeof (pageNum))
        skip = (pageNum - 1) * perPage
        await productHelpers.getProductCount().then((count) => {
            productCount = count;
        })
        pages = Math.ceil(productCount / perPage)

        Handlebars.registerHelper('ifCond', function (v1, v2, options) {
            if (v1 === v2) {
                return options.fn(this);
            }
            return options.inverse(this);
        });

        Handlebars.registerHelper('for', function (from, to, incr, block) {
            var accum = '';
            for (var i = from; i <= to; i += incr)
                accum += block.fn(i);
            return accum;
        });

        if (req.session.users) {
            await productHelpers.getPaginatedProducts(skip, perPage).then((products) => {
                console.log(products, "thissoneeeeeee");
                getWishlistId(req.session.users._id).then((data) => {

                    for (let i = 0; i < products.length; i++) {
                        for (let j = 0; j < data.length; j++) {

                            if (products[i]._id.toString() == data[j].toString()) {
                                products[i].isWishlisted = true;
                                console.log(products[i], 'hai');
                            }

                        }

                    }


                    // let stock=products.stock
                    // console.log(stock,'stockkkkkkkkkkkkk');
                    // console.log(products, "pppppppppprrrrrrrrroooooooooodddddddduuuuuuuuuuuucccccccccctttttt");
                    res.render('user/homepage', { user: true, logged: true, userData: user, products, categories, totalDoc: productCount, currentPage: pageNum, pages: pages, cartCount })

                })
            })
        }

    },

    //------------home Page end---------

    //------------singup page---------

    signupPage(req, res) {
        res.render('user/registration', { errMessage: req.flash('userExists') })
    },





   async signupSubmit(req, res) {

        if (req.body.password === req.body.repassword) {
            delete req.body.repassword
            let data = req.body
            // await walletHelpers.CREATE_WALLET(data)
            doSignup(req.body).then((userData) => {
                console.log(userData);
                req.session.loggedIn = true;
                req.session.users = userData;

                res.render('user/login', { user: true })
            }).catch((response) => {
                if (response.mobileExists) {
                    req.flash('userExists', 'This Mobile number is already registered with us!')
                    res.redirect('/signup')
                }
                if (response.emailExists) {
                    req.flash('userExists', 'This Email is  already registered with us! !')
                    res.redirect('/signup')
                }

            })


        }

    },

    //------------singup Page end---------


    userlogout(req, res) {

        req.session.destroy()
        res.redirect('/')
    },

    //------------single Product view---------

     clickProduct(req, res) {
        let user = req.session.users
        console.log(req.body.id);
        productHelpers.viewProduct(req.body.id).then((product) => {
            console.log(product);
            res.render('user/singleProduct', { product, user: true, userData: user })
        })
    },


    productDetail(req, res) {
        let user = req.session.users
        productHelpers.viewProduct(req.query.id).then((product) => {


            res.render('user/singleProduct', { product, user: true, userData: user })
        })
    },

    //------------single Product Page end---------


    //------------category Page ---------

    shopbyCategory(req, res) {

        let categories;
        productHelpers.getAllcategory().then((categoryList) => {
            categories = categoryList;
        })
        productHelpers.getProductByCategory(req.params.name).then((products) => {

            categoryName = products[0].category

            res.render('user/view-product-by-category', { products, categoryName, categories })
        })
    },


    categoryfilter(req, res) {

        let usere = req.session.users
        let users = req.session.users
        let name = req.body;


        productHelpers.filterByCategory(name).then((products) => {

            productHelpers.getAllcategory().then((getcategory) => {



                res.render('user/view-products', { user: true, products, userData: users, usere, users, getcategory })


            }).catch(() => {

                res.render('user/view-products', { user: true, products, users, usere, getcategory })
            })

        })
    },
//   viewAddress(req, res) {
//     console.log("ffffffffffffffffffff");
//     let user = req.session.users
    
 
//         // Render the add address page
//         res.render('user/viewaddress', { title: 'View Address' });
//       },
    async viewAddress(req, res) {

    
let user = req.session.users
    console.log("ffffffffffffffffffff");
    // Check if the user is authenticated
    if (req.session && req.session.users) {
        let address = await getAddress(req.session.users._id);
        // User is authenticated, render the add address page
        res.render('user/viewaddress', {user: true,userData: user,address });
    } else {
        // User is not authenticated, redirect to the login page or perform other actions
        res.redirect('/login'); // Example: Redirect to the login page
    }
},
 async editAddress(req, res) {
    let userAddressId=req.params.id
//address fetch cheythu konduverannam
let getOneAddress = await getOneAddressById(req.session.users._id, userAddressId)
console.log(getOneAddress);
    let user = req.session.users
        console.log("ffffffffffffffffffff");
        // Check if the user is authenticated
        if (req.session && req.session.users) {
        
            // User is authenticated, render the add address page
            res.render('user/editaddress', {user: true,userData: user,getOneAddress});
        } else {
            // User is not authenticated, redirect to the login page or perform other actions
            res.redirect('/login'); // Example: Redirect to the login page
        }
    },
    async deleteAddress(req, res) {
        let userAddressId=req.params.id
    //address fetch cheythu konduverannam
    let getOneAddress = await deleteOneAddressById(req.session.users._id, userAddressId)
    console.log(getOneAddress);
        let user = req.session.users
            console.log("ffffffffffffffffffff");
            // Check if the user is authenticated
            if (req.session && req.session.users) {
            
                // User is authenticated, render the add address page
                res.redirect('/viewaddress');;
            } else {
                // User is not authenticated, redirect to the login page or perform other actions
                res.redirect('/login'); // Example: Redirect to the login page
            }
        },


    pricefilter(req, res) {

        console.log(req.body, "priceeeeeeeeeeeeeeeeeeeeeeeee");
        let user = req.session.users

        getPricefilter(req.body.minprice, req.body.maxprice).then((products) => {

            console.log(products, "produccccccccccccccccccc");

            res.render('user/view-products', { user: true, products, user })

        }).catch(() => {
            console.log("1111111111111111111111");
            let err = 'not found'

            res.render('user/view-products', { user: true, user, err })
        })


    },
    //------------category Page end-----------------

    //------------user profile---------

   

    userprofile: async (req, res) => {


        let usere = await getUserDetails(req.session.users._id)
        console.log(usere,'usereeeeeeeeeeeeeeeeeeeeeeeee');

        res.render('user/userprofile', { user: true, usere, userData: usere,passChangeSuccess: req.flash('updateStatusSuccess'),
        passChangeFail: req.flash('updateStatusFail') })
    },

    orderInfo: async (req, res) => {

        await getAllorder(req.session.users._id).then(async (orders) => {
            let user = req.session.users
            res.render('user/order', { orders, user, userData: user })
        })

    },

    // usereditprofile: (req, res) => {
    //     console.log(req.body.,'halooooo');
        
    //     req.body.img1 = req.files.productImage1[0].filename
    //     console.log(req.body.img1,'image');
    //     editAddress(req.body).then((response) => {
    //         //when we using ajax we only doing passing data in the json format
    //         console.log(response, "response of update")
    //         res.json(response)
    //     })

    // },

    
    // usereditprofile: (req, res) => {
    //     console.log(req.body,'halooooo');
    //     let user=req.body._id
       
    //     editAddress(req.body).then((response) => {
    //         //when we using ajax we only doing passing data in the json format
    //         console.log(response, "response of update")
    //         res.json(response)
    //     })

    // },

    userOrderAddress: async (req, res) => {

        let usere = await getUserDetails(req.session.users._id)
        console.log(usere);
        res.render('user/orderaddress', { user: true, usere })

    },


    //-----------user profile end---------


    //------------otp login---------

    loginOtp(req, res) {

        res.render('user/otp-login')
    },


    sendOtp: ((req, res) => {


        console.log("reesend,,,,,>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", req.body);
        doOtp(req.body).then((response) => {
            let number = req.body.mobile
            console.log(req.body.mobile, "joggggggggggggggggggg");
            if (response.status) {
                signupData = response.user
                res.render('user/otp-verify', { number })

            }
            else {
                res.render('user/otp-login', { error: 'invalid mobile number' })

            }
        })
    }),


    otpSubmit: ((req, res) => {
        otpConfirm(req.body, signupData).then((response) => {
            console.log(response);
            if (response.status) {
                req.session.loggedIn = true
                req.session.users = signupData;
                res.redirect('/')
            }
            else {
                res.render('user/otp-verify', { error: 'incorrect otp' })
            }
        })
    }),


    //-----------otp login end---------


    productPagination: ((req, res) => {
        let user = req.session.users

        let pageCount = req.query.id || 1
        console.log(pageCount);
        let pageNum = parseInt(pageCount)
        let limit = 4

        viewTotalProduct(pageNum, limit).then((product) => {
            let pages = []
            productHelpers.getAllproduct().then((product) => {

                let totalProducts = product.length
                let limit = 4

                for (let i = 1; i <= Math.ceil(totalProducts / limit); i++) {
                    pages.push(i)
                }

            })
            res.redirect('/')
        })
    }),

    cart: (async (req, res) => {
        let user = req.session.users
        let products = await getCartproduct(req.session.users._id)
  
        let totalprice = await getTotalAmount(req.session.users._id)
        console.log(products, "ivnnnnnnnnn=============");
        res.render('user/user-cart', { products, user, userData: user, totalprice })

    }),

    addtocart: ((req, res) => {

        AddtoCart(req.params.id, req.session.users._id).then(() => {

            res.redirect('/')
        })

    }),

    changeQuantity(req, res, next) {

        changeProductQuantity(req.body).then(async (response) => {
            response.total = await getTotalAmount(req.session.users._id)
            res.json(response)
        })

    },

    async deleteFromCart(req, res, next) {

        deleteFromCart(req.body).then((response) => {
            console.log(response);
            res.json(response)
        })
    },



    // proceedtocheckout: (async (req, res) => {
    //     let user = req.session.users
    //     let products = await getCartproduct(req.session.users._id)
    //     let total = await getTotalAmount(req.session.users._id)
    //     let coupen =await getAllOffers(req.session.users._id)
    //     res.render('user/checkout', { total, products, user, userData: user ,coupen})

    // }),

    async proceedtocheckout(req, res) {
        let user = req.session.users
        try {
            let products = await getCartproduct(req.session.users._id)
            let coupen =await getAllOffers(req.session.users._id)
            let address = await getAddress(req.session.users._id);
            // let address = await userHelpers.getAddress(req.session.user._id);


            let flag = false;
            for (let i = 0; i < products.length; i++) {
                if (products[i].product && products[i].quantity > products[i].product.stock) {
                    flag = true;
                    break;
                }
            }
           
            if (flag) {
                req.session.stockFull = true;
                res.redirect('/cart');
            } else {
                
                let total = await getTotalAmount(req.session.users._id);
            //  let total=req.session.amount
            console.log(user, total, products,user,address)
                res.render('user/checkout', { user, total, coupen,products,userData: user,address });
            }
        } catch (error) {
            res.render('user/checkout', { user });
        }
    },

    placeOrder: (async (req, res) => {

        let products = await getCartProductList(req.session.users._id)
        // let totalprice = await getTotalAmount(req.session.users._id)
        let totalprice =req.body.totalprice;
        console.log(req.body,'bodyyyyyyyyyyy reqqqqqq');
       
        // let totalprice=req.session.amount

        console.log(products,'productsssssssssssss');

        placeorder(req.body, products, totalprice).then(async (orderId) => {
            // for (let i = 0; i < products.length; i++) {
            //     await productHelpers.updateStock(products[i].item, products[i].quantity)
            // }

            if (req.body['payment-method'] == 'COD') {
                res.json({ Success: true })
            }
            
            else if (req.body['payment-method'] == "RAZORPAY") {

                generateRazorpay(orderId, totalprice).then((response) => {

                    res.json(response)
                })
            } 
            
            else if (req.body['payment-method'] == "WALLET") {
                walletHelpers.WALLET_BALANCE(req.session.users.email).then((result) => {
                    console.log(result,'resulttttttttttttttttttttttttttttttttt');
                    if (result.balance < totalprice) {
                        res.json({ walletSuccess: false })
                    } else {
                        orderHelpers.updatePaymentMethod(orderId, req.body['payment-method'])
                        orderHelpers.CHANGE_STATUS(orderId, (state = "placed"))
                    console.log(req.session.users.email,'req.session.users.emailllllllll');
                        walletHelpers.UPDATE_WALLET(req.session.users.email, -totalprice)
                        res.json({ walletSuccess: true })
                    }
                })

            }


        })

    }),

    verifyPayment: ((req, res) => {
        console.log(req.body, 'bodyyyyyyyyyy');
        verifyRazorPayment(req.body).then((status) => {
            console.log(status, "status");
            changePaymentStatus(req.body['order[receipt]']).then(() => {
                console.log("payment successfull");
                res.json({ status: true })
            })
        }).catch((err) => {
            console.log(err, "this is error");
            res.json({ status: 'payment failed' })
        })
    }),

    // orders:(async(req,res)=>{

    //         const perPage = 5;
    //         let pageNum;
    //         let skip;
    //         let productCount;
    //         let pages;
    //         pageNum = parseInt(req.query.page) >= 1 ? parseInt(req.query.page) : 1;
    //         skip = (pageNum - 1) * perPage
    //         await userOrderCount(req.session.user._id).then((count) => {
    //           productCount = count;
    //           console.log(count,'count')
    //         })
    //         pages = Math.ceil(productCount / perPage)
    //         let index = parseInt(skip) >= 1 ? skip + 1 : 1
    //         Handlebars.registerHelper("inc", function (value, options) {
    //           return parseInt(value) + index;
    //         });
    //         Handlebars.registerHelper('ifCond', function (v1, v2, options) {
    //           if (v1 === v2) {
    //             return options.fn(this);
    //           }
    //           return options.inverse(this);
    //         });
    //         Handlebars.registerHelper('for', function (from, to, incr, block) {
    //           var accum = '';
    //           for (var i = from; i <= to; i += incr)
    //             accum += block.fn(i);
    //           return accum;
    //         });

    //         let orders = await getPaginatedUserOrders(req.session.users._id, perPage, skip)
    //         res.render('user/orders', { user: req.session.users, orders, totalDoc: productCount, currentPage: pageNum, pages: pages })



    // }),
    orders: (async (req, res) => {
        await getAllorder(req.session.users._id).then(async (orders) => {
            let user = req.session.users
            res.render('user/order', { orders, user, userData: user })
        })
    }),



    viewOrderProducts: (async (req, res) => {
        let user = req.session.users
        console.log(req.params.id, "req.params.idaaaaaaaaaaaaaaaaa");
        await getOrderProducts(req.params.id).then((orderProducts)=>{
            console.log(orderProducts,'orderProductssssssssssss');

       
        res.render('user/view-order-products', { user, orderProducts, userData: user })

        }).catch((err)=>{
            console.log(err, "this is error");
        })
        

    }),


    // --------------wishlist--------------------------//


    AddToWishlist: ((req, res, next) => {

        addToWishlist(req.params.id, req.session.users._id).then(() => {
            res.redirect("/wishlist")
        })

    }),


    wishlist: (async (req, res) => {
        let user = req.session.users

        let products = await getWishlistProduct(req.session.users._id)

        res.render('user/wishlist', { products, user, userData: user })
    }),


    deleteWishlist: ((req, res) => {

        deleteFromWishlist(req.body).then(() => {
            res.json({ status: true })
        })

    }),



    userOrderview: (async (req, res) => {
        let user = req.session.users
        let orders = await getUserorders(req.session.users._id)


        res.render('user/userOrderView', { orders, user, userData: user })
    }),



 



  


    placedOrderCancel: (async (req, res) => {
        let ordId = req.params.id
        console.log(ordId,'ordIddddddddddddd');
        console.log(req.body,'bodyyyyyyyyyyyyyyy reaaaaaaaaa');
        let reason = await orderHelpers.reasonUpdate(req.body.reason, ordId)
       
        let ordCancel = await orderCancel(ordId)
        console.log(ordCancel,'ordCancel');
        let singleOrder = await orderHelpers.getStatusDetails(ordId)
        console.log("111111111111111111111",singleOrder,'singleOrder');
        let orderProduct = await getProductDetails(ordId)
        let status = singleOrder.status
        

        if (status === 'order cancelled') {
            for (let i = 0; i < orderProduct.length; i++) {
                await productHelpers.cancelStockUpdate(orderProduct[i].item, orderProduct[i].quantity)
            }
            let orderDetails = await orderHelpers.getOneOrder(ordId)
            console.log(orderDetails,'orderDetailsssssssssssssss');
            let totalAmount = orderDetails.totalAmount
            if (orderDetails.status !== 'pending') {
                if (orderDetails.paymentMethod !== 'COD') {

                    walletHelpers.UPDATE_WALLET(singleOrder.deliveryDetails.email, totalAmount)

                }
            }
            
        }
        res.json({ status: true })
    }),

    returnOrder: (async (req, res) => {
        let ordId = req.params.id
        let orderReturm = returnOrder(ordId)
        let returnReason = await orderHelpers.returnReason(req.body.returnReason, ordId)
        let oneOrder = await orderHelpers.getStatusDetails(ordId)
        let orderProducts = await getProductDetails(ordId)
        let status = oneOrder.status

        if (status === 'product returned') {
            for (let i = 0; i < orderProducts.length; i++) {
                await productHelpers.cancelStockUpdate(orderProducts[i].item, orderProducts[i].quantity)
            }
            let oneOrderDetails = await orderHelpers.getOneOrder(ordId)
            let totalAmount = oneOrderDetails.total
            if (oneOrderDetails.status !== 'pending') {
                if (oneOrderDetails.paymentMethod !== 'COD') {
                    console.log('ivn ivideee ethi');
                    walletHelpers.UPDATE_WALLET(oneOrder.emailId, totalAmount)
                }
            }
            
        }
        res.json({ status: true })
    }),

    forgotpassword(req, res) {
        let user = req.session.users._id
        res.render('user/forgetpassword',{user, userData: user})
      },

      mobileNumberSubmit: ((req, res) => {
        getOtp(req.body).then((response) => {
            if (response.status) {
                signupData = response.user
                res.render('user/newPassword')
            }
            else {
                res.render('user/forgetpassword', { error: 'invalid mobile number' })
            }

        })
    }),

    newPasswordSubmit: (req, res) => {

        changePassword(req.body, signupData).then((response) => {
            if (response.status) {
                req.session.loggedIn = true;
                req.session.user = signupData;
                console.log(signupData,'oooooooooooooooooooo');
                res.redirect('/login');
            } else {
                res.render('user/newPassword', { error: 'Password not changed' });
            }
        })
            .catch(error => {
                res.render('user/newPassword', { error: 'An error occurred while changing password' });
            });
    },
    editAddressSubmit: (req, res) => {
        const addressId = parseInt(req.body.userAddressId);

       let userId=req.session.users._id;
        editAddress(req.body,addressId,userId).then(() => {
          // Handle successful address update
          res.redirect('/viewaddress'); // Replace '/success' with the appropriate redirect URL
        }).catch(error => {
          // Handle address update error
          res.render('editAddress', { error: 'An error occurred while updating the address' });
        });
      },
      


    submitAddress(req, res) {
        let user = req.session.users._id
        addAddress(req.body, user).then(() => {
            res.redirect('/userprofile')
        })
    },

    async fillAddress(req, res) {
        let userAddressId = req.body.addressId
        console.log(req.body,'userAddressId');

        if (userAddressId != "select") {
            let getOneAddress = await getOneAddressById(req.session.users._id, userAddressId)
            console.log(getOneAddress,"aaaaaaaaaaaaaaa");

            let response = getOneAddress.Address
            response.status = true
            res.json(response)
        }
        else {
            res.json({ status: false })
        }
    },

    changePassword:(async(req,res)=>{
        console.log(req.body,'333333333333333333');
        changepassword(req.body).then(() => {
            
            req.flash('updateStatusSuccess', 'Sussessfully updated')
            res.redirect('/userprofile')
          }).catch(() => {
            req.flash('updateStatusFail', 'Password cannot be matched')
            res.redirect('/userprofile')
          })

    }),

    Viewoffers: (async (req, res) => {
        let user = req.session.users
        await getAllOffers().then((coupen) => {
            res.render('user/viewOffers', { coupen, user, userData: user })

        })


    }),



    coupenVerify: (async (req, res) => {
        let user = req.session.users._id
        const date = new Date()
        let totalAmount = await getTotalAmount(user)
        console.log(totalAmount, 'totalAmounttttttttttt');
        let total = totalAmount

        if (req.body.coupen == '') {
            res.json({
                noCoupen: true,
                total
            })
        }

        else {
            let coupenResponse = await applyCoupen(req.body, user, date, totalAmount)
            console.log(coupenResponse, 'coupenResponseeeeeeeeeeeeeeee');
            if (coupenResponse.verify) {
                coupenResponse.originalPrice = totalAmount
                let discountAmount = (totalAmount * parseInt(coupenResponse.coupenData.value)) / 100
                console.log(discountAmount, "discountAmounttttttttttt");

                if (discountAmount > parseInt(coupenResponse.coupenData.maxAmount)) {
                    discountAmount = parseInt(coupenResponse.coupenData.maxAmount)
                }
                let amount = totalAmount - discountAmount
                coupenResponse.discountAmount = Math.round(discountAmount)
                coupenResponse.amount = Math.round(amount)
                req.session.amount = Math.round(amount)
                coupenResponse.savedAmount = totalAmount - Math.round(amount)
                console.log(">>>>>>>>><<<<<<<<<<<<", coupenResponse, 'coupenResponse2222222222');
                res.json(coupenResponse)
            }
            else {
                coupenResponse.total = totalAmount
                res.json(coupenResponse)
            }
        }
    }),
    wallet: async (req, res) => {
        try {
            const user = req.session.users;
            const userId = req.session.users._id;
            const orderDetails = await walletHelpers.GET_ORDER_WALLET(user.email, 'WALLET');
            if (!orderDetails) {
                throw new Error('No order details found');
            }
            const order = JSON.parse(JSON.stringify(orderDetails));
            const data = await walletHelpers.GET_WALLET(user.email);
            let walletData = await walletHelpers.WALLET_BALANCE(user.email)
            res.render('user/wallet', { userId,user, userData: user, order, data, walletData });
        } catch (error) {
            console.log(error);
            res.status(500).send('Internal Server Error');
        }
    },


 

    uploaduserImage: async (req, res) => {
       
            let user = req.session.users._id
          const imageFile = req.files[0]; // Access the first uploaded file
          req.body.imageuser = imageFile;
          console.log(req.body, 'uploaded image');
          // Process the uploaded image as needed
          await userImage(req.body,user).then((response) => {
            console.log(response,'responseeeeeeeeeeee');
            res.redirect('/userprofile')
        })
        
      }

    



}
