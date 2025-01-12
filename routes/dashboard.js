const express = require("express")
const router = express.Router()
const User = require("../models/user")


router.get("/", async(req,res)=>{
    const useremail = req.query.name
    let email = res.app.get("email")   
    const user = await User.findOne({email:email})
    if(!req.session.user_id){
      res.redirect("/")
    } 
    else{
           res.render("dashboard",{useraccount : user})

    }
    
  })

router.get(`/deposit`, async (req,res)=>{
    const useremail = req.query.name
    let email = res.app.get("email")   
    const user = await User.findOne({email:email})
    if(!req.session.user_id){
      res.redirect("/")
    } 
    else{
          res.render("deposit",{useraccount : user})
    }
})

router.get("/withdraw", async(req,res) =>{
    const useremail = req.query.name
    let email = res.app.get("email")   
    const user = await User.findOne({email:email})
    if(!req.session.user_id){
      res.redirect("/")
    } 
    else{
          res.render("withdraw",{useraccount : user})
    }
})
router.get("/withdraw_history", async(req,res) =>{
    const useremail = req.query.name
    let email = res.app.get("email")   
    const user = await User.findOne({email:email})
    if(!req.session.user_id){
      res.redirect("/")
    } 
    else{
          res.render("withdraw_history",{useraccount : user})
    }
})
router.get("/goldcheckout", async (req,res) => {
  const useremail = req.query.name
  let email = res.app.get("email")   
  const user = await User.findOne({email:email})
  if(!req.session.user_id){
    res.redirect("/login")
  } 
  else{
      res.render("goldcheckout")
  }
})
router.get("/silvercheckout", async (req,res) => {
  const useremail = req.query.name
  let email = res.app.get("email")   
  const user = await User.findOne({email:email})
  if(!req.session.user_id){
    res.redirect("/login")
  } 
  else{
      res.render("silvercheckout")
  }
})
router.get("/startercheckout", async (req,res) => {
  const useremail = req.query.name
  let email = res.app.get("email")   
  const user = await User.findOne({email:email})
  if(!req.session.user_id){
    res.redirect("/login")
  } 
  else{
      res.render("startercheckout")
  }
})




  module.exports = router;
