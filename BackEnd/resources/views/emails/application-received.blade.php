<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Received</title>
    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background-color: #0f172a;
            color: #f1f5f9;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            padding: 20px;
        }
        .card {
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            text-align: center;
        }
        .logo {
            font-size: 24px;
            font-weight: 800;
            background: linear-gradient(to right, #38bdf8, #818cf8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 30px;
            display: inline-block;
            letter-spacing: -0.5px;
        }
        .badge {
            background: rgba(56, 189, 248, 0.1);
            color: #38bdf8;
            border: 1px solid rgba(56, 189, 248, 0.2);
            padding: 6px 16px;
            border-radius: 9999px;
            font-size: 13px;
            font-weight: 600;
            display: inline-block;
            margin-bottom: 20px;
        }
        h1 {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 10px;
            color: #ffffff;
            letter-spacing: -0.5px;
        }
        p {
            font-size: 16px;
            line-height: 1.6;
            color: #94a3b8;
            margin-bottom: 24px;
        }
        .details-box {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 30px;
            text-align: left;
        }
        .details-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            font-size: 14px;
        }
        .details-row:last-child {
            border-bottom: none;
        }
        .details-label {
            color: #64748b;
            font-weight: 500;
        }
        .details-value {
            color: #e2e8f0;
            font-weight: 600;
        }
        .footer {
            margin-top: 40px;
            font-size: 12px;
            color: #475569;
            text-align: center;
        }
        .footer a {
            color: #6366f1;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="logo">Huma HR</div>
            <div>
                <span class="badge">Application Received</span>
            </div>
            <h1>Thank you for applying!</h1>
            <p>Hi {{ $applicantName }}, we have successfully received your application. Our recruitment team is currently reviewing your resume against the position requirements.</p>
            
            <div class="details-box">
                <div class="details-row">
                    <span class="details-label">Position Applied</span>
                    <span class="details-value">{{ $jobTitle }}</span>
                </div>
                <div class="details-row">
                    <span class="details-label">Date Submitted</span>
                    <span class="details-value">{{ $submittedAt }}</span>
                </div>
                <div class="details-row">
                    <span class="details-label">Status</span>
                    <span class="details-value" style="color: #38bdf8;">Under Review</span>
                </div>
            </div>

            <p style="font-size: 14px; margin-bottom: 0;">We appreciate your patience. We will keep you updated as your application progresses through our stages.</p>
        </div>
        <div class="footer">
            © {{ date('Y') }} Huma HR. All rights reserved.<br>
            This is an automated notification. Please do not reply directly to this email.
        </div>
    </div>
</body>
</html>
