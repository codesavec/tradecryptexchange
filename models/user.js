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

UserSchema.pre("save", function (next) {
  this.profit = Number(this.bitcoin) + Number(this.ethereum) + Number(this.litecoin) + Number(this.usdt);
  next();
});

// Middleware to update profit when using `findOneAndUpdate`
UserSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (update.bitcoin !== undefined || update.ethereum !== undefined || update.litecoin !== undefined || update.usdt !== undefined) {
    const user = await this.model.findOne(this.getQuery());
    if (user) {
      update.profit = Number(update.bitcoin ?? user.bitcoin) +
                      Number(update.ethereum ?? user.ethereum) +
                      Number(update.litecoin ?? user.litecoin) +
                      Number(update.usdt ?? user.usdt);
    }
  }
  next();
});


const User = mongoose.model("User", UserSchema);

module.exports = User;
