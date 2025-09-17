const mongoose = require("mongoose");
const axios = require("axios");
const UserSchema = new mongoose.Schema({
  fullname: {
    type: String,
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
  bitcoin: {
    type: Number,
    default: 0,
  },
  ethereum: {
    type: Number,
    default: 0,
  },
  litecoin: {
    type: Number,
    default: 0,
  },
  usdt: {
    type: Number,
    default: 0,
  },
  withdrawn: {
    type: Number,
    default: 0,
  },
  withdrawalHistory: [
    {
      date: {
        type: Date,
        default: Date.now,
      },
      amount: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        enum: ["bitcoin", "ethereum", "litecoin", "usdt", "usd"],
        default: "usd",
      },
      status: {
        type: String,
        enum: ["pending", "completed", "failed", "cancelled"],
        default: "pending",
      },
      transactionId: {
        type: String,
        required: false,
      },
      walletAddress: {
        type: String,
        required: false,
      },
      notes: {
        type: String,
        required: false,
      },
    },
  ],
  depositHistory: [
    {
      date: {
        type: Date,
        default: Date.now,
      },
      amount: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        enum: ["bitcoin", "ethereum", "litecoin", "usdt", "usd"],
        default: "usd",
      },
      status: {
        type: String,
        enum: ["pending", "completed", "failed", "cancelled"],
        default: "pending",
      },
      transactionId: {
        type: String,
        required: false,
      },
      paymentMethod: {
        type: String,
        required: false,
      },
      notes: {
        type: String,
        required: false,
      },
    },
  ],
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
  console.log("this is ", update);

  if (!user) return next();

  if (update.lastdeposit !== undefined) {
    update.deposit = (Number(user.deposit) || 0) + Number(update.lastdeposit);
  } else {
    delete update.deposit;
  }

  const coins = ["bitcoin", "ethereum", "litecoin", "usdt"];
  const coinIds = {
    bitcoin: "bitcoin",
    ethereum: "ethereum",
    litecoin: "litecoin",
    usdt: "tether",
  };

  const needsProfitUpdate = coins.some((coin) => update[coin] !== undefined);

  if (needsProfitUpdate) {
    try {
      // Fetch live USD prices from CoinGecko
      const priceRes = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price`,
        {
          params: {
            ids: Object.values(coinIds).join(","),
            vs_currencies: "usd",
          },
        }
      );

      const prices = priceRes.data;

      let totalUsd = 0;

      for (const coin of coins) {
        const updatedVal = update[coin];
        const existingVal = user[coin];

        // Use updated value if present, else existing value, else 0
        const coinAmount =
          updatedVal !== undefined
            ? Number(updatedVal)
            : Number(existingVal || 0);
        const coinPrice = Number(prices[coinIds[coin]]?.usd || 0);

        totalUsd += coinAmount * coinPrice;
      }

      update.profit = totalUsd.toFixed(2);
    } catch (error) {
      console.error("Error fetching prices:", error);
      // fallback to existing profit
      update.profit = Number(user.profit || 0);
    }
  }

  next();
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
