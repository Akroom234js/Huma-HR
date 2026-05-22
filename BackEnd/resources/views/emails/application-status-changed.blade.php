@php
    $accentColor = '#6366f1'; // Default
    $badgeText = 'Application Update';
    
    if ($currentStatus === 'shortlisted') {
        $accentColor = '#10b981';
        $badgeText = 'Shortlisted';
    } elseif ($currentStatus === 'interviewing') {
        $accentColor = '#3b82f6';
        $badgeText = 'Interview Scheduled';
    } elseif ($currentStatus === 'offered') {
        $accentColor = '#a855f7';
        $badgeText = 'Job Offer Extended';
    } elseif ($currentStatus === 'hired') {
        $accentColor = '#14b8a6';
        $badgeText = 'Officially Hired';
    } elseif ($currentStatus === 'rejected') {
        $accentColor = '#f43f5e';
        $badgeText = 'Status Update';
    }
@endphp
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Status Update</title>
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
            background: {{ $accentColor }}15;
            color: {{ $accentColor }};
            border: 1px solid {{ $accentColor }}30;
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
        .feedback-box {
            background: rgba(255, 255, 255, 0.02);
            border-left: 4px solid {{ $accentColor }};
            border-radius: 4px 12px 12px 4px;
            padding: 16px 20px;
            margin: 20px 0;
            text-align: left;
        }
        .feedback-title {
            font-size: 14px;
            font-weight: 700;
            color: {{ $accentColor }};
            margin-bottom: 6px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .feedback-content {
            font-size: 14px;
            line-height: 1.5;
            color: #cbd5e1;
        }
        .footer {
            margin-top: 40px;
            font-size: 12px;
            color: #475569;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="logo">Huma HR</div>
            <div>
                <span class="badge">{{ $badgeText }}</span>
            </div>
            <h1>Application Status Update</h1>
            <p>Hi {{ $applicantName }},</p>
            <p>{{ $statusMessage }}</p>
            
            <div class="details-box">
                <div class="details-row">
                    <span class="details-label">Position</span>
                    <span class="details-value">{{ $jobTitle }}</span>
                </div>
                <div class="details-row">
                    <span class="details-label">Current Stage</span>
                    <span class="details-value" style="color: {{ $accentColor }}; text-transform: capitalize;">{{ $currentStatus }}</span>
                </div>
            </div>

            @if($showFeedback && !empty($feedback))
                <div class="feedback-box">
                    <div class="feedback-title">Evaluation Feedback</div>
                    <div class="feedback-content">{{ $feedback }}</div>
                </div>
            @endif

            <p style="font-size: 14px; margin-bottom: 0; color: #64748b;">If you have any questions, feel free to reach out to our HR department.</p>
        </div>
        <div class="footer">
            © {{ date('Y') }} Huma HR. All rights reserved.<br>
            This is an automated notification. Please do not reply directly to this email.
        </div>
    </div>
</body>
</html>
