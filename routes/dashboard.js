const express = require("express")
const router = express.Router()
const User = require("../models/user")

const getUserFromSession = async (req, res, next) => {
  if (!req.session.user_id) {
  
    req.flash("error","You have to be logged in to access that page");
    return res.redirect("/login"); 
  }

  try {
    const user = await User.findById(req.session.user_id);
    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

router.use(getUserFromSession);
router.use((req, res, next) => {
  res.locals.session = req.session; 
  next();
});


router.get("/", async(req,res)=>{
      res.render("dashboard",{useraccount : req.user})
  })

router.get(`/deposit`, async (req,res)=>{
       res.render("deposit",{useraccount : req.user})
})

router.get("/withdraw", async(req,res) =>{
    
    
      res.render("withdraw",{useraccount : req.user})
})
router.get("/withdraw_history", async(req,res) =>{
    
    
      res.render("withdraw_history",{useraccount : req.user})
})
router.get("/goldcheckout", async (req,res) => {
  if(!req.session.user_id){
    res.redirect("/login")
  } 
  else{
      res.render("goldcheckout")
  }
})
router.get("/silvercheckout", async (req,res) => {
  if(!req.session.user_id){
    res.redirect("/login")
  } 
  else{
      res.render("silvercheckout")
  }
})
router.get("/startercheckout", async (req,res) => {
  if(!req.session.user_id){
    res.redirect("/login")
  } 
  else{
      res.render("startercheckout")
  }
})




  module.exports = router;
