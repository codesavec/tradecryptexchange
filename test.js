// const nodemailer = require("nodemailer");

// const signupTransporter = nodemailer.createTransport({
//   host: "mail.tradecrypt.org",
//   port: 465,
//   secure: true,
//   auth: {
//     user: "no_reply@tradecrypt.org",
//     pass: "f2qTDBnSouxDAsl",
//   },
//   tls: {
//     rejectUnauthorized: false,
//   },
// });

// // Test email options
// const mailOptions = {
//   from: "no_reply@tradecrypt.org", // Sender address
//   to: "davidmiller4503@gmail.com", // Replace with your email address to test
//   subject: "Test Email", // Subject line
//   text: "This is a test email to verify the transporter works.", // Plain text body
// };

// // Send the test email
// signupTransporter.sendMail(mailOptions, (error, info) => {
//   if (error) {
//     console.error("Error sending email:", error);
//   } else {
//     console.log("Email sent successfully:", info.response);
//   }
// });

var generateParenthesis = function (n) {
  const result = [];

  function backtrack(current, open, close) {
    if (current.length === n * 2) {
      result.push(current);
      return;
    }
    if (open < n) {
      backtrack(current + "(", open + 1, close);
    }
    if (close < open) {
      backtrack(current + ")", open, close + 1);
    }
  }

  backtrack("", 0, 0);
  return result;

};

console.log(generateParenthesis(3)); 