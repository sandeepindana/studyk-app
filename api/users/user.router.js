const { createUser, getUsers, getUserById, updateUser, deleteUser, loginUser, getProductsList, getPlansList, getProductDetails, getPlanDetails, makePayment, getSubjectCategoryList, getSubjectCategoryDetails, getSubjectSubCategoryList, getSubjectSubCategoryDetails } = require("./user.controller");
const router = require("express").Router();
const { checkToken } = require("../../auth/token_validation");
const { body, check, validationResult } = require('express-validator');

// Routes
// Route create user
router.post("/create",
     check('name').not().isEmpty().withMessage('Name is required'),
     check('email').isEmail().withMessage('check given email'),
     check('password').isLength({ min: 6 }).withMessage('password must be at least 6 characters'),
     check('userType').isIn([1, 2]).withMessage("check given userType value"), createUser);

// Route view all users
router.get("/index", checkToken, getUsers);

// Route get user details
// /:id
router.get("/show", checkToken, getUserById);

// Route update user details
router.patch("/update",
     check('name').notEmpty().withMessage('Name is required'),
     check('mobile').isNumeric().isMobilePhone().withMessage('check given mobile number'),
     checkToken,
     updateUser);   //updateUser

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
router.get("/subject/category/list", checkToken, getSubjectCategoryList);

// Route Subject Category details
router.get("/subject/category/details/:catId", checkToken, getSubjectCategoryDetails);

// Route Subject Sub Category list
router.get("/subject/subcategory/list/:catId", checkToken, getSubjectSubCategoryList);

// Route Subject Sub Category details
router.get("/subject/subcategory/details/:catId", checkToken, getSubjectSubCategoryDetails);


// Exporting Router
module.exports = router;