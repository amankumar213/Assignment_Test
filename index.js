const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const cors = require("cors");
const Jwt = require("jsonwebtoken");
const express = require("express");
const app = express();

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;

// Database connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Database connected"))
  .catch(() => console.log("Error connecting to database"));

// Doctor Schema
const DoctorSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});
const DoctorModel = mongoose.model("Doctor", DoctorSchema);

// Signup
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  const doctor = await DoctorModel.create({ name, email, password });
  res.json({ message: "Signed up successfully", doctor });
});

// Signin
app.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  const user = await DoctorModel.findOne({ email, password });

  if (!user) return res.json({ response: "User not found" });

  const token = Jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
  res.json({ message: "Signed in successfully", token });
});

// Auth middleware
async function auth(req, res, next) {
  const token = req.headers.token;
  try {
    const decoded = Jwt.verify(token, process.env.JWT_SECRET);
    req.id = decoded._id;
    next();
  } catch {
    res.json({ response: "Invalid token" });
  }
}

// Patient Schema
const PatientSchema = new mongoose.Schema({
  name: String,
  disease: String,
  wardNumber: Number,
  admittedDate: Date,
});
const PatientModel = mongoose.model("Patient", PatientSchema);

// Routes
app.post("/patients", async (req, res) => {
  const patient = new PatientModel(req.body);
  await patient.save();
  res.send(patient);
});

app.get("/patients", async (req, res) => {
  const patients = await PatientModel.find();
  res.send(patients);
});

app.put("/patients/:id", async (req, res) => {
  const patient = await PatientModel.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.send(patient);
});

app.delete("/patients/:id", auth, async (req, res) => {
  await PatientModel.findByIdAndDelete(req.params.id);
  res.send({ message: "Patient record deleted" });
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
