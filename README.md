\# 🛡️ Security Log Analyzer with Intrusion Detection



A web-based security monitoring application built with Django REST Framework and React to analyze system logs, identify suspicious activities, detect potential security threats, and manage security incidents.



The application provides a centralized dashboard for monitoring log activity, reviewing detected threats, managing alerts, and generating reports.



\## 📌 Table of Contents



\- Overview

\- Key Features

\- Threat Detection

\- Technology Stack

\- Project Structure

\- Prerequisites

\- Installation and Setup

\- Running the Application

\- Usage

\- Security Considerations

\- Future Enhancements

\- Author



\## 📖 Overview



The Security Log Analyzer is designed to help administrators identify potentially malicious activity by analyzing application and security logs.



It combines automated log monitoring, rule-based threat detection, alert generation, incident management, and reporting in a web-based interface.



The project demonstrates the integration of backend development, frontend development, database management, and cybersecurity concepts.



\## ✨ Key Features



\### 📊 Security Dashboard

\- Centralized security monitoring dashboard.

\- Summary statistics for logs, threats, and alerts.

\- Visualizations for log activity and threat severity.

\- Overview of suspicious activity.



\### 📁 Log Management

\- Upload supported log files.

\- Parse and process log entries.

\- View and search recorded log activity.

\- Monitor log files for new entries.



\### 🚨 Threat Detection

\- Rule-based detection of suspicious activity.

\- Detection of repeated failed login attempts.

\- Identification of suspicious HTTP requests.

\- Detection of potential SQL injection attempts.

\- Identification of possible port-scanning activity.



\### 🔔 Alert Management

\- Generate alerts when configured detection rules are triggered.

\- Assign severity levels to detected threats.

\- Send email notifications for supported alert events.



\### 🗂️ Incident Management

\- Create incidents associated with security alerts.

\- Track incidents and their status.

\- Review security events for investigation.



\### 📄 Reporting

\- Generate downloadable security reports.

\- Export supported report data to PDF and CSV formats.



\### 🔐 Authentication

\- User authentication.

\- Protected application pages and API endpoints, where configured.



\## 🕵️ Threat Detection Rules



The application implements rule-based detection for several categories of suspicious activity.



| Threat Type | Detection Logic | Severity |

|---|---|---|

| Brute-force attack | Five or more failed login attempts from the same IP address within 60 seconds | High |

| SQL injection attempt | Suspicious SQL-related patterns in monitored request messages | Critical |

| Unauthorized access | Requests targeting configured sensitive paths, such as `/admin`, `/.env`, and `/phpmyadmin` | High |

| Port scan | Attempts involving five or more different ports from the same IP address within 60 seconds | High |



Detection results depend on the configured rules and the log data being analyzed. These rules provide indicators of potentially malicious behavior and do not guarantee that every attack will be detected.



\## 🧰 Technology Stack



\### Backend

\- Python

\- Django

\- Django REST Framework

\- MariaDB / MySQL

\- Pandas

\- Matplotlib

\- Watchdog



\### Frontend

\- React

\- JavaScript

\- Vite

\- HTML

\- CSS



\### Development Tools

\- Git and GitHub

\- Visual Studio Code

\- XAMPP / MariaDB tools, as applicable to the local environment



\## 📂 Project Structure



```text

security-log-analyzer/

│

├── backend/

│   ├── accounts/

│   ├── alerts/

│   │   └── services/

│   ├── config/

│   ├── dashboard/

│   │   └── services/

│   ├── detection/

│   │   └── services/

│   ├── incidents/

│   │   └── services/

│   ├── logs/

│   │   ├── management/

│   │   └── services/

│   ├── reports/

│   │   └── services/

│   ├── manage.py

│   └── requirements.txt

│

├── frontend/

│   ├── public/

│   ├── src/

│   │   ├── components/

│   │   ├── context/

│   │   ├── hooks/

│   │   ├── layouts/

│   │   ├── pages/

│   │   ├── services/

│   │   ├── styles/

│   │   └── utils/

│   ├── package.json

│   └── package-lock.json

│

├── .gitignore

└── README.md

