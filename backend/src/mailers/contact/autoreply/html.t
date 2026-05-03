<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Thanks for reaching out</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; padding: 0; background: #f0f0f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; }
  .outer { padding: 40px 16px; }
  .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 40px rgba(0,0,0,0.10); }
  .header { background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); padding: 40px 44px 36px; }
  .header-emoji { font-size: 36px; line-height: 1; margin-bottom: 14px; }
  .header h1 { margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.3; }
  .body { padding: 36px 44px; }
  .body p { margin: 0 0 18px; color: #374151; font-size: 15.5px; line-height: 1.7; }
  .body p:last-child { margin-bottom: 0; }
  .cta-block { margin: 28px 0; background: #f5f3ff; border: 1px solid #e9d5ff; border-radius: 12px; padding: 22px 26px; }
  .cta-block p { margin: 0 0 14px; color: #4b5563; font-size: 14.5px; line-height: 1.6; }
  .cta-block p:last-child { margin: 0; }
  .cta-btn { display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; letter-spacing: 0.01em; }
  .signature { margin-top: 28px; padding-top: 24px; border-top: 1px solid #f3f4f6; }
  .signature p { margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6; }
  .signature strong { color: #111827; font-size: 15px; }
  .footer { background: #f9fafb; padding: 18px 44px; border-top: 1px solid #f3f4f6; }
  .footer p { margin: 0; color: #9ca3af; font-size: 12px; }
  .footer a { color: #7c3aed; text-decoration: none; }
</style>
</head>
<body>
<div class="outer">
  <div class="card">
    <div class="header">
      <div class="header-emoji">👋</div>
      <h1>Hey {{name}}, thanks for reaching out!</h1>
    </div>
    <div class="body">
      <p>I've received your message and will get back to you within a day or two. 😊</p>
      <div class="cta-block">
        <p>🌐 In the meantime, feel free to explore my work and projects:</p>
        <a class="cta-btn" href="{{domain}}">Visit my website →</a>
      </div>
      <div class="signature">
        <p><strong>Benedikt Hollerauer</strong><br />Software Engineer</p>
      </div>
    </div>
    <div class="footer">
      <p><a href="{{domain}}">benedikt-hollerauer.com</a></p>
    </div>
  </div>
</div>
</body>
</html>
