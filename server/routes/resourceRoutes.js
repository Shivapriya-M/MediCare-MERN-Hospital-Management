const express = require("express");
const mongoose = require("mongoose");
module.exports = function resourceRouter(Model, label) {
  const router = express.Router();
  router.get("/", async (req, res, next) => {
    try { res.json(await Model.find().sort({ createdAt: -1 }).limit(500)); } catch (e) { next(e); }
  });
  router.get("/:id", async (req, res, next) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid record ID." });
      const item = await Model.findById(req.params.id);
      if (!item) return res.status(404).json({ message: `${label} not found.` });
      res.json(item);
    } catch (e) { next(e); }
  });
  router.post("/", async (req, res, next) => {
    try { res.status(201).json(await Model.create(req.body)); } catch (e) { next(e); }
  });
  router.put("/:id", async (req, res, next) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid record ID." });
      const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!item) return res.status(404).json({ message: `${label} not found.` });
      res.json(item);
    } catch (e) { next(e); }
  });
  router.delete("/:id", async (req, res, next) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid record ID." });
      const item = await Model.findByIdAndDelete(req.params.id);
      if (!item) return res.status(404).json({ message: `${label} not found.` });
      res.json({ message: `${label} deleted successfully.` });
    } catch (e) { next(e); }
  });
  return router;
};
