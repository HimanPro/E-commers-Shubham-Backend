const mongoose = require("mongoose");

const AdminCredSchema = new mongoose.Schema(
  {
    email: { type: String, default: 'aldgroup492@gmail.com',},
    password: { type: String, default: '@aldgroup15',},
  },
 
  { timestamps: true, collection: "AdminCred" }
);

module.exports = mongoose.model("AdminCredSchema", AdminCredSchema);