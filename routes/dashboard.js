const express = require("express");
const router = express.Router();
const User = require("../models/user");
const nodemailer = require("nodemailer");
const axios = require("axios");
const widthrawalTransport = nodemailer.createTransport({
  host: "mail.tradingcrypt.org",
  port: 465,
  secure: true,
  auth: {
    user: process.env.norepMail,
    pass: process.env.norepPass,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const getUserFromSession = async (req, res, next) => {
  if (!req.session.user_id) {
    req.flash("error", "You have to be logged in to access that page");
    return res.redirect("/login");
  }

  try {
    const user = await User.findById(req.session.user_id);
    const coinIds = ["bitcoin", "ethereum", "litecoin", "tether"]; // Add more IDs if needed
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds.join(
      ","
    )}&vs_currencies=usd`;

    const response = await axios.get(url);
    const prices = response.data;

    // Store original balances before conversion
    user.rawBitcoin = user.bitcoin;
    user.rawEthereum = user.ethereum;
    user.rawLitecoin = user.litecoin;
    user.rawUsdt = user.usdt;

    // Convert to USD values
    user.bitcoin = (user.bitcoin * prices.bitcoin.usd).toFixed(2);
    user.ethereum = (user.ethereum * prices.ethereum.usd).toFixed(2);
    user.litecoin = (user.litecoin * prices.litecoin.usd).toFixed(2);
    user.usdt = (user.usdt * prices.tether.usd).toFixed(2);

    req.user = user;
    next();
  } catch (err) {
    console.error("getuserERR", err);
    res.status(500).send("Server error");
  }
};

router.use(getUserFromSession);
router.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

router.get("/", async (req, res) => {
  res.render("dashboard", { useraccount: req.user });
});

router.get(`/deposit`, async (req, res) => {
  res.render("deposit", { useraccount: req.user });
});

router.get("/withdraw", async (req, res) => {
  res.render("withdraw", { useraccount: req.user });
});
router.get("/withdraw_history", async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const withdrawalHistory = user.withdrawalHistory || [];

    res.render("withdraw_history", {
      useraccount: req.user,
      withdrawalHistory: withdrawalHistory,
    });
  } catch (error) {
    console.error("Error fetching withdrawal history:", error);
    res.render("withdraw_history", {
      useraccount: req.user,
      withdrawalHistory: [],
    });
  }
});

router.get("/api/withdraw_history", async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const withdrawalHistory = user.withdrawalHistory || [];

    res.json({
      success: true,
      data: withdrawalHistory,
    });
  } catch (error) {
    console.error("Error fetching withdrawal history:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching withdrawal history",
    });
  }
});

router.get("/deposit_history", async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const depositHistory = user.depositHistory || [];

    res.render("deposit_history", {
      useraccount: req.user,
      depositHistory: depositHistory,
    });
  } catch (error) {
    console.error("Error fetching deposit history:", error);
    res.render("deposit_history", {
      useraccount: req.user,
      depositHistory: [],
    });
  }
});

router.get("/api/deposit_history", async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const depositHistory = user.depositHistory || [];

    res.json({
      success: true,
      data: depositHistory,
    });
  } catch (error) {
    console.error("Error fetching deposit history:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching deposit history",
    });
  }
});

router.get("/goldcheckout", async (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    res.render("goldcheckout");
  }
});
router.get("/silvercheckout", async (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    res.render("silvercheckout");
  }
});
router.get("/startercheckout", async (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    res.render("startercheckout");
  }
});

router.post("/withdraw", async (req, res) => {
  async function sendEmail(transporter, to, subject, html) {
    const mailOptions = {
      from: "admin@tradingcrypt.org",
      to,
      subject,
      html,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${to}`);
    } catch (error) {
      console.error("Error sending email:", error);
    }
  }

  const userId = req.user._id;
  let { amount, coin, wallet_address } = req.body;
  amount = parseFloat(amount);
  const user = await User.findById(userId);
  const coinIds = {
    bitcoin: "bitcoin",
    ethereum: "ethereum",
    usdt: "tether",
    litecoin: "litecoin",
  };

  const coingeckoId = coinIds[coin.toLowerCase()];
  let cryptoAmount = null;

  const priceRes = await axios.get(
    `https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoId}&vs_currencies=usd`
  );
  const coinUsdPrice = priceRes.data[coingeckoId].usd;

  cryptoAmount = amount / coinUsdPrice;
  cryptoAmount = cryptoAmount;

  const userBalance = req.user[coin]; // Assuming `balances` is an object in the user schema with coin names as keys
  if (!userBalance || userBalance < amount) {
    return res.status(400).json({
      message: `Insufficient balance. Your current ${coin} balance is $ ${
        userBalance || 0
      } / ${user[coin] || 0} 
      .`,
    });
  }
  // user.withdrawals.push({
  //   amount,
  //   coin,
  //   wallet_address,
  //   date: new Date(),
  // });

  // Add withdrawal record to withdrawalHistory
  user.withdrawalHistory.push({
    amount: amount,
    currency: coin.toLowerCase(),
    status: "pending",
    walletAddress: wallet_address,
    date: new Date(),
    notes: `Withdrawal request for ${cryptoAmount} ${coin}`,
  });

  user[coin] -= cryptoAmount;
  user.profit -= amount;
  user.withdrawn += amount;

  try {
    await sendEmail(
      widthrawalTransport,
      user.email,
      "Withdrawal Request Received",
      `<p>Dear ${user.fullname},</p>
       <p>We have received your withdrawal request for <strong>${cryptoAmount} ${coin}</strong>.</p>
       <p>Our team is currently processing your request, and you will be notified once it is completed.</p>
       <p>Thank you for choosing TradeCrypt Exchange.</p>
       <p>Best regards,<br>TradeCrypt Exchange Team</p>`
    );

    await sendEmail(
      widthrawalTransport,
      "mscds.org@gmail.com",
      "New Withdrawal Request Notification",
      `<p>Admin,</p>
       <p>User <strong>${user.email}</strong> has requested a withdrawal of <strong>${cryptoAmount} ${coin}</strong>.</p>
       <p>Wallet Address: <strong>${wallet_address}</strong></p>
       <p>Please review and process this request promptly.</p>
       <p>Best regards,<br>TradeCrypt System</p>`
    );
    await user.save();

    console.log("mails sent successfully");
    res.json({ message: "Withdrawal request successfull, Check your email" });
  } catch (error) {
    console.error("Error sending emails:", error);
    res
      .status(500)
      .json({ message: "Error processing withdrawal request", error });
  }
});

