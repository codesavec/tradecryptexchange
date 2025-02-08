const User = require("./models/user");
const Admin = require("./models/admin")
const mongoose = require("mongoose");

const users = [
  {
    _id: "66d9d662a3af4ac565b497f3",
    fullname: "Carlos Famigiglietti",
    username: "CFam",
    email: "carlos.famiglietti@gmail.com",
    password: "Vestord33",
    deposit: 95427,
    lastdeposit: 0,
    profit: 544353,
    __v: 0,
    verified: true,
  },
  {
    _id: "671da5c37c40ad8d81a5a7ee",
    fullname: "Stephen Ellingson ",
    username: "STEVECRYP2",
    email: "SteveDJTMC@gmail.com",
    password: "Lilly330$",
    deposit: 11405,
    lastdeposit: 0,
    profit: 53439,
    __v: 0,
    verified: true,
  },
  {
    _id: "674ad22f96851286229c793d",
    fullname: "Cynthia Marie Donahue",
    username: "Cmdonahue",
    email: "donahuecindy4843@gmail.com",
    password: "Littlepmay!12",
    deposit: 9590,
    lastdeposit: 0,
    profit: 228579,
    verified: true,
    token: "338249",
    tokenExpires: "2024-11-30T08:56:59.310Z",
    __v: 0,
  },
  {
    _id: "679037f13d48f2596f42f24e",
    fullname: "Lisa L. Hostettler",
    username: "Ultralisa123",
    email: "ultralisa123@gmail.com",
    phoneNo: "19208507248",
    dob: "1975-09-11T00:00:00.000Z",
    password: "PuntaCana22!",
    deposit: 2894,
    lastdeposit: 0,
    profit: 42779,
    verified: true,
    token: null,
    tokenExpires: "2025-01-22T00:17:33.542Z",
    __v: 0,
  },
];
const admin =[
  {
    email: "csdds.org@gmail.com",
    password: "Vestord33"
  }
]

async function upload() {
  try {
    await mongoose.connect(
      "mongodb+srv://donaldmiller5409:FwVTWmdHr66X9xER@cluster0.8cadu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    console.log("Connected to MongoDB");

    for (let user of users) {
      const existingUser = await User.findOne({ email: user.email });
      if (!existingUser) {
        await new User(user).save();
        console.log(`User ${user.username} uploaded.`);
      } else {
        console.log(`User ${user.username} already exists.`);
      }
    }

    console.log("Upload complete.");
    mongoose.connection.close();
  } catch (error) {
    console.error("Error uploading users:", error);
  }
}

upload();
