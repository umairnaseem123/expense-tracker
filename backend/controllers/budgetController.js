const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");

async function spentThisMonth(userId) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const rows = await Transaction.aggregate([
    { $match: { user: userId, type: "expense", date: { $gte: start, $lt: end } } },
    { $group: { _id: "$category", total: { $sum: "$amount" } } },
  ]);
  const map = {};
  rows.forEach((r) => (map[r._id] = r.total));
  return map;
}

exports.getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user._id }).sort({ category: 1 });
    const spent = await spentThisMonth(req.user._id);
    res.json(
      budgets.map((b) => ({
        _id: b._id,
        category: b.category,
        amount: b.amount,
        spent: spent[b.category] || 0,
      }))
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createBudget = async (req, res) => {
  try {
    const { category, amount } = req.body;
    if (!category || !amount || Number(amount) <= 0) {
      return res.status(400).json({ message: "Category and a positive amount are required" });
    }
    const budget = await Budget.create({ user: req.user._id, category, amount: Number(amount) });
    res.status(201).json(budget);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "A budget for this category already exists" });
    }
    res.status(500).json({ message: err.message });
  }
};

exports.updateBudget = async (req, res) => {
  try {
    const { category, amount } = req.body;
    if (amount !== undefined && Number(amount) <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }
    const update = {};
    if (category) update.category = category;
    if (amount !== undefined) update.amount = Number(amount);
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      update,
      { new: true, runValidators: true }
    );
    if (!budget) return res.status(404).json({ message: "Budget not found" });
    res.json(budget);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "A budget for this category already exists" });
    }
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!budget) return res.status(404).json({ message: "Budget not found" });
    res.json({ message: "Budget deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};