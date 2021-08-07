const { createUser, getUsers, getUserById, updateUser, deleteUser, loginUser, getProductsList, getPlansList, getProductDetails, getPlanDetails, makePayment, getSubjectCategoryList, getSubjectCategoryDetails, getSubjectSubCategoryList, getSubjectSubCategoryDetails, getCountryList, getStatesList, sendMail, forgetPassword, resetPassword, verifyAccount, getPostsList, getPostDetails, createPost, updatePost, deletePost, getPostsbyCategory, getPostsbySubCategory, getLatestPosts, uploadPost, createDocument, getDocumentsList, UpdateDocument, UpdateDocumentFile, getDocumentDetails, getSellerData, getSellersList, getLatestblogs, getBlogDetails, createBuyer, UpdateTimeslots, getTimeslots, getSellerTimeSlots, makeRequestSeller, getSellerChatRequestlist, getUserProductsList, ViewUserProduct, getUnitsList, createUserProduct, updateUserProduct } = require("./user.controller");
const router = require("express").Router();
const { checkToken, verifyToken, checkCompany, checkPostTitle } = require("../../auth/token_validation");
const { body, check, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');


// handle storage using multer
var storage = multer.diskStorage({
     destination: function (req, file, cb) {
          cb(null, 'uploads');
     },
     filename: function (req, file, cb) {
          cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
     }
});
const upload = multer({ storage: storage });


// Routes

// Route create user
router.post("/create",
     check('name').not().isEmpty().withMessage('Name is required'),
     check('email').isEmail().withMessage('check given email'),
     check('password').isLength({ min: 6 }).withMessage('password must be at least 6 characters'),
     check('userType').isIn([1]).withMessage("check given userType value"), checkCompany, createUser);

// Route create buyer
router.post("/register",
     check('name').not().isEmpty().withMessage('Name is required'),
     check('email').isEmail().withMessage('check given email'),
     check('password').isLength({ min: 6 }).withMessage('password must be at least 6 characters'),
     check('userType').isIn([2]).withMessage("check given userType value"), createBuyer);

// Route view all users
router.get("/index", checkToken, getUsers);

// Route verify token
router.get("/verifyToken", verifyToken);

// Route get user details
// /:id
router.get("/show", checkToken, getUserById);

// Route get seller details
router.get("/seller/:id", getSellerData);

// Route get seller timeslots
router.get("/seller/timeslots/:id", getSellerTimeSlots);

// Route get user details
router.get("/sellerslist", getSellersList);

// Route update user details
router.post("/update",
     check('name').notEmpty().withMessage('Name is required'),
     check('mobile').isNumeric().isMobilePhone().withMessage('check given mobile number'),
     checkToken,
     updateUser);   //updateUser

// Route update user details
router.post("/updatefile", checkToken, upload.single('dataFile'), updateUser);

// Route delete a user
router.post("/delete", checkToken, deleteUser);

// Route Products list a user
router.get("/productslist", checkToken, getProductsList);

// Route Get Product Details
router.get("/productdetails/:proId", checkToken, getProductDetails);

// Route Plans list a user
router.get("/planslist/:proId", checkToken, getPlansList);

// Route Plan Details
router.get("/plandetails/:planId", checkToken, getPlanDetails);

// Route Make Payment
router.post("/makepayment", checkToken, makePayment);

// Route Login Api
router.post("/login",
     check('email').isEmail().withMessage('check given email'),
     check('password').isLength({ min: 6 }).withMessage('password must be at least 6 characters'), loginUser);

// Route Subject Category list
router.get("/category/list", checkToken, getSubjectCategoryList);

// Route Subject Category details
router.get("/category/details/:catId", checkToken, getSubjectCategoryDetails);

// Route Subject Sub Category list
router.get("/subcategory/list/:catId", checkToken, getSubjectSubCategoryList);

// Route Subject Sub Category details
router.get("/subcategory/details/:catId", checkToken, getSubjectSubCategoryDetails);

// Route Subject Category list
router.get("/country/list", checkToken, getCountryList);

// Route Subject Category details
router.get("/states/list/:id", checkToken, getStatesList);

// Route Units list
router.get("/units/list", checkToken, getUnitsList);

// Route Send Mail
router.post("/sendmail", sendMail);

// Route Verify account
router.post("/verifyaccount", verifyAccount);

// Route ForgetPassword Api
router.post("/forgetpassword",
     check('email').isEmail().withMessage('check given email'),
     forgetPassword);

// Route ResetPassword Api
router.post("/resetpassword",
     check('email').isEmail().withMessage('check given email'),
     resetPassword);


// Route Posts list
router.get("/posts/list", checkToken, getPostsList);

// Route Post Details
router.get("/posts/:id", checkToken, getPostDetails);

// Route Post Details
router.get("/blogs/:id", getBlogDetails);

// Route Post Create
router.post("/posts/create", checkToken, upload.single('dataFile'), createPost); //, upload.single('dataFile')     checkPostTitle

// Route update user details
router.post("/posts/update/", checkToken, updatePost);   //updateUser     //   , checkPostTitle

// Route update user details
router.post("/posts/updatefile", checkToken, upload.single('dataFile'), updatePost);   //updateUser     //   , checkPostTitle

// Route delete User Post
router.delete("/posts/delete/:id", checkToken, deletePost);   //deletePost

// Route Posts by Category
router.get("/posts/category/:id", getPostsbyCategory);   //

// Route Posts by Sub Category
router.get("/posts/subcategory/:id", getPostsbySubCategory);   //

// Route latest Posts
router.get("/posts/latest/:count", getLatestPosts);   //

// Route latest blogs
router.get("/blogs/latest/:count/:limit", getLatestblogs);   //

// // Route upload docs
router.post("/posts/upload", upload.single('dataFile'), uploadPost);   //

// Route Posts list
router.get("/documents/list", checkToken, getDocumentsList);

// Route Document Details
router.get("/documents/details/:docId", checkToken, getDocumentDetails);

// Route Document Create
router.post("/documents/create", checkToken, upload.single('dataFile'), createDocument);

// Route Document Update
router.post("/documents/update", checkToken, UpdateDocument);

// Route Document Update File
router.post("/documents/updatefile", checkToken, upload.single('dataFile'), UpdateDocument);   //UpdateDocumentFile

// Route Time Slots
router.post("/timeslots/update", checkToken, UpdateTimeslots);   //UpdateDocumentFile

// Route Time Slots
router.get("/timeslots/list", checkToken, getTimeslots);   //UpdateDocumentFile

// Route Time Slots
router.get("/makerequest/seller/:id", checkToken, makeRequestSeller);   //UpdateDocumentFile

// Route Time Slots
router.get("/getseller/chatrequestlist", checkToken, getSellerChatRequestlist);   //UpdateDocumentFile

// Route Products list
router.get("/products/list", checkToken, getUserProductsList);

// Route Products Details     
router.get("/products/details/:id", checkToken, ViewUserProduct);

// Route Products Create
router.post("/products/create", checkToken, upload.single('dataFile'), createUserProduct);

// Route Products Update
router.post("/products/update", checkToken, updateUserProduct);

// Route Products Update File
router.post("/products/updatefile", checkToken, upload.single('dataFile'), updateUserProduct);   //UpdateDocumentFile


// Exporting Router
module.exports = router;