const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5000;
const HOST = '0.0.0.0';

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Drug Management System - SPFx</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #f3f2f1;
      color: #323130;
      min-height: 100vh;
    }
    header {
      background: #0078d4;
      color: white;
      padding: 16px 32px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    header .logo {
      width: 40px;
      height: 40px;
      background: white;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
    }
    header h1 { font-size: 22px; font-weight: 600; }
    header p { font-size: 13px; opacity: 0.85; margin-top: 2px; }
    .container { max-width: 1100px; margin: 40px auto; padding: 0 24px; }
    .banner {
      background: white;
      border-radius: 8px;
      padding: 32px 40px;
      margin-bottom: 28px;
      border-left: 4px solid #0078d4;
      box-shadow: 0 1px 4px rgba(0,0,0,0.1);
    }
    .banner h2 { font-size: 20px; color: #0078d4; margin-bottom: 10px; }
    .banner p { color: #605e5c; line-height: 1.6; font-size: 14px; }
    .badge {
      display: inline-block;
      background: #deecf9;
      color: #0078d4;
      border-radius: 4px;
      padding: 2px 10px;
      font-size: 12px;
      font-weight: 600;
      margin-right: 8px;
      margin-top: 12px;
    }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 28px; }
    @media (max-width: 700px) { .grid { grid-template-columns: 1fr; } }
    .card {
      background: white;
      border-radius: 8px;
      padding: 24px 28px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    }
    .card h3 {
      font-size: 16px;
      color: #0078d4;
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .card h3 .icon { font-size: 20px; }
    .card ul { list-style: none; padding: 0; }
    .card ul li {
      padding: 6px 0;
      border-bottom: 1px solid #f3f2f1;
      font-size: 13px;
      color: #605e5c;
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }
    .card ul li:last-child { border-bottom: none; }
    .card ul li::before { content: "•"; color: #0078d4; font-weight: bold; flex-shrink: 0; }
    .tech-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; }
    .tech-item {
      background: #f3f6fb;
      border: 1px solid #deecf9;
      border-radius: 6px;
      padding: 12px;
      text-align: center;
      font-size: 12px;
      color: #323130;
    }
    .tech-item .tech-icon { font-size: 22px; margin-bottom: 6px; }
    .tech-item strong { display: block; font-size: 13px; margin-bottom: 2px; }
    .info-bar {
      background: #fff4ce;
      border: 1px solid #f8d267;
      border-radius: 6px;
      padding: 16px 20px;
      font-size: 13px;
      color: #603b00;
      margin-bottom: 28px;
      display: flex;
      gap: 10px;
      align-items: flex-start;
    }
    .info-bar .icon { font-size: 18px; flex-shrink: 0; }
    footer {
      text-align: center;
      padding: 24px;
      color: #a19f9d;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <header>
    <div class="logo">💊</div>
    <div>
      <h1>Drug Management System</h1>
      <p>SharePoint Framework (SPFx) v1.20.0 &nbsp;|&nbsp; Microsoft 365</p>
    </div>
  </header>

  <div class="container">
    <div class="info-bar">
      <span class="icon">ℹ️</span>
      <div>
        <strong>Replit Development Preview</strong><br>
        This SPFx web part is designed to run inside a Microsoft SharePoint / Microsoft 365 environment. It requires SharePoint APIs and cannot be run standalone. Use this preview to explore the project structure and codebase. To run the web part, deploy it to a Microsoft 365 tenant using <code>gulp bundle --ship</code> and <code>gulp package-solution --ship</code>.
      </div>
    </div>

    <div class="banner">
      <h2>Project Summary</h2>
      <p>
        The Drug Management System is a SharePoint Framework web part built for pharmaceutical organizations to manage drug documentation, review workflows, and regulatory compliance. It supports multiple user roles including Authors, Reviewers, Approvers, and Administrators — each with dedicated views and workflow steps.
      </p>
      <div>
        <span class="badge">SPFx 1.20.0</span>
        <span class="badge">React 17</span>
        <span class="badge">Fluent UI v8</span>
        <span class="badge">PnP.js</span>
        <span class="badge">Jotai</span>
        <span class="badge">TypeScript</span>
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <h3><span class="icon">👥</span> User Roles</h3>
        <ul>
          <li>Administrator — system configuration and user management</li>
          <li>Author — create and submit drug documentation</li>
          <li>Reviewer — review and provide feedback on submissions</li>
          <li>Approver — approve or reject reviewed documents</li>
        </ul>
      </div>
      <div class="card">
        <h3><span class="icon">⚙️</span> Key Features</h3>
        <ul>
          <li>Document lifecycle management with approval workflows</li>
          <li>Role-based access control via SharePoint permissions</li>
          <li>Excel import/export (xlsx, exceljs)</li>
          <li>Interactive data grids and charts (Recharts, ECharts)</li>
          <li>E2E test suite with Playwright</li>
          <li>PDF and Word document generation</li>
        </ul>
      </div>
      <div class="card">
        <h3><span class="icon">📁</span> Project Structure</h3>
        <ul>
          <li><code>src/webparts/drugManagementSystem/</code> — main source</li>
          <li><code>components/Common/</code> — shared UI components</li>
          <li><code>components/Custom/</code> — role-specific views</li>
          <li><code>services/</code> — SharePoint data provider layer</li>
          <li><code>jotai/</code> — global state atoms</li>
          <li><code>e2e/ &amp; tests/</code> — Playwright test suites</li>
        </ul>
      </div>
      <div class="card">
        <h3><span class="icon">🚀</span> Deployment Steps</h3>
        <ul>
          <li>Run <code>npm install</code> to install dependencies</li>
          <li>Run <code>gulp bundle --ship</code> for production bundle</li>
          <li>Run <code>gulp package-solution --ship</code> to create .sppkg</li>
          <li>Upload .sppkg to SharePoint App Catalog</li>
          <li>Add the web part to a SharePoint page</li>
        </ul>
      </div>
    </div>

    <div class="card" style="margin-bottom: 28px;">
      <h3><span class="icon">🛠️</span> Technology Stack</h3>
      <div class="tech-grid" style="margin-top: 8px;">
        <div class="tech-item"><div class="tech-icon">⚛️</div><strong>React 17</strong>UI framework</div>
        <div class="tech-item"><div class="tech-icon">🔷</div><strong>TypeScript 4.7</strong>Language</div>
        <div class="tech-item"><div class="tech-icon">🎨</div><strong>Fluent UI v8</strong>Design system</div>
        <div class="tech-item"><div class="tech-icon">📡</div><strong>PnP.js v3</strong>SharePoint API</div>
        <div class="tech-item"><div class="tech-icon">🔬</div><strong>Jotai</strong>State management</div>
        <div class="tech-item"><div class="tech-icon">📊</div><strong>Recharts</strong>Data visualization</div>
        <div class="tech-item"><div class="tech-icon">📋</div><strong>ExcelJS</strong>Spreadsheet export</div>
        <div class="tech-item"><div class="tech-icon">🧪</div><strong>Playwright</strong>E2E testing</div>
        <div class="tech-item"><div class="tech-icon">⚡</div><strong>Gulp + Webpack</strong>Build pipeline</div>
        <div class="tech-item"><div class="tech-icon">🔵</div><strong>SPFx 1.20</strong>Framework</div>
      </div>
    </div>
  </div>

  <footer>Drug Management System &mdash; SharePoint Framework Web Part &mdash; Replit Preview</footer>
</body>
</html>`;

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/html',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(html);
});

server.listen(PORT, HOST, () => {
  console.log('Drug Management System preview running at http://' + HOST + ':' + PORT);
});
