const express = require("express");
const router = express.Router();
const Admin = require("../models/admin");
const User = require("../models/user");

router.use((req, res, next) => {
  res.locals.session = req.session; 
  next();
});

router.get("/", async (req, res) => {
  const adminId = req.session.admin_id
  const admin = await Admin.findById(adminId)
  if (!admin) {
    res.redirect("/admin/login");
  } else {
    console.log(admin)
    const users = await User.find({ verified: true });
    res.render("admin", { users });
  }
});

router.get("/login", async (req, res) => {
  res.render("admin-login");
});

router.post("/logout", (req, res) => {
  req.session.admin_id = null;
  req.admin = null;
  res.redirect("/admin/login");
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(`Admin: ${(email, password)}`);
  const admin = await Admin.findOne({ email, password });

  if (admin) {
    req.session.admin_id = admin._id;
    console.log(admin);
    res.redirect(`/admin`);
  } else {
    req.flash("error", "incorrect details");
    res.redirect("/admin/login");
  }
});

module.exports = router;
