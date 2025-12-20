import User from "../../db/models/user.js";
import {Router} from "express"
import { sendVerificationEmail } from "../../utils/sendMail.js";
const router = Router()

// works
router.post("/register", async (req, res) => {
  let { username, email, password } = req.body;


  // preliminary validation
  if (!username || !email || !password) {
    return res.status(400).json({ error: "Please enter all fields" });
  }
  if (typeof (username) !== "string") {
    return res.status(400).json({ error: "Invalid username" });
  }
  if (typeof (email) !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }
  if (typeof (password) !== "string") {
    return res.status(400).json({ error: "Invalid password" });
  }

  // pre-processing
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }
  username = username.trim();
  email = email.trim().toLowerCase();
  password = password.trim();

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    user = new User({
      username,
      email,
      password,
    });

    const verificationToken = user.generateVerificationToken();

    await Promise.all([user.save(), sendVerificationEmail(email, verificationToken)]);

    // add queue and error handler later

    const token = user.generateAuthToken();

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        emailVerified: user.emailVerified,
      },
      msg: "Registration successful. Please check your email to verify your account.",
    });

  } catch (err) {
    console.error((err as Error).message);
    res.status(401).json({ error: (err as Error).message });
  }
});

export default router