router.post("/withdraw/:withdrawalId/status", async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    const { status, notes } = req.body;

    if (!["pending", "completed", "failed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const withdrawal = user.withdrawalHistory.id(withdrawalId);
    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal not found" });
    }

    withdrawal.status = status;
    if (notes) {
      withdrawal.notes = notes;
    }

    await user.save();

    res.json({
      message: "Withdrawal status updated successfully",
      status: withdrawal.status,
    });
  } catch (error) {
    console.error("Error updating withdrawal status:", error);
    res.status(500).json({ message: "Error updating withdrawal status" });
  }
});

router.post("/deposit", async (req, res) => {
  try {
    const userId = req.user._id;
    let { amount, coin, paymentMethod, notes } = req.body;
    amount = parseFloat(amount);

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add deposit record to depositHistory
    const depositRecord = {
      amount: amount,
      currency: coin.toLowerCase() || "usd",
      status: "pending",
      date: new Date(),
      paymentMethod: paymentMethod || "Manual Deposit",
      notes: notes || "User deposit request",
    };

    user.depositHistory.push(depositRecord);

    // Update user's deposit total
    user.deposit += amount;
    user.lastdeposit = amount;

    await user.save();

    res.json({
      message: "Deposit request submitted successfully",
      depositId: depositRecord._id,
    });
  } catch (error) {
    console.error("Error processing deposit:", error);
    res.status(500).json({ message: "Error processing deposit request" });
  }
});

router.post("/deposit/:depositId/status", async (req, res) => {
  try {
    const { depositId } = req.params;
    const { status, notes } = req.body;

    if (!["pending", "completed", "failed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const deposit = user.depositHistory.id(depositId);
    if (!deposit) {
      return res.status(404).json({ message: "Deposit not found" });
    }

    deposit.status = status;
    if (notes) {
      deposit.notes = notes;
    }

    await user.save();

    res.json({
      message: "Deposit status updated successfully",
      status: deposit.status,
    });
  } catch (error) {
    console.error("Error updating deposit status:", error);
    res.status(500).json({ message: "Error updating deposit status" });
  }
});

module.exports = router;
