const express = require("express");
var cron = require(`node-cron`);
var nodemailer = require("nodemailer");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const User = require("./models/user");
var bodyParser = require("body-parser");
var session = require("express-session");
const dashboard = require("./routes/dashboard");
const admin = require("./routes/admin");
const crypto = require("crypto");

const dbURL =
  "mongodb+srv://donaldmiller5409:FwVTWmdHr66X9xER@cluster0.8cadu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const MongoDBStore = require("connect-mongo");
mongoose
  .connect(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connection open");
  })
  .catch((error) => {
    console.log(error, "oh no error");
  });

var myemail = "kvjp gdmf hdym cmcb";
var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "b71809244@gmail.com",
    pass: myemail,
  },
});

const signupTransporter = nodemailer.createTransport({
  host: "mail.tradecrypt.org",
  port: 465,
  secure: true,
  auth: {
    user: "no_reply@tradecrypt.org",
    pass: "f2qTDBnSouxDAsl",
  },
  tls: {
    rejectUnauthorized: false,
  },
});


app.use(
  session({
    secret: "dashboard",
    store: new MongoDBStore({
      mongoUrl: dbURL,
      touchAfter: 24 * 60 * 60,
    }),
  })
);
app.use(flash());
app.use((req, res, next) => {
  res.locals.error = req.flash("error");
  next();
});
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.raw());
// parse text
app.use(bodyParser.text());
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use("/account", dashboard);
app.use("/admin", admin);
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// app.get('*', (req, res) => {
//   res.redirect(301, 'https://tradecrypt.org' + req.originalUrl);
// });

app.get("/", (req, res) => {
  res.render("index");
});
app.get("/user", async (req, res) => {
  const user = await User.find();
  res.json({ user });
});

app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect("account");
  } else {
    res.render("login");
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);
  const user = await User.findOne({ email, password });
  req.app.set("email", email);

  if (user && user.verified === true) {
    req.session.user_id = user._id;
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        req.flash("error", "Session error. Please try again.");
        return res.redirect("/login");
      }
      console.log(user);
      res.redirect(`/account`);
    });
  } else {
    req.flash("error", "incorrect details");
    res.redirect("/login");
  }
});

app.get("/forgot_password", (req, res) => {
  res.render("forgot");
});
app.post("/forgot", async (req, res) => {
  const { useremail } = req.body;
  console.log(req.body);
  const user = await User.findOne({ email: useremail });
  if (user) {
    var mailOptions = {
      from: "no_reply@tradecrypt.org",
      to: user.email,
      subject: "account recovery",
      text: `Click on the link below to change email address 
      
      https://tradecrypt.org/change_password`,
    };

    signupTransporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        res.redirect("/checkmail");
        console.log("Email sent: " + info.response);
      }
    });
  }
});

app.get("/change_password", async (req, res) => {
  res.render("password");
});
app.get("/checkmail", async (req, res) => {
  res.render("checkmail");
});

app.post("/change_password", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  user.password = password;
  console.log(user.password);
  await user.save();
  res.redirect("/login");
  console.log(email);
});

app.get("/signup", async (req, res) => {
  if (req.session.user_id) {
    res.redirect("account");
  } else {
    res.render("signup");
  }
});

app.post("/signup", async (req, res) => {
  const { fullname, username, email, password, dob, phoneNo } = req.body;
  function generateSignupToken() {
    return Math.floor(
      100000 + (crypto.randomBytes(3).readUIntBE(0, 3) % 900000)
    ).toString();
  }
  let signupToken = generateSignupToken();
  if (!username || !email || !fullname) {
    req.flash("error", "fill all required fields");
    return res.redirect("/signup");
  }

  try {
    const existingUser = await User.findOne({ username });
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      req.flash("error", "email already exists");
      return res.redirect("/signup");
    } else if (existingUser) {
      req.flash("error", "Username already exists");
      return res.redirect("/signup");
    }
    const signupURL = `https://tradecrypt.org/complete-signup?token=${signupToken}`;
    const mailOptions = {
      to: email,
      from: "no_reply@tradecrypt.org",
      subject: "Sign Up Request",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; padding: 20px;">
          <h2>Sign Up Request</h2>
          <p>You are receiving this email to complete your signup process at Tradecryptexchange.</p>
          <p>
            <a href="${signupURL}" style="background-color: #605436; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Complete Signup</a>
          </p>
          <p>Or copy and paste this link into your browser: <a href="${signupURL}">${signupURL}</a></p>
          <p><strong>Thank you!</strong></p>
          <img src="cid:logoImage" alt="Company Logo" width="100" height:auto;>
        </div>
      `,
      // attachments: [
      //   {
      //     filename: "logo.png",
      //     path: "../assets/logo.png",
      //     cid: "logoImage",
      //   },
      // ],
    };
    const user = new User({
      fullname,
      username,
      email,
      dob,
      phoneNo,
      password,
      token: signupToken,
      tokenExpires: new Date(Date.now() + 5 * 60 * 1000),
      verified: false,
    });
    await user.save();
    await signupTransporter.sendMail(mailOptions);
    req.flash("success", "Please check your email");
    res.redirect("checkmail");
  } catch (error) {
    console.error(error);
    req.flash("error", "signup failure, please try again later");
  }
});

app.post("/complete-signup", async (req, res) => {
  const { token } = req.body;
  console.log(token);
  try {
    const user = await User.findOne({
      token: token,
      tokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Password reset token is invalid or has expired." });
    }
    user.verified = true;
    user.token = null;
    await user.save();
    req.flash("success", "Verified successfuly please login");
    res.redirect("/login");
  } catch (error) {
    req.flash("error", "invalid token");
    res.redirect("/login");
  }
});
app.get("/complete-signup", async (req, res) => {
  const token = req.query.token; // Extract the token from the URL
  res.render("complete-signup", { token });
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.redirect("/account");
    }
    res.redirect("/login");
  });
  console.log("User logged out, session destroyed");
});

app.get("/arbitrage", (req, res) => {
  res.render("arbitrage");
});
app.get("/news", (req, res) => {
  res.render("news");
});
app.get("/partnership", (req, res) => {
  res.render("partnership");
});
app.get("/about_us", (req, res) => {
  res.render("about-us");
});
app.get("/help", (req, res) => {
  res.render("support");
});
app.get("/faq", (req, res) => {
  res.render("faq");
});
app.get("/support", (req, res) => {
  res.render("request");
});

app.post("/admin/update", async (req, res) => {
  const { userId, lastdeposit, bitcoin, ethereum, litecoin, usdt, withdrawn } =
    req.body;
  console.log(req.body);
  try {
    await User.findByIdAndUpdate(userId, {
      lastdeposit,
      bitcoin,
      ethereum,
      litecoin,
      usdt,
      withdrawn,
    });
    res.redirect("/admin");
  } catch (err) {
    console.log(err);
    res.status(500).send("Error updating user");
  }
});

// Reusable email-sending function



app.post("/admin/delete", async (req, res) => {
  const userId = req.body;
  try {
    console.log(userId);
    await User.findByIdAndDelete(userId);
    res.redirect("/asdfjduadminusers");
  } catch (err) {
    res.status(500).send("Error deleting user");
  }
});

app.delete("/del/users", async (req, res) => {
  try {
    const result = await User.find(); // Delete all users where verified is false
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting users" });
  }
});

app.listen(4000, () => {
  console.log("Listening");
});
