const { createUser, getUsers, getUserById, updateUser, deleteUser, loginUser } = require("./user.controller");
const router = require("express").Router();
const { checkToken } = require("../../auth/token_validation");
const { body, check, validationResult } = require('express-validator');

// Routes
// Route create user
router.post("/create",
     check('email').isEmail().withMessage('check given email'),
     check('password').isLength({ min: 6 }).withMessage('password must be at least 6 characters'), createUser);

// Route view all users
router.get("/index", checkToken, getUsers);

// Route get user details
router.get("/show/:id", checkToken, getUserById);

// Route update user details
router.patch("/update",
     check('name').notEmpty().withMessage('Name is required'),
     check('mobile').isInt({ min: 0, max: 10 }).withMessage('check given mobile number'),
     checkToken,
     updateUser);   //updateUser

// Route delete a user
router.post("/delete", checkToken, deleteUser);

// Route Login Api
router.post("/login",
     check('email').isEmail().withMessage('check given email'),
     check('password').isLength({ min: 6 }).withMessage('password must be at least 6 characters'), loginUser);

// Exporting Router
module.exports = router;