const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const cors = require("cors");
app.use(cors());
const Jwt = require("jsonwebtoken");

const express = require("express");
const app = express();
const port = process.env.PORT;

app.use(express.json());

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("database is connected");
  })
  .catch((e) => {
    console.log("error connecting to database");
  });
const Doctor = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});
const Doctor1 = mongoose.model("Doctor", Doctor);

app.post("/signup", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const Doctor1 = await DoctorModel.create({
    email,
    password,
  });

  res.json({
    message: "signed up",
  });
});
app.post("/signin", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const user = await UserModel.findOne({
      email: email,
      password: password,
    });

    if (!user) {
      res.json({
        response: "user not found",
      });
      return;
    }

    res.json({
      message: "signed in successfully",
    });
  } catch (e) {
    res.json({
      error: "wrong information",
    });
  }
});

const Patient = new mongoose.Schema({
  name: String,
  disease: String,
  wardNumber: Number,
  admittedDate: Date,
});
const PatientModel = mongoose.model("Patient", Patient);

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
  const patient = await PatientModel.findById(req.params.id);
  res.send(patient);
});
app.delete("/patients/:id", auth, async (req, res) => {
  await PatientModel.findByIdAndDelete(req.params.id);
  res.send({ message: "Patient record deleted" });
});
async function auth(req, res, next) {
  const token = req.headers.token;

  try {
    const isValidToken = await Jwt.verify(token, "JWT_SECRET");

    if (!isValidToken) {
      res.json({
        response: "token problem",
      });
    }

    req.id = isValidToken._id;
    next();
  } catch (e) {
    res.json({
      response: "server error",
    });
  }
}
