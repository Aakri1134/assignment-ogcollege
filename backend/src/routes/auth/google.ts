import { google } from "googleapis";
import { Router } from "express";
import Mentor from "../../db/models/mentor.js";
import { verifyJWT } from "../../middleware/verifyJWT.js";
import User from "../../db/models/user.js";

const router = Router();

const createOAuthClient = () =>
  new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    process.env.GOOGLE_REDIRECT_URI!
  );

// Start OAuth
router.get("/", verifyJWT, (req, res) => {
  const oauth2Client = createOAuthClient();

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/calendar"]
  });

  res.redirect(url);
});

// OAuth callback
router.get("/callback", verifyJWT, async (req, res) => {
  if (!req.user) {
    return res.status(401).send("Unauthorized");
  }

  const code = req.query.code as string;
  if (!code) {
    return res.status(400).send("Missing auth code");
  }

  const oauth2Client = createOAuthClient();

  let tokens;
  try {
    ({ tokens } = await oauth2Client.getToken(code));
  } catch {
    return res.status(500).send("Google authentication failed");
  }

  if (tokens.refresh_token) {
    await User.findByIdAndUpdate(req.user.id, {
      googleRefreshToken: tokens.refresh_token
    });
  }

  res.send("Google Calendar connected successfully");
});

export default router;
