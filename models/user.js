const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
  fullname: {
    type: String,
    unique: true,
    required: true,
  },
  username: {
    type: String,
    unique: true,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  phoneNo: {
    type: String,
    require: false,
  },
  dob: {
    type: Date,
    required: false,
  },
  password: {
    type: String,
  },
  deposit: {
    type: Number,
    default: 0,
  },
  lastdeposit: {
    type: Number,
    default: 0,
  },
  profit: {
    type: Number,
    default: 0,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  bitcoin:{
    type: Number,
    default: 0
  },
  ethereum: {
    type: Number, 
    default: 0
  },
  litecoin:{
    type: Number,
    default: 0
  },
  usdt: {
    type: Number,
    default:0
  },
  withdrawn:{
    type: Number,
    default: 0
  },
  token: {
    type: String,
    required: false,
  },
  tokenExpires: {
    type: Date,
    required: false,
  },
});

UserSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  const user = await this.model.findOne(this.getQuery());
    console.log("this is ",update)

  if (!user) return next(); // Exit if user is not found

  if (update.lastdeposit !== undefined) {
    update.deposit = (user.deposit ?? 0) + Number(update.lastdeposit);
  } else {
    delete update.deposit; // Ensure deposit is not updated unless lastdeposit is provided
  }

  if (update.bitcoin !== undefined || update.ethereum !== undefined || update.litecoin !== undefined || update.usdt !== undefined) {
    update.profit = Number(update.bitcoin ?? user.bitcoin) +
                    Number(update.ethereum ?? user.ethereum) +
                    Number(update.litecoin ?? user.litecoin) +
                    Number(update.usdt ?? user.usdt);
  }

  next();
});


const User = mongoose.model("User", UserSchema);

module.exports = User;
