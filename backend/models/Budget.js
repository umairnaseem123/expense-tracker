const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true, min: 1 },
  },
  { timestamps: true }
);

// one budget per category per user
budgetSchema.index({ user: 1, category: 1 }, { unique: true });

module.exports = mongoose.model("Budget", budgetSchema);