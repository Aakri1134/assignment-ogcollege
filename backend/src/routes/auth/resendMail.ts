import { Router } from "express";
import User from "../../db/models/user.js";
import { enqueueVerificationEmail } from "../../utils/sendMail.js";
import { strictRateLimit } from "../../middleware/rateLimiting.js";


const router = Router()
router.post("/", strictRateLimit, async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: "Email already verified" });
    }

    const verificationToken = user.generateVerificationToken();
    await user.save();

    await enqueueVerificationEmail(email, verificationToken);

    res.status(200).json({ msg: "Verification email resent" });
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ error: "Server error" });
  }
});

export default router