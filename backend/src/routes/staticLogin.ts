import { Router } from "express"

const router = Router()

router.get("/", (req, res) => {
  return res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Auth Test</title>
</head>
<body>
  <h2>Auth Test Form</h2>

  <form action="http://localhost:3000/auth/login" method="POST">
    <div>
      <label>Email</label><br />
      <input type="email" name="email" required />
    </div>

    <br />

    <div>
      <label>Password</label><br />
      <input type="password" name="password" required />
    </div>

    <br />

    <button type="submit">Submit</button>
  </form>
</body>
</html>
`)
})

export default router