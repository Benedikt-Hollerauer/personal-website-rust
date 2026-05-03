<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Thanks for reaching out</title>
<style>
  body { margin: 0; padding: 0; background: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  .wrap { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.07); }
  .header { background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); padding: 36px 40px; }
  .header h1 { margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: -0.01em; }
  .body { padding: 32px 40px; color: #374151; font-size: 15px; line-height: 1.65; }
  .body p { margin: 0 0 16px; }
  .footer { padding: 20px 40px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px; }
  .footer a { color: #7c3aed; text-decoration: none; }
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <h1>Thanks for reaching out, {{name}}!</h1>
  </div>
  <div class="body">
    <p>I've received your message and will get back to you within a day or two.</p>
    <p>Best,<br /><strong>Benedikt</strong></p>
  </div>
  <div class="footer">
    <a href="{{domain}}">benedikt-hollerauer.com</a>
  </div>
</div>
</body>
</html>
