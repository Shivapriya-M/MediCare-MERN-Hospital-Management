require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const models = require("./models");
const resourceRouter = require("./routes/resourceRoutes");
const app = express();
const PORT = Number(process.env.PORT) || 5000;
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));
app.get("/", (req,res) => res.json({ name: "MediCare Hospital API", status: "running" }));
app.get("/api/health", (req,res) => res.json({ api:"ok", database: mongoose.connection.readyState === 1 ? "connected" : "disconnected" }));
[
  ["patients",models.Patient,"Patient"],["doctors",models.Doctor,"Doctor"],["departments",models.Department,"Department"],
  ["appointments",models.Appointment,"Appointment"],["invoices",models.Invoice,"Invoice"],
  ["medical-history",models.MedicalHistory,"Medical history"],["prescriptions",models.Prescription,"Prescription"]
].forEach(([path, Model, label]) => app.use(`/api/${path}`, resourceRouter(Model,label)));
app.get("/api/dashboard", async (req,res,next) => {
  try {
    const [totalPatients,totalDoctors,availableDoctors,totalDepartments,totalAppointments,pendingInvoices,
      upcomingAppointments,recentInvoices,appointmentStatuses,paid] = await Promise.all([
      models.Patient.countDocuments(), models.Doctor.countDocuments(), models.Doctor.countDocuments({availability:"Available"}),
      models.Department.countDocuments(), models.Appointment.countDocuments(), models.Invoice.countDocuments({paymentStatus:"Pending"}),
      models.Appointment.find({status:"Scheduled"}).sort({date:1,time:1}).limit(5),
      models.Invoice.find().sort({createdAt:-1}).limit(5),
      models.Appointment.aggregate([{$group:{_id:"$status",count:{$sum:1}}}]),
      models.Invoice.aggregate([{$match:{paymentStatus:"Paid"}},{$group:{_id:null,total:{$sum:"$amount"}}}])
    ]);
    res.json({counts:{totalPatients,totalDoctors,availableDoctors,totalDepartments,totalAppointments,pendingInvoices},
      upcomingAppointments,recentInvoices,appointmentStatuses,paidRevenue:paid[0]?.total || 0});
  } catch(e) { next(e); }
});
app.use((req,res) => res.status(404).json({message:`Route not found: ${req.method} ${req.originalUrl}`}));
app.use((error,req,res,next) => {
  console.error(`${req.method} ${req.originalUrl}:`, error);
  if (error.name === "ValidationError") return res.status(400).json({message:Object.values(error.errors).map(x=>x.message).join(" ")});
  if (error.code === 11000) return res.status(409).json({message:"A record with that unique value already exists."});
  if (error.name === "CastError") return res.status(400).json({message:"Invalid value for a record field."});
  res.status(500).json({message:error.message || "Internal server error."});
});
async function start() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/medicare_hospital");
    console.log("MongoDB Connected Successfully");
    app.listen(PORT, () => console.log(`MediCare API running at http://localhost:${PORT}`));
  } catch(e) {
    console.error("MongoDB connection failed. Ensure MongoDB is running and MONGODB_URI is correct.");
    console.error(e.message); process.exit(1);
  }
}
start();
