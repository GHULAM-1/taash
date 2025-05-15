import { Router, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

import User from "@/models/User";
import { jwtSecret } from "@/config";

// Ensure necessary environment variables are present
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
const resetUrlBase = process.env.RESET_URL;

if (!emailUser || !emailPass) {
  throw new Error("EMAIL_USER and EMAIL_PASS must be set in the environment");
}
if (!resetUrlBase) {
  throw new Error("RESET_URL must be set in the environment");
}

// Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

// Send verification email with JWT token
export async function sendVerificationEmail(
  email: string,
  userId: Object
): Promise<void> {
  const token = jwt.sign({ id: userId }, jwtSecret, { expiresIn: "15m" });
  const verifyUrl = `http://${resetUrlBase}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: emailUser,
    to: email,
    subject: "Verify Your Email",
    html: `Click <a href="${verifyUrl}">here</a> to verify your email. This link expires in 15 minutes.`,
  });
}

// Router to handle verification link
const router = Router();

// GET /verify-email?token=...
router.get(
  "/verify-email",
  async (
    req: Request<{}, any, any, { token?: string }>,
    res: Response,
    next: NextFunction
  ) => {
    const { token } = req.query;
    if (!token) {
      res.status(400).send("Token is required");
      return;
    }

    try {
      const decoded = jwt.verify(token, jwtSecret) as { id: string };
      const user = await User.findById(decoded.id);

      if (!user) {
        res.status(404).send("User not found");
        return;
      }
      if (user.verified) {
        res.send("Email already verified");
        return;
      }

      user.verified = true;
      await user.save();

      res.send(
        "Email verified successfully. You can now open the app and log in."
      );
    } catch (err) {
      res.status(400).send("Invalid or expired token");
    }
  }
);

export default router;
