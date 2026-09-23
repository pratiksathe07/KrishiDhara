require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "krishidhara00@gmail.com" });
    if (existingAdmin) {
      console.log("Admin user already exists!");
      console.log("Email: krishidhara00@gmail.com");
      process.exit(0);
    }

    const admin = new User({
      firstName: "Super",
      lastName: "Admin",
      email: "krishidhara00@gmail.com",
      mobile: "9999999998", // Using a different mobile to avoid unique constraint clash
      role: "admin",
      status: "active"
    });

    await admin.save();
    console.log("✅ Admin user created successfully!");
    console.log("Email: krishidhara00@gmail.com");
    console.log("Note: Use the standard OTP flow (or whatever login flow is setup) to login with this email/mobile.");
    
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();
