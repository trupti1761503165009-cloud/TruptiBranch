const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5000;
const HOST = '0.0.0.0';

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

const readCss = (p) => { try { return fs.readFileSync(path.join(__dirname, p), 'utf8'); } catch(e) { return ''; } };
const appCss      = readCss('src/webparts/drugManagementSystem/components/Custom/styles/app.css');
const stylesCss   = readCss('src/webparts/drugManagementSystem/assets/css/styles.css');
const uiCss       = readCss('src/webparts/drugManagementSystem/components/Custom/styles/ui-professional.css');
const enhancedCss = readCss('src/webparts/drugManagementSystem/components/Custom/styles/enhanced-styles.css');

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Drug Management System</title>
  <link rel="stylesheet" href="/app.css">
  <link rel="stylesheet" href="/styles.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
  <style>
    /* ── TOAST ── */
    .toast-host { position:fixed; top:70px; right:20px; z-index:9999; display:flex; flex-direction:column; gap:8px; }
    .toast-msg  { background:#fff; border-radius:6px; padding:12px 18px; box-shadow:0 4px 16px rgba(0,0,0,.18);
                  display:flex; align-items:center; gap:10px; min-width:280px; font-size:14px;
                  animation:slideIn .3s ease; border-left:4px solid #1E88E5; }
    .toast-msg.success { border-left-color:#4CAF50; }
    .toast-msg.error   { border-left-color:#F44336; }
    @keyframes slideIn { from{transform:translateX(100%);opacity:0} to{transform:translateX(0);opacity:1} }
    /* ── MODAL ── */
    .modal-backdrop { position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:2000;display:flex;align-items:center;justify-content:center; }
    .modal-box { background:#fff;border-radius:8px;padding:28px 32px;min-width:460px;max-width:620px;
                 box-shadow:0 8px 40px rgba(0,0,0,.18);max-height:85vh;overflow-y:auto; }
    .modal-box h2 { font-size:18px;margin-bottom:20px;color:#1B2A4A; }
    .modal-form-label { font-size:13px;color:#555;display:block;margin-bottom:4px;margin-top:14px;font-weight:500; }
    .modal-form-input, .modal-form-select, .modal-form-textarea {
      width:100%;padding:9px 12px;border:1px solid #d0d0d0;border-radius:6px;font-size:14px;box-sizing:border-box;outline:none; }
    .modal-form-input:focus, .modal-form-select:focus { border-color:#1E88E5; }
    .modal-actions { display:flex;gap:10px;justify-content:flex-end;margin-top:22px; }
    /* ── CONFIRM DIALOG ── */
    .confirm-box { background:#fff;border-radius:8px;padding:28px 32px;min-width:380px;
                   box-shadow:0 8px 40px rgba(0,0,0,.18); }
    .confirm-box h3 { color:#1B2A4A;margin-bottom:10px; }
    .confirm-box p  { color:#555;font-size:14px;margin-bottom:22px; }
    /* ── FILTER ROW ── */
    .filter-row { display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;align-items:center; }
    .filter-row-4 { display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:12px;align-items:center; }
    .dms-tab-bar { display:flex;border-bottom:2px solid #e0e0e0;margin-bottom:16px;gap:0; }
    .dms-tab-btn { padding:10px 28px;border:none;background:none;cursor:pointer;font-size:14px;font-weight:400;color:#666;border-bottom:2px solid transparent;margin-bottom:-2px;transition:all .15s; }
    .dms-tab-btn.active { color:#1300a6;font-weight:600;border-bottom-color:#1300a6; }
    .filter-select { padding:8px 12px;border:1px solid #d0d0d0;border-radius:6px;font-size:13px;outline:none;min-width:160px;background:#fff;width:100%; }
    .filter-select:focus { border-color:#1E88E5; }
    /* ── WHITE CARD SECTION ── */
    .white-card-section { background:#fff;border-radius:5px;box-shadow:0 4px 10px rgba(166,166,166,.55);padding:16px 20px;margin-bottom:16px; }
    /* ── UPLOAD TEMPLATE FORM ── */
    .upload-form-overlay { width:100%; }
    .upload-form-card { background:#fff;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,.1);padding:24px; }
    .upload-form-header { display:flex;justify-content:space-between;align-items:center;margin-bottom:12px; }
    .form-grid-4 { display:grid;grid-template-columns:repeat(4,1fr);gap:16px; }
    @media(max-width:768px){.form-grid-4{grid-template-columns:1fr 1fr;}}
    .fg { display:flex;flex-direction:column;gap:4px; }
    .fl { font-size:13px;font-weight:600;color:#444; }
    .fi { padding:8px 10px;border:1px solid #d0d0d0;border-radius:5px;font-size:13px;outline:none;background:#fff; }
    .fi:focus { border-color:#1300a6; }
    .req { color:#c0392b; }
    .btn-sm { padding:6px 14px;font-size:12px; }
    .mainTitle { font-size:22px;font-weight:700;color:#1B2A4A;margin:0 0 16px; }
    /* ── BREADCRUMB OVERRIDE ── */
    .dms-breadcrumb { margin-bottom:16px; }
    /* ── GRID TOOLBAR ── */
    .grid-toolbar { display:flex;justify-content:space-between;align-items:center;padding:14px 20px;border-bottom:1px solid #f0f0f0;background:#fff; }
    .grid-toolbar-left { display:flex;gap:8px;align-items:center; }
    .grid-toolbar-right { display:flex;gap:8px;align-items:center; }
    .grid-search { display:flex;align-items:center;gap:8px;border:1px solid #e0e0e0;border-radius:6px;padding:7px 12px;background:#fff;width:260px; }
    .grid-search input { border:none;outline:none;font-size:13px;flex:1; }
    /* ── ACTION ICON BUTTONS ── */
    .act-btn { background:none;border:none;cursor:pointer;padding:5px 8px;border-radius:4px;font-size:15px;transition:all .15s; }
    .act-btn.view   { color:#1E88E5; } .act-btn.view:hover   { background:#E3F2FD; }
    .act-btn.edit   { color:#2E7D32; } .act-btn.edit:hover   { background:#E8F5E9; }
    .act-btn.del    { color:#D32F2F; } .act-btn.del:hover    { background:#FFEBEE; }
    .act-btn.ref    { color:#EF6C00; } .act-btn.ref:hover    { background:#FFF3E0; }
    .act-btn.upload { color:#6A1B9A; } .act-btn.upload:hover { background:#F3E5F5; }
    /* ── TABLE ── */
    .dms-table { width:100%;border-collapse:collapse; }
    .dms-table thead { background:#fafafa; }
    .dms-table th { padding:11px 16px;text-align:left;font-size:12px;font-weight:600;color:#666;text-transform:uppercase;letter-spacing:.5px;border-bottom:2px solid #e0e0e0; }
    .dms-table td { padding:12px 16px;font-size:14px;color:#333;border-bottom:1px solid #f5f5f5;vertical-align:middle; }
    .dms-table tr:hover td { background:#fafafa; }
    .dms-table input[type=checkbox] { width:15px;height:15px;cursor:pointer; }
    /* ── MAPPING TYPE BADGES ── */
    .map-badge { display:inline-block;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:600; }
    .map-ectd  { background:#E8EAF6;color:#3949AB; }
    .map-gmp   { background:#FFF3E0;color:#E65100; }
    .map-tmf   { background:#E0F2F1;color:#00796B; }
    .map-none  { background:#F5F5F5;color:#666; }
    /* ── STATUS BADGES ── */
    .sb { display:inline-block;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:500; }
    .sb-active   { background:#E3F2FD;color:#1E88E5; }
    .sb-inactive { background:#F5F5F5;color:#9E9E9E; }
    .sb-draft    { background:#EEEEEE;color:#616161; }
    .sb-review   { background:#FFF3E0;color:#F57C00; }
    .sb-approved { background:#E8F5E9;color:#43A047; }
    .sb-rejected { background:#FFEBEE;color:#D32F2F; }
    .sb-pending  { background:#E3F2FD;color:#1565C0; }
    .sb-signed   { background:#F3E5F5;color:#7B1FA2; }
    /* ── FILE ICON ── */
    .file-icon { width:28px;height:28px;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0; }
    .fi-docx { background:#EBF2FC;color:#2B579A; }
    .fi-xlsx { background:#E8F5E9;color:#217346; }
    .fi-pdf  { background:#FFEBEE;color:#D32F2F; }
    .fi-pptx { background:#FFF3E0;color:#D24726; }
    .fi-gen  { background:#F5F5F5;color:#666; }
    /* ── PANEL ── */
    .dms-panel-overlay { position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:1500; }
    .dms-panel { position:fixed;top:0;right:0;width:600px;height:100vh;background:#fff;z-index:1501;
                 display:flex;flex-direction:column;box-shadow:-4px 0 24px rgba(0,0,0,.15); }
    .dms-panel-header { padding:20px 24px;border-bottom:1px solid #e0e0e0;display:flex;justify-content:space-between;align-items:center; }
    .dms-panel-header h2 { font-size:17px;color:#1B2A4A;margin:0; }
    .dms-panel-close { background:none;border:none;font-size:20px;cursor:pointer;color:#666;padding:4px 8px;border-radius:4px; }
    .dms-panel-close:hover { background:#f0f0f0; }
    .dms-panel-body { flex:1;overflow-y:auto;padding:24px; }
    .dms-panel-actions { padding:16px 24px;border-top:1px solid #e0e0e0;display:flex;gap:10px; }
    .detail-grid { display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px; }
    .detail-item .dl { font-size:12px;color:#888;margin-bottom:4px; }
    .detail-item .dv { font-size:14px;color:#333;font-weight:500; }
    /* ── ROLE TAG ── */
    .role-tag { display:inline-block;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:600; }
    .role-admin    { background:#1B2A4A;color:#fff; }
    .role-author   { background:#2E7D32;color:#fff; }
    .role-reviewer { background:#E65100;color:#fff; }
    .role-approver { background:#4527A0;color:#fff; }
    /* ── DRUG PHASE ── */
    .phase-tag { display:inline-block;padding:3px 10px;border-radius:4px;font-size:12px;border:1px solid #d0d0d0;color:#555; }
    /* ── CTD TREE ── */
    .ctd-layout { display:grid;grid-template-columns:280px 1fr;gap:16px; }
    .ctd-tree { background:#fff;border-radius:8px;box-shadow:0 1px 4px rgba(0,0,0,.08);padding:16px;height:calc(100vh - 280px);overflow-y:auto; }
    .ctd-tree-item { padding:8px 12px;cursor:pointer;border-radius:6px;font-size:14px;display:flex;align-items:center;gap:8px;transition:all .15s; }
    .ctd-tree-item:hover { background:#f5f5f5; }
    .ctd-tree-item.active { background:#E3F2FD;color:#1E88E5;font-weight:500; }
    .ctd-tree-item.module { font-weight:600;color:#1B2A4A;font-size:13px;margin-top:4px; }
    /* ── EMPTY STATE ── */
    .empty-state { text-align:center;padding:60px 20px;color:#bbb; }
    .empty-state i { font-size:52px;margin-bottom:16px;display:block; }
    /* ── PAGINATION ── */
    .pagination { display:flex;justify-content:space-between;align-items:center;padding:12px 20px;border-top:1px solid #f0f0f0;font-size:13px;color:#666; }
    .pag-btns { display:flex;gap:6px; }
    .pag-btn { padding:5px 12px;border:1px solid #e0e0e0;border-radius:4px;background:#fff;cursor:pointer;font-size:13px;color:#444; }
    .pag-btn:hover { background:#f5f5f5; }
    .pag-btn.active { background:#1E88E5;color:#fff;border-color:#1E88E5; }
    /* ── MISC ── */
    .mt-8  { margin-top:8px; }
    .mt-16 { margin-top:16px; }
    .dfs { display:flex;gap:8px;align-items:center; }
    .fw500 { font-weight:500; }
    .pageContainer { padding:0; }
    .boxCard-demo { background:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.08);overflow:hidden; }
  </style>
</head>
<body>
<div id="root"></div>
<div id="toasts" class="toast-host"></div>
<script crossorigin src="https://unpkg.com/react@17/umd/react.development.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
<script>
const { useState, useEffect, useCallback, useMemo, useRef } = React;

/* ===================================================
   MOCK DATA
=================================================== */
const DOCS = [
  { id:1, name:'Aspirin_Module2_Clinical_Study.docx', ext:'docx', category:'Clinical', status:'Approved', date:'2026-03-10', author:'John Smith', drug:'Aspirin', ver:'2.1', approver:'Emily Wilson' },
  { id:2, name:'Paracetamol_Nonclinical_Safety.docx',  ext:'docx', category:'Nonclinical', status:'Pending Approval', date:'2026-03-08', author:'Sarah Johnson', drug:'Paracetamol', ver:'1.0', approver:'Emily Wilson' },
  { id:3, name:'Ibuprofen_Quality_Summary.docx',        ext:'docx', category:'Quality', status:'Draft', date:'2026-03-07', author:'John Smith', drug:'Ibuprofen', ver:'1.2', approver:'Mike Davis' },
  { id:4, name:'Metformin_CTD_Module3.docx',            ext:'docx', category:'Quality', status:'Pending Approval', date:'2026-03-05', author:'Sarah Johnson', drug:'Metformin', ver:'3.0', approver:'Emily Wilson' },
  { id:5, name:'Amoxicillin_Module1_Admin.docx',        ext:'docx', category:'Administrative', status:'Approved', date:'2026-03-04', author:'Tom Brown', drug:'Amoxicillin', ver:'1.5', approver:'Emily Wilson' },
  { id:6, name:'Lisinopril_Efficacy_Report.docx',       ext:'docx', category:'Clinical', status:'Draft', date:'2026-03-02', author:'John Smith', drug:'Lisinopril', ver:'1.0', approver:'Mike Davis' },
  { id:7, name:'Omeprazole_Safety_Review.docx',         ext:'docx', category:'Nonclinical', status:'Pending Approval', date:'2026-02-28', author:'Sarah Johnson', drug:'Omeprazole', ver:'2.0', approver:'Emily Wilson' },
  { id:8, name:'Atorvastatin_Label_Insert.pdf',         ext:'pdf',  category:'Administrative', status:'Signed', date:'2026-02-25', author:'John Smith', drug:'Atorvastatin', ver:'4.1', approver:'Emily Wilson' },
];
const ROLE_USER = { Admin:'John Smith', Author:'Sarah Johnson', Reviewer:'Mike Davis', Approver:'Emily Wilson', HR:'Tom Brown' };
const TEMPLATES = [
  { id:1, name:'Clinical Study Report Template.docx',  ext:'docx', mappingType:'eCTD', ctdFolder:'Module 5', section:'5.3 Clinical Study Reports', country:'Global', ver:'2.0', status:'Active', date:'2026-01-15' },
  { id:2, name:'Nonclinical Overview Template.docx',   ext:'docx', mappingType:'eCTD', ctdFolder:'Module 4', section:'4.2 Study Reports',             country:'Global', ver:'1.5', status:'Active', date:'2026-01-10' },
  { id:3, name:'Quality Summary Template.docx',         ext:'docx', mappingType:'GMP',  model:'QA Document',  section:'-',                              country:'EU',     ver:'1.0', status:'Active', date:'2025-12-20' },
  { id:4, name:'Investigator Brochure.docx',            ext:'docx', mappingType:'eCTD', ctdFolder:'Module 1', section:'1.2 IB',                          country:'US',     ver:'3.0', status:'Active', date:'2025-11-30' },
  { id:5, name:'GMP Batch Record Template.xlsx',        ext:'xlsx', mappingType:'GMP',  model:'Batch Record', section:'-',                              country:'US',     ver:'1.2', status:'Inactive', date:'2025-10-05' },
  { id:6, name:'TMF Index Template.docx',               ext:'docx', mappingType:'TMF',  tmfFolder:'Zone 1',   section:'-',                              country:'Global', ver:'1.0', status:'Active', date:'2025-09-18' },
  { id:7, name:'Document1.docx',                         ext:'docx', mappingType:'eCTD', ctdFolder:'1.1.1',    section:'1.1.1',                           country:'Canada',  ver:'1.0', status:'Active', date:'2026-02-13' },
];
const CATEGORIES = [
  { id:1, name:'Administrative',          documentCategory:'Regulatory',  group:'Module 1', level:1, docs:12, status:'Active' },
  { id:2, name:'Clinical Study Report',   documentCategory:'Clinical',    group:'Module 5', level:1, docs:34, status:'Active' },
  { id:3, name:'Nonclinical Overview',    documentCategory:'Nonclinical', group:'Module 4', level:1, docs:18, status:'Active' },
  { id:4, name:'Quality Summary',         documentCategory:'Quality',     group:'Module 3', level:1, docs:27, status:'Active' },
  { id:5, name:'CTD Summaries',           documentCategory:'Regulatory',  group:'Module 2', level:2, docs:8,  status:'Active' },
  { id:6, name:'Archived Clinical Data',  documentCategory:'Clinical',    group:'Module 5', level:1, docs:4,  status:'Inactive' },
];
const DRUGS = [
  { id:1, name:'Aspirin',       generic:'Acetylsalicylic Acid', indication:'Pain, Fever, Inflammation', status:'Active', phase:'Marketed' },
  { id:2, name:'Paracetamol',   generic:'Acetaminophen',        indication:'Pain, Fever',               status:'Active', phase:'Marketed' },
  { id:3, name:'Ibuprofen',     generic:'Ibuprofen',            indication:'Pain, Inflammation',        status:'Active', phase:'Phase III' },
  { id:4, name:'Metformin',     generic:'Metformin HCl',        indication:'Type 2 Diabetes',           status:'Active', phase:'Marketed' },
  { id:5, name:'Lisinopril',    generic:'Lisinopril',           indication:'Hypertension, Heart Failure',status:'Active',phase:'Phase III' },
  { id:6, name:'Atorvastatin',  generic:'Atorvastatin Calcium', indication:'Hyperlipidemia',            status:'Inactive',phase:'Marketed' },
];
const USERS = [
  { id:1, name:'John Smith',   email:'john.smith@pharma.com',   role:'Admin',    status:'Active',   last:'2026-03-15' },
  { id:2, name:'Sarah Johnson',email:'sarah.j@pharma.com',      role:'Author',   status:'Active',   last:'2026-03-14' },
  { id:3, name:'Mike Davis',   email:'mike.davis@pharma.com',   role:'Reviewer', status:'Active',   last:'2026-03-13' },
  { id:4, name:'Emily Wilson', email:'emily.w@pharma.com',      role:'Approver', status:'Active',   last:'2026-03-12' },
  { id:5, name:'Tom Brown',    email:'tom.brown@pharma.com',    role:'Author',   status:'Inactive', last:'2026-03-01' },
  { id:6, name:'Anna Lee',     email:'anna.lee@pharma.com',     role:'Reviewer', status:'Active',   last:'2026-03-10' },
];
const CTD_TREE = [
  { id:'m1', label:'Module 1 – Administrative', isModule:true, docs:12 },
  { id:'m1-1', label:'1.1 Comprehensive Table of Contents',  isModule:false, parent:'m1', docs:2 },
  { id:'m1-2', label:'1.2 Investigator Brochure',            isModule:false, parent:'m1', docs:4 },
  { id:'m2', label:'Module 2 – Summaries', isModule:true, docs:8 },
  { id:'m2-1', label:'2.4 Nonclinical Overview',  isModule:false, parent:'m2', docs:3 },
  { id:'m2-2', label:'2.5 Clinical Overview',     isModule:false, parent:'m2', docs:5 },
  { id:'m3', label:'Module 3 – Quality', isModule:true, docs:27 },
  { id:'m3-1', label:'3.2.A Facilities & Equipment', isModule:false, parent:'m3', docs:7 },
  { id:'m3-2', label:'3.2.P Drug Product',           isModule:false, parent:'m3', docs:12 },
  { id:'m4', label:'Module 4 – Nonclinical', isModule:true, docs:18 },
  { id:'m4-1', label:'4.2.1 Pharmacology',  isModule:false, parent:'m4', docs:8 },
  { id:'m4-2', label:'4.2.2 Toxicology',    isModule:false, parent:'m4', docs:10 },
  { id:'m5', label:'Module 5 – Clinical', isModule:true, docs:34 },
  { id:'m5-1', label:'5.3.1 Study Reports',   isModule:false, parent:'m5', docs:22 },
  { id:'m5-2', label:'5.3.5 Reports of Efficacy', isModule:false, parent:'m5', docs:12 },
];

/* ===================================================
   HELPERS
=================================================== */
function showToast(msg, type='success') {
  const el = document.createElement('div');
  el.className = 'toast-msg ' + type;
  el.innerHTML = '<i class="fas fa-' + (type==='success'?'check-circle':'exclamation-circle') +
    '" style="color:' + (type==='success'?'#4CAF50':'#F44336') + '"></i><span>' + msg + '</span>';
  document.getElementById('toasts').appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

function fileIcon(ext) {
  if (ext==='docx'||ext==='doc') return { cls:'fi-docx', icon:'fas fa-file-word' };
  if (ext==='xlsx'||ext==='xls') return { cls:'fi-xlsx', icon:'fas fa-file-excel' };
  if (ext==='pdf')                return { cls:'fi-pdf',  icon:'fas fa-file-pdf' };
  if (ext==='pptx'||ext==='ppt') return { cls:'fi-pptx', icon:'fas fa-file-powerpoint' };
  return { cls:'fi-gen', icon:'fas fa-file' };
}

function StatusBadge({ status }) {
  const map = {
    'Active':'sb sb-active','Inactive':'sb sb-inactive','Draft':'sb sb-draft',
    'Under Review':'sb sb-review','Pending Approval':'sb sb-pending',
    'Approved':'sb sb-approved','Rejected':'sb sb-rejected','Signed':'sb sb-signed',
  };
  return React.createElement('span', { className: map[status] || 'sb sb-draft' }, status);
}

function MappingBadge({ type }) {
  const map = { eCTD:'map-badge map-ectd', GMP:'map-badge map-gmp', TMF:'map-badge map-tmf', None:'map-badge map-none' };
  return React.createElement('span', { className: map[type] || 'map-badge map-none' }, type || 'None');
}

function SummaryCard({ icon, title, value, subtitle, color }) {
  return React.createElement('div', { className: 'summary-card' },
    React.createElement('div', { className: 'summary-card__border summary-card__border--' + color }),
    React.createElement('div', { className: 'summary-card__content' },
      React.createElement('div', { className: 'summary-card__icon-wrapper summary-card__icon-wrapper--' + color },
        React.createElement('i', { className: icon + ' summary-card__icon' })
      ),
      React.createElement('div', { className: 'summary-card__info' },
        React.createElement('h3', { className: 'summary-card__count' }, value),
        React.createElement('p',  { className: 'summary-card__title' }, title),
        subtitle ? React.createElement('p', { className: 'summary-card__subtitle' }, subtitle) : null
      )
    )
  );
}

function Breadcrumb({ items }) {
  return React.createElement('nav', { className: 'dms-breadcrumb' },
    React.createElement('ol', { className: 'dms-breadcrumb__list' },
      items.map((it, i) =>
        React.createElement('li', { className: 'dms-breadcrumb__item', key: i },
          i > 0 ? React.createElement('span', { className: 'dms-breadcrumb__separator', style:{marginRight:6} }, '›') : null,
          React.createElement('span', {
            className: it.active ? 'dms-breadcrumb__text dms-breadcrumb__text--active' : 'dms-breadcrumb__link',
          }, it.label)
        )
      )
    )
  );
}

function GridToolbar({ search, onSearch, onAdd, onUpload, onRefresh, editBtns, addLabel }) {
  return React.createElement('div', { className: 'grid-toolbar' },
    React.createElement('div', { className: 'grid-toolbar-left' },
      React.createElement('div', { className: 'grid-search' },
        React.createElement('i', { className: 'fas fa-search', style:{color:'#999',fontSize:13} }),
        React.createElement('input', {
          placeholder:'Search...', value:search,
          onChange: e => onSearch(e.target.value)
        })
      ),
      editBtns
    ),
    React.createElement('div', { className: 'grid-toolbar-right' },
      onAdd && React.createElement('button', { className: 'btn btn-primary', onClick: onAdd },
        React.createElement('i', {className:'fas fa-plus', style:{marginRight:6}}), addLabel || 'Add'
      ),
      onUpload && React.createElement('button', { className: 'act-btn upload', title:'Excel Upload', onClick: onUpload },
        React.createElement('i', {className:'fas fa-file-excel'})
      ),
      onRefresh && React.createElement('button', { className: 'act-btn ref', title:'Refresh', onClick: onRefresh },
        React.createElement('i', {className:'fas fa-arrows-rotate'})
      )
    )
  );
}

function Pagination({ total, page, perPage, onChange }) {
  const pages = Math.ceil(total / perPage);
  const start = (page-1)*perPage+1, end = Math.min(page*perPage, total);
  return React.createElement('div', { className: 'pagination' },
    React.createElement('span', null, 'Showing ' + start + '–' + end + ' of ' + total),
    React.createElement('div', { className: 'pag-btns' },
      React.createElement('button', { className:'pag-btn', onClick:()=>onChange(Math.max(1,page-1)), disabled:page===1 },
        React.createElement('i',{className:'fas fa-chevron-left'})
      ),
      Array.from({length: Math.min(pages,5)}, (_,i) => i+1).map(p =>
        React.createElement('button', { key:p, className:'pag-btn'+(p===page?' active':''), onClick:()=>onChange(p) }, p)
      ),
      React.createElement('button', { className:'pag-btn', onClick:()=>onChange(Math.min(pages,page+1)), disabled:page===pages },
        React.createElement('i',{className:'fas fa-chevron-right'})
      )
    )
  );
}

/* ===================================================
   MODAL (Add / Edit / View / Confirm)
=================================================== */
function Modal({ title, onClose, children, footer }) {
  return React.createElement('div', { className: 'modal-backdrop', onClick: e => { if(e.target===e.currentTarget) onClose(); } },
    React.createElement('div', { className: 'modal-box' },
      React.createElement('div', { style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20} },
        React.createElement('h2', {style:{margin:0}}, title),
        React.createElement('button', {className:'act-btn', onClick:onClose, style:{fontSize:18}},
          React.createElement('i',{className:'fas fa-times'})
        )
      ),
      children,
      footer && React.createElement('div', {className:'modal-actions'}, footer)
    )
  );
}

function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return React.createElement('div', { className: 'modal-backdrop', onClick: e => { if(e.target===e.currentTarget) onCancel(); } },
    React.createElement('div', { className: 'confirm-box' },
      React.createElement('h3', null, React.createElement('i',{className:'fas fa-exclamation-triangle',style:{color:'#F44336',marginRight:10}}), title),
      React.createElement('p', null, message),
      React.createElement('div', {className:'modal-actions'},
        React.createElement('button', {className:'btn btn-secondary',onClick:onCancel},'Cancel'),
        React.createElement('button', {className:'btn btn-primary',style:{background:'#D32F2F'},onClick:onConfirm},
          React.createElement('i',{className:'fas fa-trash',style:{marginRight:6}}), 'Yes, Delete'
        )
      )
    )
  );
}

function Panel({ title, onClose, children, footer }) {
  return React.createElement(React.Fragment, null,
    React.createElement('div', { className: 'dms-panel-overlay', onClick: onClose }),
    React.createElement('div', { className: 'dms-panel' },
      React.createElement('div', { className: 'dms-panel-header' },
        React.createElement('h2', null, title),
        React.createElement('button', { className: 'dms-panel-close', onClick: onClose },
          React.createElement('i', { className: 'fas fa-times' })
        )
      ),
      React.createElement('div', { className: 'dms-panel-body' }, children),
      footer && React.createElement('div', { className: 'dms-panel-actions' }, footer)
    )
  );
}

/* ===================================================
   SCREEN: ADMIN DASHBOARD
=================================================== */
function AdminDashboard() {
  const [search, setSearch] = useState('');
  const [viewDoc, setViewDoc] = useState(null);
  const [docs, setDocs] = useState(DOCS);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name:'', category:'Clinical', drug:'', status:'Draft' });
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);

  const resetFilters = () => { setStatusFilter('All'); setCategoryFilter('All'); setSearch(''); setPage(1); };
  const filtered = docs.filter(d =>
    (d.name.toLowerCase().includes(search.toLowerCase()) || d.author.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter === 'All' || d.status === statusFilter) &&
    (categoryFilter === 'All' || d.category === categoryFilter)
  );
  const paged = filtered.slice((page-1)*6, page*6);

  const stats = {
    total: docs.length, approved: docs.filter(d=>d.status==='Approved').length,
    pending: docs.filter(d=>d.status==='Pending Approval').length, drafts: docs.filter(d=>d.status==='Draft').length,
    users: USERS.filter(u=>u.status==='Active').length, categories: CATEGORIES.length
  };

  const toggleSelect = id => setSelected(s => s.includes(id) ? s.filter(x=>x!==id) : [...s, id]);

  return React.createElement('div', null,
    React.createElement('h1', {className:'mainTitle', style:{marginTop:0,marginBottom:16}}, 'Admin Dashboard'),
    React.createElement('div', {className:'white-card-section'},
      React.createElement('div', {className:'summary-cards-container', style:{marginBottom:0}},
        React.createElement(SummaryCard, {icon:'fas fa-file-alt',   title:'Total Documents',  value:stats.total,      subtitle:'All documents',       color:'blue'}),
        React.createElement(SummaryCard, {icon:'fas fa-check-circle',title:'Approved',         value:stats.approved,   subtitle:'Fully approved',      color:'green'}),
        React.createElement(SummaryCard, {icon:'fas fa-clock',       title:'Pending Review',   value:stats.pending,    subtitle:'Awaiting action',     color:'orange'}),
        React.createElement(SummaryCard, {icon:'fas fa-pen',         title:'Drafts',           value:stats.drafts,     subtitle:'In progress',         color:'purple'}),
        React.createElement(SummaryCard, {icon:'fas fa-users',       title:'Active Users',     value:stats.users,      subtitle:'System users',        color:'blue'}),
        React.createElement(SummaryCard, {icon:'fas fa-folder',      title:'Categories',       value:stats.categories, subtitle:'Document categories',  color:'orange'}),
      )
    ),
    React.createElement('div', {className:'white-card-section'},
      React.createElement('div',{className:'filter-row-4'},
        React.createElement('select',{className:'filter-select',value:statusFilter,onChange:e=>{setStatusFilter(e.target.value);setPage(1);}},
          ['All Status','Draft','Under Review','Pending Approval','Approved','Rejected','Signed'].map(v=>React.createElement('option',{key:v,value:v==='All Status'?'All':v},v))
        ),
        React.createElement('select',{className:'filter-select',value:categoryFilter,onChange:e=>{setCategoryFilter(e.target.value);setPage(1);}},
          ['All Categories','Administrative','Clinical','Nonclinical','Quality'].map(v=>React.createElement('option',{key:v,value:v==='All Categories'?'All':v},v))
        ),
        React.createElement('div'),
        React.createElement('button',{className:'btn btn-primary btn-sm',onClick:resetFilters},React.createElement('i',{className:'fas fa-rotate-left',style:{marginRight:6}}),'Reset Filters')
      )
    ),
    React.createElement(Breadcrumb,{items:[{label:'Admin Dashboard',active:true}]}),
    React.createElement('div', { className: 'boxCard-demo', style:{margin:0} },
      React.createElement(GridToolbar, {
        search, onSearch: v=>{setSearch(v);setPage(1);},
        onAdd: () => setAddOpen(true),
        onRefresh: resetFilters,
        editBtns: selected.length > 0 ? React.createElement('div',{className:'dfs',style:{marginLeft:8}},
          selected.length===1 && React.createElement('button',{className:'act-btn edit',title:'Edit'},React.createElement('i',{className:'fas fa-pen-to-square'})),
          React.createElement('button',{className:'act-btn del',title:'Delete',onClick:()=>setDocs(docs.filter(d=>!selected.includes(d.id)))},React.createElement('i',{className:'fas fa-trash-can'}))
        ) : null
      }),
      React.createElement('table', { className: 'dms-table' },
        React.createElement('thead', null,
          React.createElement('tr', null,
            React.createElement('th',{style:{width:36}},''),
            ['Document Name','Category','Author','Status','Last Modified','Actions'].map(h =>
              React.createElement('th', {key:h}, h)
            )
          )
        ),
        React.createElement('tbody', null,
          paged.map(d => {
            const fi = fileIcon(d.ext);
            return React.createElement('tr', { key: d.id },
              React.createElement('td', null, React.createElement('input',{type:'checkbox',checked:selected.includes(d.id),onChange:()=>toggleSelect(d.id)})),
              React.createElement('td', null,
                React.createElement('div', {className:'dfs'},
                  React.createElement('div', {className:'file-icon '+fi.cls}, React.createElement('i',{className:fi.icon})),
                  React.createElement('span', {className:'fw500', style:{marginLeft:8}}, d.name)
                )
              ),
              React.createElement('td', null, d.category),
              React.createElement('td', null, d.author),
              React.createElement('td', null, React.createElement(StatusBadge, {status:d.status})),
              React.createElement('td', null, d.date),
              React.createElement('td', null,
                React.createElement('button', {className:'act-btn view', title:'View', onClick:()=>setViewDoc(d)}, React.createElement('i',{className:'fas fa-eye'}))
              )
            );
          })
        )
      ),
      React.createElement(Pagination, {total:filtered.length, page, perPage:6, onChange:setPage})
    ),
    addOpen && React.createElement(Modal, {
      title: React.createElement('span', null, React.createElement('i',{className:'fas fa-plus-circle',style:{marginRight:10,color:'#1E88E5'}}), 'Create New Document'),
      onClose: () => setAddOpen(false),
      footer: [
        React.createElement('button', {key:'c', className:'btn btn-secondary', onClick:()=>setAddOpen(false)}, 'Cancel'),
        React.createElement('button', {key:'s', className:'btn btn-primary', onClick:()=>{
          setDocs([{...form, id:Date.now(), ext:'docx', date:new Date().toISOString().split('T')[0], author:'John Smith', ver:'1.0'}, ...docs]);
          setAddOpen(false); showToast('Document created successfully');
        }}, React.createElement('i',{className:'fas fa-save',style:{marginRight:6}}), 'Create')
      ]
    },
      [['name','Document Name','text'],['drug','Drug Name','text']].map(([f,l,t]) =>
        React.createElement('div', {key:f},
          React.createElement('label', {className:'modal-form-label'}, l),
          React.createElement('input', {className:'modal-form-input', type:t, value:form[f], onChange:e=>setForm({...form,[f]:e.target.value}), placeholder:l})
        )
      ).concat([
        React.createElement('div', {key:'cat'},
          React.createElement('label', {className:'modal-form-label'}, 'Category'),
          React.createElement('select', {className:'modal-form-select', value:form.category, onChange:e=>setForm({...form,category:e.target.value})},
            ['Administrative','Clinical','Nonclinical','Quality'].map(c=>React.createElement('option',{key:c},c))
          )
        )
      ])
    ),
    viewDoc && React.createElement(Panel, {
      title: viewDoc.name,
      onClose: () => setViewDoc(null),
      footer: [
        React.createElement('button',{key:'d',className:'btn btn-primary'}, React.createElement('i',{className:'fas fa-download',style:{marginRight:6}}), 'Download'),
        React.createElement('button',{key:'e',className:'btn btn-secondary'}, React.createElement('i',{className:'fas fa-pen-to-square',style:{marginRight:6}}), 'Edit'),
        React.createElement('button',{key:'del',className:'btn btn-danger',onClick:()=>setViewDoc(null)}, React.createElement('i',{className:'fas fa-trash-can',style:{marginRight:6}}), 'Delete'),
        React.createElement('button',{key:'c',className:'btn btn-secondary', onClick:()=>setViewDoc(null)}, 'Close'),
      ]
    },
      React.createElement('div', {className:'detail-grid'},
        [['Category',viewDoc.category],['Author',viewDoc.author],['Drug',viewDoc.drug],['Version',viewDoc.ver],['Last Modified',viewDoc.date]].map(([k,v])=>
          React.createElement('div', {key:k, className:'detail-item'},
            React.createElement('div',{className:'dl'},k),
            React.createElement('div',{className:'dv'},v)
          )
        ),
        React.createElement('div',{className:'detail-item'},
          React.createElement('div',{className:'dl'},'Status'),
          React.createElement(StatusBadge,{status:viewDoc.status})
        )
      )
    )
  );
}

/* ===================================================
   SCREEN: MANAGE TEMPLATES
=================================================== */
const ECTD_MODULES_SERVER = [
  {value:'1', label:'Module 1 – Administrative & Prescribing Info'},
  {value:'2', label:'Module 2 – CTD Summaries'},
  {value:'3', label:'Module 3 – Quality'},
  {value:'4', label:'Module 4 – Nonclinical Study Reports'},
  {value:'5', label:'Module 5 – Clinical Study Reports'},
];
const ECTD_SECTIONS_BY_MODULE = {
  '1': ['1.1 Cover Letter','1.2 Investigator Brochure','1.3 Prescribing Information','1.4 Information about the Experts'],
  '2': ['2.1 CTD Table of Contents','2.2 Introduction to the CTD','2.3 Quality Overall Summary','2.4 Nonclinical Overview','2.5 Clinical Overview','2.6 Nonclinical Summary','2.7 Clinical Summary'],
  '3': ['3.1 Module 3 TOC','3.2.S Drug Substance','3.2.P Drug Product','3.2.A Appendices','3.2.R Regional Information'],
  '4': ['4.1 Table of Contents','4.2.1 Pharmacology','4.2.2 Pharmacokinetics','4.2.3 Toxicology'],
  '5': ['5.1 TOC of Module 5','5.2 Tabular Listing of Studies','5.3 Clinical Study Reports','5.4 Literature References'],
};

function UploadTemplateForm({ onClose, onSave, editData }) {
  const isEdit = !!editData;
  const [form, setForm] = useState({
    name: editData ? editData.name : '',
    mappingType: editData ? editData.mappingType : 'None',
    module: '',
    section: '',
    ctdFolder: editData ? (editData.ctdFolder||'') : '',
    country: editData ? editData.country : 'Global',
    status: editData ? editData.status : 'Active',
    categoryId: '',
    file: null,
  });
  const [valError, setValError] = useState('');

  const sectionOptions = form.module ? ECTD_SECTIONS_BY_MODULE[form.module] || [] : [];

  const handleSave = () => {
    const errors = [];
    if (!form.name.trim()) errors.push('Template Name is required.');
    if (!isEdit && !form.file) errors.push('Please select a file to upload.');
    if (form.mappingType === 'eCTD') {
      if (!form.module) errors.push('eCTD Module (1–5) is required.');
      if (!form.ctdFolder) errors.push('CTD Folder / Section is required.');
    }
    if (errors.length > 0) { setValError(errors.join('\\n')); return; }
    onSave(form);
  };

  return React.createElement('div', {className:'upload-form-overlay'},
    React.createElement('div', {className:'upload-form-card'},
      React.createElement('div', {className:'upload-form-header'},
        React.createElement('h2', {style:{margin:0,fontSize:18}}, isEdit ? 'Edit Template' : 'Upload Template'),
        React.createElement('button', {className:'btn btn-danger btn-sm', onClick:onClose}, 'Close')
      ),
      React.createElement(Breadcrumb, {items:[
        {label:'Manage Templates', onClick:onClose},
        {label: isEdit ? 'Edit Template' : 'Upload Template', active:true}
      ]}),

      valError && React.createElement('div', {className:'val-error-box', style:{background:'#fff3f3',border:'1px solid #f5c6c6',borderRadius:6,padding:'10px 14px',marginBottom:12,color:'#c0392b',fontSize:13}},
        React.createElement('strong', null, 'Please fix the following:'),
        React.createElement('ul', {style:{marginTop:6,paddingLeft:20}},
          valError.split('\\n').map((e,i) => React.createElement('li',{key:i},e))
        )
      ),

      React.createElement('div', {className:'form-grid-4'},
        React.createElement('div', {className:'fg'},
          React.createElement('label', {className:'fl'}, 'Template Name', React.createElement('span',{className:'req'},' *')),
          React.createElement('input', {className:'fi', value:form.name, onChange:e=>setForm({...form,name:e.target.value}), placeholder:'e.g., Clinical Trial Protocol'})
        ),
        React.createElement('div', {className:'fg'},
          React.createElement('label', {className:'fl'}, 'Country'),
          React.createElement('select', {className:'fi', value:form.country, onChange:e=>setForm({...form,country:e.target.value})},
            ['Global','US','EU','India','Japan','Canada'].map(c=>React.createElement('option',{key:c},c))
          )
        ),
        React.createElement('div', {className:'fg'},
          React.createElement('label', {className:'fl'}, 'Status'),
          React.createElement('select', {className:'fi', value:form.status, onChange:e=>setForm({...form,status:e.target.value})},
            ['Active','Inactive'].map(s=>React.createElement('option',{key:s},s))
          )
        ),
        React.createElement('div', {className:'fg'},
          React.createElement('label', {className:'fl'}, 'Mapping Type'),
          React.createElement('select', {className:'fi', value:form.mappingType, onChange:e=>setForm({...form,mappingType:e.target.value,module:'',section:'',ctdFolder:''})},
            ['None','eCTD','GMP','TMF'].map(m=>React.createElement('option',{key:m},m))
          )
        ),
      ),

      form.mappingType === 'eCTD' && React.createElement('div', {className:'form-grid-4', style:{marginTop:12}},
        React.createElement('div', {className:'fg'},
          React.createElement('label', {className:'fl'}, 'eCTD Module', React.createElement('span',{className:'req'},' *')),
          React.createElement('select', {className:'fi', value:form.module, onChange:e=>setForm({...form,module:e.target.value,ctdFolder:'',section:''})},
            [React.createElement('option',{key:'',value:''},'-- Select Module --'),
             ...ECTD_MODULES_SERVER.map(m=>React.createElement('option',{key:m.value,value:m.value},m.label))]
          )
        ),
        React.createElement('div', {className:'fg'},
          React.createElement('label', {className:'fl'}, 'CTD Section', React.createElement('span',{className:'req'},' *')),
          React.createElement('select', {className:'fi', value:form.ctdFolder, onChange:e=>setForm({...form,ctdFolder:e.target.value}), disabled:!form.module},
            [React.createElement('option',{key:'',value:''},form.module ? '-- Select Section --' : '-- Select Module First --'),
             ...sectionOptions.map(s=>React.createElement('option',{key:s,value:s},s))]
          )
        ),
        React.createElement('div', {className:'fg'},
          React.createElement('label', {className:'fl'}, 'Subsection (Optional)'),
          React.createElement('input', {className:'fi', value:form.section, onChange:e=>setForm({...form,section:e.target.value}), placeholder:'e.g., 5.3.1'})
        ),
      ),

      form.mappingType === 'GMP' && React.createElement('div', {className:'form-grid-4', style:{marginTop:12}},
        React.createElement('div', {className:'fg'},
          React.createElement('label', {className:'fl'}, 'GMP Model', React.createElement('span',{className:'req'},' *')),
          React.createElement('select', {className:'fi', value:form.ctdFolder, onChange:e=>setForm({...form,ctdFolder:e.target.value})},
            [React.createElement('option',{key:'',value:''},'-- Select Model --'),
             ...['ICH Q7','ICH Q8','ICH Q9','ICH Q10'].map(m=>React.createElement('option',{key:m,value:m},m))]
          )
        )
      ),

      form.mappingType === 'TMF' && React.createElement('div', {className:'form-grid-4', style:{marginTop:12}},
        React.createElement('div', {className:'fg'},
          React.createElement('label', {className:'fl'}, 'TMF Folder', React.createElement('span',{className:'req'},' *')),
          React.createElement('select', {className:'fi', value:form.ctdFolder, onChange:e=>setForm({...form,ctdFolder:e.target.value})},
            [React.createElement('option',{key:'',value:''},'-- Select Folder --'),
             ...['01 – Trial Management','02 – Risk Management','03 – Investigational Product','04 – IRB/IEC'].map(f=>React.createElement('option',{key:f,value:f},f))]
          )
        )
      ),

      !isEdit && React.createElement('div', {style:{marginTop:16}},
        React.createElement('label', {className:'fl'}, 'Upload File', React.createElement('span',{className:'req'},' *')),
        React.createElement('div', {className:'file-drop-zone', style:{border:'2px dashed #c0c7d6',borderRadius:6,padding:'20px 16px',textAlign:'center',background:'#f8f9ff',cursor:'pointer',marginTop:4}},
          React.createElement('i', {className:'fas fa-cloud-upload-alt', style:{fontSize:28,color:'#1300a6',marginBottom:8,display:'block'}}),
          React.createElement('p', {style:{margin:'0 0 8px',color:'#444',fontSize:13}}, 'Drag & drop file here or'),
          React.createElement('label', {style:{cursor:'pointer',color:'#1300a6',fontWeight:600,fontSize:13}},
            'Browse File',
            React.createElement('input', {type:'file', style:{display:'none'}, accept:'.doc,.docx,.pdf,.xls,.xlsx',
              onChange:e=>setForm({...form, file:e.target.files[0]})
            })
          ),
          form.file && React.createElement('div', {style:{marginTop:10,fontSize:12,color:'#555'}},
            React.createElement('i',{className:'fas fa-file',style:{marginRight:6}}), form.file.name, ' (', (form.file.size/1024).toFixed(1), ' KB)'
          ),
          React.createElement('p', {style:{fontSize:11,color:'#999',margin:'8px 0 0'}}, 'Accepted: DOC, DOCX, PDF, XLS, XLSX')
        )
      ),

      React.createElement('div', {style:{marginTop:20,display:'flex',gap:10}},
        React.createElement('button', {className:'btn btn-primary', onClick:handleSave},
          React.createElement('i',{className:'fas fa-save',style:{marginRight:6}}), isEdit ? 'Update Template' : 'Save Template'
        ),
        React.createElement('button', {className:'btn btn-danger', onClick:onClose},
          React.createElement('i',{className:'fas fa-times',style:{marginRight:6}}), 'Cancel'
        )
      )
    )
  );
}

function ManageTemplates() {
  const [templates, setTemplates] = useState(TEMPLATES);
  const [search, setSearch] = useState('');
  const [mapFilter, setMapFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [countryFilter, setCountryFilter] = useState('All');
  const [selected, setSelected] = useState([]);
  const [viewTpl, setViewTpl] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editTpl, setEditTpl] = useState(null);
  const [page, setPage] = useState(1);

  const visibleTemplates = templates.filter(t => !t.isDeleted);

  const filtered = visibleTemplates.filter(t =>
    (t.name.toLowerCase().includes(search.toLowerCase())) &&
    (mapFilter === 'All' || t.mappingType === mapFilter) &&
    (statusFilter === 'All' || t.status === statusFilter) &&
    (countryFilter === 'All' || t.country === countryFilter)
  );
  const paged = filtered.slice((page-1)*6, page*6);

  const counts = { total: filtered.length, ectd: filtered.filter(t=>t.mappingType==='eCTD').length,
    gmp: filtered.filter(t=>t.mappingType==='GMP').length, tmf: filtered.filter(t=>t.mappingType==='TMF').length };

  const countries = [...new Set(visibleTemplates.map(t=>t.country))];
  const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(x=>x!==id) : [...s, id]);

  const handleSaveTemplate = (form) => {
    const existing = templates.find(t => !t.isDeleted && t.name.toLowerCase() === form.name.toLowerCase().trim());
    const newVer = existing ? (parseFloat(existing.ver||'1.0') + 1).toFixed(1) : '1.0';
    if (existing) {
      setTemplates(prev => prev.map(t => t.id === existing.id ? {...t, isDeleted:true} : t));
    }
    const newTpl = {
      id: Date.now(), name: form.name.trim(), ext: form.file ? form.file.name.split('.').pop() : 'docx',
      mappingType: form.mappingType, ctdFolder: form.ctdFolder || '',
      section: form.section || '', country: form.country, ver: newVer,
      status: form.status, date: new Date().toISOString().split('T')[0], isDeleted: false,
    };
    setTemplates(prev => [newTpl, ...prev]);
    setAddOpen(false);
    showToast(existing ? 'New version ' + newVer + ' uploaded (prev marked inactive)' : 'Template uploaded successfully');
  };

  const handleDeleteFromPanel = (tpl) => {
    setTemplates(prev => prev.map(t => t.id === tpl.id ? {...t, isDeleted:true} : t));
    setViewTpl(null);
    showToast('Template removed', 'error');
  };

  const resetFilters = () => { setMapFilter('All'); setStatusFilter('All'); setCountryFilter('All'); setPage(1); };

  if (addOpen) return React.createElement(UploadTemplateForm, { onClose:()=>setAddOpen(false), onSave:handleSaveTemplate });
  if (editTpl) return React.createElement(UploadTemplateForm, { onClose:()=>setEditTpl(null), onSave:(form)=>{
    setTemplates(prev=>prev.map(t=>t.id===editTpl.id?{...t,...form,ver:t.ver}:t));
    setEditTpl(null); showToast('Template updated');
  }, editData:editTpl });

  return React.createElement('div', null,
    React.createElement('h1', {className:'mainTitle', style:{marginTop:0,marginBottom:16}}, 'Manage Templates'),

    React.createElement('div', {className:'white-card-section'},
      React.createElement('div', {className:'summary-cards-container', style:{marginBottom:0}},
        React.createElement(SummaryCard, {icon:'fas fa-file-alt',   title:'Total Templates', value:counts.total, subtitle:'All templates',    color:'blue'}),
        React.createElement(SummaryCard, {icon:'fas fa-dna',         title:'eCTD Templates',  value:counts.ectd,  subtitle:'Mapped to eCTD',  color:'purple'}),
        React.createElement(SummaryCard, {icon:'fas fa-flask',       title:'GMP Templates',   value:counts.gmp,   subtitle:'Mapped to GMP',   color:'orange'}),
        React.createElement(SummaryCard, {icon:'fas fa-folder-tree', title:'TMF Templates',   value:counts.tmf,   subtitle:'Mapped to TMF',   color:'green'}),
      )
    ),

    React.createElement('div', {className:'white-card-section'},
      React.createElement('div', {className:'filter-row-4'},
        React.createElement('select', {className:'filter-select', value:mapFilter, onChange:e=>{setMapFilter(e.target.value);setPage(1);}},
          ['All Types','eCTD','GMP','TMF','None'].map(v=>React.createElement('option',{key:v,value:v==='All Types'?'All':v},v))
        ),
        React.createElement('select', {className:'filter-select', value:statusFilter, onChange:e=>{setStatusFilter(e.target.value);setPage(1);}},
          ['All Status','Active','Inactive'].map(v=>React.createElement('option',{key:v,value:v==='All Status'?'All':v},v))
        ),
        React.createElement('select', {className:'filter-select', value:countryFilter, onChange:e=>{setCountryFilter(e.target.value);setPage(1);}},
          [React.createElement('option',{key:'all',value:'All'},'All Countries'),
            ...countries.map(c=>React.createElement('option',{key:c,value:c},c))]
        ),
        React.createElement('button', {className:'btn btn-primary btn-sm', onClick:resetFilters},
          React.createElement('i',{className:'fas fa-rotate-left',style:{marginRight:6}}), 'Reset Filters'
        )
      )
    ),

    React.createElement(Breadcrumb, {items:[{label:'Manage Templates',active:true}]}),

    React.createElement('div', {className:'boxCard-demo', style:{margin:0}},
      React.createElement(GridToolbar, {
        search, onSearch:v=>{setSearch(v);setPage(1);},
        addLabel: 'Upload Template',
        onAdd: ()=>setAddOpen(true),
        onUpload: ()=>showToast('Excel Upload opened'),
        onRefresh: resetFilters,
        editBtns: selected.length > 0 ? React.createElement('div', {className:'dfs', style:{marginLeft:8}},
          selected.length === 1 && React.createElement('button', {className:'act-btn edit', title:'Edit',
            onClick:()=>setEditTpl(visibleTemplates.find(t=>t.id===selected[0]))},
            React.createElement('i',{className:'fas fa-pen-to-square'})),
          React.createElement('button', {className:'act-btn del', title:'Delete',
            onClick:()=>setDeleteTarget(selected)},
            React.createElement('i',{className:'fas fa-trash-can'}))
        ) : null
      }),
      React.createElement('table', {className:'dms-table'},
        React.createElement('thead', null,
          React.createElement('tr', null,
            React.createElement('th', {style:{width:36}}, ''),
            ['Template Name','Version','Country','Mapping Type','Folder / Zone','Section / Model','Upload Date','Status','Action'].map(h=>React.createElement('th',{key:h},h))
          )
        ),
        React.createElement('tbody', null,
          paged.map(t => {
            const fi = fileIcon(t.ext);
            return React.createElement('tr', {key:t.id},
              React.createElement('td', null,
                React.createElement('input', {type:'checkbox', checked:selected.includes(t.id), onChange:()=>toggleSelect(t.id)})
              ),
              React.createElement('td', null,
                React.createElement('div', {className:'dfs'},
                  React.createElement('div',{className:'file-icon '+fi.cls}, React.createElement('i',{className:fi.icon})),
                  React.createElement('span', {style:{marginLeft:8}}, t.name)
                )
              ),
              React.createElement('td', null, t.ver),
              React.createElement('td', null, t.country),
              React.createElement('td', null, React.createElement(MappingBadge, {type:t.mappingType})),
              React.createElement('td', null, t.ctdFolder || t.model || t.tmfFolder || '-'),
              React.createElement('td', null, t.section || '-'),
              React.createElement('td', null, t.date),
              React.createElement('td', null, React.createElement(StatusBadge, {status:t.status})),
              React.createElement('td', null,
                React.createElement('button', {className:'act-btn view', title:'View', onClick:()=>setViewTpl(t)},
                  React.createElement('i',{className:'fas fa-eye'})
                )
              )
            );
          })
        )
      ),
      React.createElement(Pagination, {total:filtered.length, page, perPage:6, onChange:setPage})
    ),

    deleteTarget && React.createElement(ConfirmModal, {
      title:'Delete Template(s)',
      message:'This template will be deleted permanently. Are you sure?',
      onConfirm: () => {
        setTemplates(prev => prev.map(t => deleteTarget.includes(t.id) ? {...t, isDeleted:true} : t));
        setSelected([]); setDeleteTarget(null); showToast('Deleted successfully','error');
      },
      onCancel: () => setDeleteTarget(null)
    }),

    viewTpl && React.createElement(Panel, {
      title: 'Template: ' + viewTpl.name,
      onClose: ()=>setViewTpl(null),
      footer: [
        React.createElement('button',{key:'d',className:'btn btn-primary'},React.createElement('i',{className:'fas fa-download',style:{marginRight:6}}),'Download'),
        React.createElement('button',{key:'e',className:'btn btn-secondary',onClick:()=>{setViewTpl(null);setEditTpl(viewTpl);}},React.createElement('i',{className:'fas fa-pen-to-square',style:{marginRight:6}}),'Edit'),
        React.createElement('button',{key:'del',className:'btn btn-danger',onClick:()=>handleDeleteFromPanel(viewTpl)},React.createElement('i',{className:'fas fa-trash-can',style:{marginRight:6}}),'Delete'),
        React.createElement('button',{key:'c',className:'btn btn-secondary',onClick:()=>setViewTpl(null)},'Close'),
      ]
    },
      React.createElement('div',{className:'detail-grid'},
        [['Template Name',viewTpl.name],['Version',viewTpl.ver],['Country',viewTpl.country],
          ['Mapping Type',viewTpl.mappingType],['Folder / Zone',viewTpl.ctdFolder||viewTpl.model||viewTpl.tmfFolder||'-'],
          ['Section',viewTpl.section||'-'],['Upload Date',viewTpl.date],['Status',viewTpl.status]
        ].map(([k,v])=>
          React.createElement('div',{key:k,className:'detail-item'},
            React.createElement('div',{className:'dl'},k),
            k==='Status'?React.createElement(StatusBadge,{status:v}):React.createElement('div',{className:'dv'},v)
          )
        )
      ),
      React.createElement('div',{style:{height:250,background:'#f5f5f5',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',color:'#bbb'}},
        React.createElement('div',{style:{textAlign:'center'}},
          React.createElement('i',{className:'fas fa-file-alt',style:{fontSize:48,marginBottom:12,display:'block'}}),
          React.createElement('p',null,'File preview available in SharePoint')
        )
      )
    )
  );
}

/* ===================================================
   SCREEN: MANAGE CATEGORIES
=================================================== */
function ManageCategories() {
  const [cats, setCats] = useState(CATEGORIES);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [docCatFilter, setDocCatFilter] = useState('All');
  const [groupFilter, setGroupFilter] = useState('All');
  const [selected, setSelected] = useState([]);
  const [viewCat, setViewCat] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [page, setPage] = useState(1);

  const docCatOptions = ['All Doc Categories', ...Array.from(new Set(cats.map(c=>c.documentCategory)))];
  const groupOptions = ['All Groups', ...Array.from(new Set((docCatFilter==='All'?cats:cats.filter(c=>c.documentCategory===docCatFilter)).map(c=>c.group)))];

  const filtered = cats.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) &&
    (statusFilter==='All' || c.status===statusFilter) &&
    (docCatFilter==='All' || c.documentCategory===docCatFilter) &&
    (groupFilter==='All' || c.group===groupFilter)
  );
  const paged = filtered.slice((page-1)*6, page*6);

  const counts = { total:cats.length, active:cats.filter(c=>c.status==='Active').length, inactive:cats.filter(c=>c.status==='Inactive').length };
  const toggleSelect = id => setSelected(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);
  const resetFilters = () => { setStatusFilter('All'); setDocCatFilter('All'); setGroupFilter('All'); setSearch(''); setPage(1); };

  return React.createElement('div', null,
    React.createElement('h1',{className:'mainTitle',style:{marginTop:0,marginBottom:16}},'Manage Categories'),
    React.createElement('div',{className:'white-card-section'},
      React.createElement('div',{className:'summary-cards-container',style:{marginBottom:0}},
        React.createElement(SummaryCard,{icon:'fas fa-folder',       title:'Total Categories', value:counts.total,    subtitle:'All categories',    color:'blue'}),
        React.createElement(SummaryCard,{icon:'fas fa-folder-open',  title:'Active',           value:counts.active,   subtitle:'Active categories', color:'green'}),
        React.createElement(SummaryCard,{icon:'fas fa-folder-minus', title:'Inactive',         value:counts.inactive, subtitle:'Inactive categories',color:'orange'}),
        React.createElement(SummaryCard,{icon:'fas fa-layer-group',  title:'Total Groups',     value:new Set(cats.map(c=>c.group)).size, subtitle:'Unique groups', color:'purple'}),
      )
    ),
    React.createElement('div',{className:'white-card-section'},
      React.createElement('div',{className:'filter-row-4'},
        React.createElement('select',{className:'filter-select',value:statusFilter,onChange:e=>{setStatusFilter(e.target.value);setPage(1);}},
          ['All Status','Active','Inactive'].map(v=>React.createElement('option',{key:v,value:v==='All Status'?'All':v},v))
        ),
        React.createElement('select',{className:'filter-select',value:docCatFilter,onChange:e=>{setDocCatFilter(e.target.value);setGroupFilter('All');setPage(1);}},
          docCatOptions.map(v=>React.createElement('option',{key:v,value:v==='All Doc Categories'?'All':v},v))
        ),
        React.createElement('select',{className:'filter-select',value:groupFilter,onChange:e=>{setGroupFilter(e.target.value);setPage(1);}},
          groupOptions.map(v=>React.createElement('option',{key:v,value:v==='All Groups'?'All':v},v))
        ),
        React.createElement('button',{className:'btn btn-primary btn-sm',onClick:resetFilters},React.createElement('i',{className:'fas fa-rotate-left',style:{marginRight:6}}),'Reset Filters')
      )
    ),
    React.createElement(Breadcrumb,{items:[{label:'Manage Categories',active:true}]}),
    React.createElement('div',{className:'boxCard-demo',style:{margin:0}},
      React.createElement(GridToolbar,{
        search, onSearch:v=>{setSearch(v);setPage(1);},
        onAdd:()=>showToast('Add Category'),
        onUpload:()=>showToast('Excel Upload'),
        onRefresh:()=>{resetFilters();showToast('Refreshed');},
        editBtns: selected.length>0 ? React.createElement('div',{className:'dfs',style:{marginLeft:8}},
          selected.length===1&&React.createElement('button',{className:'act-btn edit',title:'Edit'},React.createElement('i',{className:'fas fa-pen-to-square'})),
          React.createElement('button',{className:'act-btn del',title:'Delete',onClick:()=>setDeleteTarget(selected)},React.createElement('i',{className:'fas fa-trash-can'}))
        ):null
      }),
      React.createElement('table',{className:'dms-table'},
        React.createElement('thead',null,
          React.createElement('tr',null,
            React.createElement('th',{style:{width:36}},''),
            ['Category Name','Doc Category','Group / Module','Level','Documents','Status','Action'].map(h=>React.createElement('th',{key:h},h))
          )
        ),
        React.createElement('tbody',null,
          paged.map(c=>
            React.createElement('tr',{key:c.id},
              React.createElement('td',null,React.createElement('input',{type:'checkbox',checked:selected.includes(c.id),onChange:()=>toggleSelect(c.id)})),
              React.createElement('td',null,
                React.createElement('div',{className:'dfs'},
                  React.createElement('i',{className:'fas fa-folder',style:{color:'#FF9800',marginRight:8}}),
                  React.createElement('span',{className:'fw500'},c.name)
                )
              ),
              React.createElement('td',null,c.documentCategory),
              React.createElement('td',null,c.group),
              React.createElement('td',null,React.createElement('span',{className:'map-badge map-none'},'Level '+c.level)),
              React.createElement('td',null,c.docs+' docs'),
              React.createElement('td',null,React.createElement(StatusBadge,{status:c.status})),
              React.createElement('td',null,
                React.createElement('button',{className:'act-btn view',title:'View',onClick:()=>setViewCat(c)},React.createElement('i',{className:'fas fa-eye'}))
              )
            )
          )
        )
      ),
      React.createElement(Pagination,{total:filtered.length,page,perPage:6,onChange:setPage})
    ),
    deleteTarget&&React.createElement(ConfirmModal,{
      title:'Delete Category',message:'Delete selected category? This cannot be undone.',
      onConfirm:()=>{setCats(cats.filter(c=>!deleteTarget.includes(c.id)));setSelected([]);setDeleteTarget(null);showToast('Deleted','error');},
      onCancel:()=>setDeleteTarget(null)
    }),
    viewCat&&React.createElement(Panel,{
      title:viewCat.name,onClose:()=>setViewCat(null),
      footer:[
        React.createElement('button',{key:'e',className:'btn btn-secondary'},React.createElement('i',{className:'fas fa-pen-to-square',style:{marginRight:6}}),'Edit'),
        React.createElement('button',{key:'del',className:'btn btn-danger',onClick:()=>setViewCat(null)},React.createElement('i',{className:'fas fa-trash-can',style:{marginRight:6}}),'Delete'),
        React.createElement('button',{key:'c',className:'btn btn-secondary',onClick:()=>setViewCat(null)},'Close'),
      ]
    },
      React.createElement('div',{className:'detail-grid'},
        [['Category Name',viewCat.name],['Group / Module',viewCat.group],['Level','Level '+viewCat.level],['Documents',viewCat.docs],['Status',viewCat.status]].map(([k,v])=>
          React.createElement('div',{key:k,className:'detail-item'},
            React.createElement('div',{className:'dl'},k),
            k==='Status'?React.createElement(StatusBadge,{status:v}):React.createElement('div',{className:'dv'},v)
          )
        )
      )
    )
  );
}

/* ===================================================
   SCREEN: DRUGS DATABASE
=================================================== */
function DrugsDatabase() {
  const [drugs, setDrugs] = useState(DRUGS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [phaseFilter, setPhaseFilter] = useState('All');
  const [selected, setSelected] = useState([]);
  const [viewDrug, setViewDrug] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [page, setPage] = useState(1);

  const resetFilters = () => { setStatusFilter('All'); setPhaseFilter('All'); setSearch(''); setPage(1); };
  const filtered = drugs.filter(d=>
    (d.name.toLowerCase().includes(search.toLowerCase())||d.generic.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter==='All'||d.status===statusFilter) &&
    (phaseFilter==='All'||d.phase===phaseFilter)
  );
  const paged = filtered.slice((page-1)*6,page*6);
  const counts = {total:drugs.length,active:drugs.filter(d=>d.status==='Active').length,marketed:drugs.filter(d=>d.phase==='Marketed').length,phaseIII:drugs.filter(d=>d.phase==='Phase III').length};
  const toggleSelect = id=>setSelected(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);

  return React.createElement('div',null,
    React.createElement('h1',{className:'mainTitle',style:{marginTop:0,marginBottom:16}},'Drugs Database'),
    React.createElement('div',{className:'white-card-section'},
      React.createElement('div',{className:'summary-cards-container',style:{marginBottom:0}},
        React.createElement(SummaryCard,{icon:'fas fa-capsules',    title:'Total Drugs',   value:counts.total,    subtitle:'All drugs',        color:'blue'}),
        React.createElement(SummaryCard,{icon:'fas fa-check-circle',title:'Active Drugs',  value:counts.active,   subtitle:'Active entries',   color:'green'}),
        React.createElement(SummaryCard,{icon:'fas fa-store',        title:'Marketed',     value:counts.marketed, subtitle:'On the market',    color:'orange'}),
        React.createElement(SummaryCard,{icon:'fas fa-flask',        title:'In Trials',    value:counts.phaseIII, subtitle:'Phase III',        color:'purple'}),
      )
    ),
    React.createElement('div',{className:'white-card-section'},
      React.createElement('div',{className:'filter-row-4'},
        React.createElement('select',{className:'filter-select',value:statusFilter,onChange:e=>{setStatusFilter(e.target.value);setPage(1);}},
          ['All Status','Active','Inactive'].map(v=>React.createElement('option',{key:v,value:v==='All Status'?'All':v},v))
        ),
        React.createElement('select',{className:'filter-select',value:phaseFilter,onChange:e=>{setPhaseFilter(e.target.value);setPage(1);}},
          ['All Phases','Marketed','Phase III','Phase II','Phase I'].map(v=>React.createElement('option',{key:v,value:v==='All Phases'?'All':v},v))
        ),
        React.createElement('div'),
        React.createElement('button',{className:'btn btn-primary btn-sm',onClick:resetFilters},React.createElement('i',{className:'fas fa-rotate-left',style:{marginRight:6}}),'Reset Filters')
      )
    ),
    React.createElement(Breadcrumb,{items:[{label:'Drugs Database',active:true}]}),
    React.createElement('div',{className:'boxCard-demo',style:{margin:0}},
      React.createElement(GridToolbar,{
        search,onSearch:v=>{setSearch(v);setPage(1);},
        onAdd:()=>showToast('Add Drug'),
        onRefresh:()=>{setSearch('');showToast('Refreshed');},
        editBtns:selected.length>0?React.createElement('div',{className:'dfs',style:{marginLeft:8}},
          selected.length===1&&React.createElement('button',{className:'act-btn edit'},React.createElement('i',{className:'fas fa-pen-to-square'})),
          React.createElement('button',{className:'act-btn del',onClick:()=>setDeleteTarget(selected)},React.createElement('i',{className:'fas fa-trash-can'}))
        ):null
      }),
      React.createElement('table',{className:'dms-table'},
        React.createElement('thead',null,
          React.createElement('tr',null,
            React.createElement('th',{style:{width:36}},''),
            ['Drug Name','Generic Name','Indication','Phase','Status','Action'].map(h=>React.createElement('th',{key:h},h))
          )
        ),
        React.createElement('tbody',null,
          paged.map(d=>React.createElement('tr',{key:d.id},
            React.createElement('td',null,React.createElement('input',{type:'checkbox',checked:selected.includes(d.id),onChange:()=>toggleSelect(d.id)})),
            React.createElement('td',null,React.createElement('span',{className:'fw500'},d.name)),
            React.createElement('td',null,d.generic),
            React.createElement('td',null,d.indication),
            React.createElement('td',null,React.createElement('span',{className:'phase-tag'},d.phase)),
            React.createElement('td',null,React.createElement(StatusBadge,{status:d.status})),
            React.createElement('td',null,
              React.createElement('button',{className:'act-btn view',onClick:()=>setViewDrug(d)},React.createElement('i',{className:'fas fa-eye'}))
            )
          ))
        )
      ),
      React.createElement(Pagination,{total:filtered.length,page,perPage:6,onChange:setPage})
    ),
    deleteTarget&&React.createElement(ConfirmModal,{
      title:'Delete Drug',message:'Delete selected drug(s)?',
      onConfirm:()=>{setDrugs(drugs.filter(d=>!deleteTarget.includes(d.id)));setSelected([]);setDeleteTarget(null);showToast('Deleted','error');},
      onCancel:()=>setDeleteTarget(null)
    }),
    viewDrug&&React.createElement(Panel,{title:viewDrug.name,onClose:()=>setViewDrug(null),
      footer:[
        React.createElement('button',{key:'d',className:'btn btn-primary'},React.createElement('i',{className:'fas fa-download',style:{marginRight:6}}),'Download'),
        React.createElement('button',{key:'e',className:'btn btn-secondary'},React.createElement('i',{className:'fas fa-pen-to-square',style:{marginRight:6}}),'Edit'),
        React.createElement('button',{key:'del',className:'btn btn-danger',onClick:()=>setViewDrug(null)},React.createElement('i',{className:'fas fa-trash-can',style:{marginRight:6}}),'Delete'),
        React.createElement('button',{key:'c',className:'btn btn-secondary',onClick:()=>setViewDrug(null)},'Close'),
      ]
    },
      React.createElement('div',{className:'detail-grid'},
        [['Drug Name',viewDrug.name],['Generic Name',viewDrug.generic],['Indication',viewDrug.indication],['Phase',viewDrug.phase],['Status',viewDrug.status]].map(([k,v])=>
          React.createElement('div',{key:k,className:'detail-item'},
            React.createElement('div',{className:'dl'},k),
            k==='Status'?React.createElement(StatusBadge,{status:v}):React.createElement('div',{className:'dv'},v)
          )
        )
      )
    )
  );
}

/* ===================================================
   SCREEN: ALL DOCUMENTS / MY DOCUMENTS / ASSIGNED TO ME
=================================================== */
function AllDocuments({ filterUser, filterPending, role }) {
  const currentUser = ROLE_USER[role] || 'John Smith';
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selected, setSelected] = useState([]);
  const [viewDoc, setViewDoc] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [page, setPage] = useState(1);

  const resetFilters = () => { setStatusFilter('All'); setCategoryFilter('All'); setSearch(''); setPage(1); };
  const toggleSelect = id => setSelected(s => s.includes(id) ? s.filter(x=>x!==id) : [...s, id]);

  let baseDocs = DOCS;
  if (filterUser) baseDocs = DOCS.filter(d => d.author === currentUser);
  if (filterPending) baseDocs = DOCS.filter(d => d.approver === currentUser || d.status === 'Pending Approval');

  const filtered = baseDocs.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) &&
    (statusFilter === 'All' || d.status === statusFilter) &&
    (categoryFilter === 'All' || d.category === categoryFilter)
  );
  const paged = filtered.slice((page-1)*6, page*6);
  const title = filterUser ? 'My Documents' : filterPending ? 'Assigned to Me' : 'All Documents';
  const counts = {
    total: baseDocs.length,
    approved: baseDocs.filter(d=>d.status==='Approved').length,
    pending: baseDocs.filter(d=>d.status==='Pending Approval').length,
    draft: baseDocs.filter(d=>d.status==='Draft').length,
  };

  return React.createElement('div', null,
    React.createElement('h1', {className:'mainTitle', style:{marginTop:0,marginBottom:16}}, title),
    React.createElement('div', {className:'white-card-section'},
      React.createElement('div', {className:'summary-cards-container', style:{marginBottom:0}},
        React.createElement(SummaryCard, {icon:'fas fa-file-alt',    title:'Total Documents', value:counts.total,    subtitle:'Documents',      color:'blue'}),
        React.createElement(SummaryCard, {icon:'fas fa-check-circle',title:'Approved',         value:counts.approved, subtitle:'Approved',       color:'green'}),
        React.createElement(SummaryCard, {icon:'fas fa-clock',       title:'Pending Review',   value:counts.pending,  subtitle:'Pending review', color:'orange'}),
        React.createElement(SummaryCard, {icon:'fas fa-pen',         title:'Drafts',           value:counts.draft,    subtitle:'In progress',    color:'purple'}),
      )
    ),
    React.createElement('div', {className:'white-card-section'},
      React.createElement('div', {className:'filter-row-4'},
        React.createElement('select', {className:'filter-select', value:statusFilter, onChange:e=>{setStatusFilter(e.target.value);setPage(1);}},
          ['All Status','Draft','Under Review','Pending Approval','Approved','Rejected','Signed'].map(v=>React.createElement('option',{key:v,value:v==='All Status'?'All':v},v))
        ),
        React.createElement('select', {className:'filter-select', value:categoryFilter, onChange:e=>{setCategoryFilter(e.target.value);setPage(1);}},
          ['All Categories','Administrative','Clinical','Nonclinical','Quality'].map(v=>React.createElement('option',{key:v,value:v==='All Categories'?'All':v},v))
        ),
        React.createElement('div'),
        React.createElement('button', {className:'btn btn-primary btn-sm', onClick:resetFilters},
          React.createElement('i',{className:'fas fa-rotate-left',style:{marginRight:6}}), 'Reset Filters'
        )
      )
    ),
    React.createElement(Breadcrumb, {items:[{label:title, active:true}]}),
    React.createElement('div', {className:'boxCard-demo', style:{margin:0}},
      React.createElement(GridToolbar, {
        search, onSearch:v=>{setSearch(v);setPage(1);},
        addLabel:'Add Document', onAdd:()=>showToast('Add Document'),
        onRefresh:()=>{resetFilters();showToast('Refreshed');},
        editBtns: selected.length > 0 ? React.createElement('div', {className:'dfs', style:{marginLeft:8}},
          selected.length===1 && React.createElement('button', {className:'act-btn edit', title:'Edit'}, React.createElement('i',{className:'fas fa-pen-to-square'})),
          React.createElement('button', {className:'act-btn del', title:'Delete', onClick:()=>setDeleteTarget(selected)}, React.createElement('i',{className:'fas fa-trash-can'}))
        ) : null
      }),
      React.createElement('table', {className:'dms-table'},
        React.createElement('thead', null,
          React.createElement('tr', null,
            React.createElement('th', {style:{width:36}}, ''),
            ['Document Name','Category','Drug','Author','Status','Date','Action'].map(h=>React.createElement('th',{key:h},h))
          )
        ),
        React.createElement('tbody', null,
          paged.map(d => {
            const fi = fileIcon(d.ext);
            return React.createElement('tr', {key:d.id},
              React.createElement('td', null, React.createElement('input',{type:'checkbox',checked:selected.includes(d.id),onChange:()=>toggleSelect(d.id)})),
              React.createElement('td', null, React.createElement('div',{className:'dfs'},React.createElement('div',{className:'file-icon '+fi.cls},React.createElement('i',{className:fi.icon})),React.createElement('span',{style:{marginLeft:8}},d.name))),
              React.createElement('td', null, d.category),
              React.createElement('td', null, d.drug),
              React.createElement('td', null, d.author),
              React.createElement('td', null, React.createElement(StatusBadge, {status:d.status})),
              React.createElement('td', null, d.date),
              React.createElement('td', null, React.createElement('button',{className:'act-btn view',onClick:()=>setViewDoc(d)},React.createElement('i',{className:'fas fa-eye'})))
            );
          })
        )
      ),
      React.createElement(Pagination, {total:filtered.length, page, perPage:6, onChange:setPage})
    ),
    deleteTarget && React.createElement(ConfirmModal, {
      title:'Delete Document(s)', message:'This document will be permanently deleted. Are you sure?',
      onConfirm:()=>{ setDeleteTarget(null); showToast('Deleted','error'); },
      onCancel:()=>setDeleteTarget(null)
    }),
    viewDoc && React.createElement(Panel, {
      title: viewDoc.name, onClose:()=>setViewDoc(null),
      footer:[
        React.createElement('button',{key:'d',className:'btn btn-primary'},React.createElement('i',{className:'fas fa-download',style:{marginRight:6}}),'Download'),
        React.createElement('button',{key:'e',className:'btn btn-secondary'},React.createElement('i',{className:'fas fa-pen-to-square',style:{marginRight:6}}),'Edit'),
        React.createElement('button',{key:'del',className:'btn btn-danger',onClick:()=>setViewDoc(null)},React.createElement('i',{className:'fas fa-trash-can',style:{marginRight:6}}),'Delete'),
        React.createElement('button',{key:'c',className:'btn btn-secondary',onClick:()=>setViewDoc(null)},'Close'),
      ]
    },
      React.createElement('div',{className:'detail-grid'},
        [['Category',viewDoc.category],['Author',viewDoc.author],['Drug',viewDoc.drug],['Version',viewDoc.ver],['Date',viewDoc.date],['Approver',viewDoc.approver||'-']].map(([k,v])=>
          React.createElement('div',{key:k,className:'detail-item'},React.createElement('div',{className:'dl'},k),React.createElement('div',{className:'dv'},v))
        ),
        React.createElement('div',{className:'detail-item'},React.createElement('div',{className:'dl'},'Status'),React.createElement(StatusBadge,{status:viewDoc.status}))
      )
    )
  );
}

/* ===================================================
   SCREEN: CTD VIEW
=================================================== */
function CTDView() {
  const [activeNode, setActiveNode] = useState('m5-1');
  const [search, setSearch] = useState('');
  const active = CTD_TREE.find(n=>n.id===activeNode);
  const nodeDocs = DOCS.filter(d=>d.category==='Clinical');
  const filtered = nodeDocs.filter(d=>d.name.toLowerCase().includes(search.toLowerCase()));

  return React.createElement('div',null,
    React.createElement('h1',{className:'mainTitle',style:{marginTop:0,marginBottom:16}},'CTD View'),
    React.createElement('div',{className:'white-card-section'},
      React.createElement('div',{className:'summary-cards-container',style:{marginBottom:0}},
        React.createElement(SummaryCard,{icon:'fas fa-layer-group',  title:'Total Modules', value:5,            subtitle:'CTD modules',     color:'blue'}),
        React.createElement(SummaryCard,{icon:'fas fa-folder-tree',  title:'Root Modules',  value:5,            subtitle:'Top-level',       color:'purple'}),
        React.createElement(SummaryCard,{icon:'fas fa-check-circle', title:'Active',        value:5,            subtitle:'Active modules',  color:'green'}),
        React.createElement(SummaryCard,{icon:'fas fa-folder-minus', title:'Inactive',      value:0,            subtitle:'Inactive',        color:'orange'}),
      )
    ),
    React.createElement(Breadcrumb,{items:[{label:'CTD View',active:true}]}),
    React.createElement('div',{className:'ctd-layout'},
      React.createElement('div',{className:'ctd-tree'},
        CTD_TREE.map(n=>
          React.createElement('div',{
            key:n.id,
            className:'ctd-tree-item'+(n.isModule?' module':'')+(n.id===activeNode?' active':''),
            style:{ paddingLeft: n.isModule ? 12 : 24 },
            onClick:()=>!n.isModule&&setActiveNode(n.id)
          },
            React.createElement('i',{className:n.isModule?'fas fa-layer-group':'fas fa-folder',style:{marginRight:6}}),
            n.label
          )
        )
      ),
      React.createElement('div',{className:'boxCard-demo',style:{margin:0}},
        React.createElement(GridToolbar,{
          search, onSearch:v=>setSearch(v),
          addLabel:'Add Document', onAdd:()=>showToast('Add Document'),
          onRefresh:()=>{ setSearch(''); showToast('Refreshed'); },
          editBtns:null
        }),
        React.createElement('table',{className:'dms-table'},
          React.createElement('thead',null,React.createElement('tr',null,
            React.createElement('th',{style:{width:36}},''),
            ['Document Name','Author','Status','Date','Action'].map(h=>React.createElement('th',{key:h},h))
          )),
          React.createElement('tbody',null,
            filtered.length > 0 ? filtered.map(d=>{
              const fi=fileIcon(d.ext);
              return React.createElement('tr',{key:d.id},
                React.createElement('td',null,React.createElement('input',{type:'checkbox',readOnly:true})),
                React.createElement('td',null,React.createElement('div',{className:'dfs'},React.createElement('div',{className:'file-icon '+fi.cls},React.createElement('i',{className:fi.icon})),React.createElement('span',{style:{marginLeft:8}},d.name))),
                React.createElement('td',null,d.author),
                React.createElement('td',null,React.createElement(StatusBadge,{status:d.status})),
                React.createElement('td',null,d.date),
                React.createElement('td',null,React.createElement('button',{className:'act-btn view'},React.createElement('i',{className:'fas fa-eye'})))
              );
            }) : React.createElement('tr',null,React.createElement('td',{colSpan:6,style:{textAlign:'center',color:'#999',padding:24}},'No documents found'))
          )
        )
      )
    )
  );
}

/* ===================================================
   SCREEN: MANAGE USERS
=================================================== */
function ManageUsers() {
  const [users, setUsers] = useState(USERS);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);

  const resetFilters = () => { setRoleFilter('All'); setStatusFilter('All'); setSearch(''); setPage(1); };
  const filtered = users.filter(u=>
    (u.name.toLowerCase().includes(search.toLowerCase())||u.email.toLowerCase().includes(search.toLowerCase())) &&
    (roleFilter==='All'||u.role===roleFilter) &&
    (statusFilter==='All'||u.status===statusFilter)
  );
  const paged = filtered.slice((page-1)*6,page*6);
  const counts = {total:users.length,active:users.filter(u=>u.status==='Active').length,admins:users.filter(u=>u.role==='Admin').length,authors:users.filter(u=>u.role==='Author').length};
  const toggleSelect = id=>setSelected(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);

  return React.createElement('div',null,
    React.createElement('h1',{className:'mainTitle',style:{marginTop:0,marginBottom:16}},'Manage Users'),
    React.createElement('div',{className:'white-card-section'},
      React.createElement('div',{className:'summary-cards-container',style:{marginBottom:0}},
        React.createElement(SummaryCard,{icon:'fas fa-users',       title:'Total Users',  value:counts.total,   subtitle:'All users',    color:'blue'}),
        React.createElement(SummaryCard,{icon:'fas fa-user-check',  title:'Active Users', value:counts.active,  subtitle:'Active',       color:'green'}),
        React.createElement(SummaryCard,{icon:'fas fa-user-shield', title:'Admins',       value:counts.admins,  subtitle:'Admin role',   color:'purple'}),
        React.createElement(SummaryCard,{icon:'fas fa-user-pen',    title:'Authors',      value:counts.authors, subtitle:'Author role',  color:'orange'}),
      )
    ),
    React.createElement('div',{className:'white-card-section'},
      React.createElement('div',{className:'filter-row-4'},
        React.createElement('select',{className:'filter-select',value:roleFilter,onChange:e=>{setRoleFilter(e.target.value);setPage(1);}},
          ['All Roles','Admin','Author','Reviewer','Approver','HR'].map(v=>React.createElement('option',{key:v,value:v==='All Roles'?'All':v},v))
        ),
        React.createElement('select',{className:'filter-select',value:statusFilter,onChange:e=>{setStatusFilter(e.target.value);setPage(1);}},
          ['All Status','Active','Inactive'].map(v=>React.createElement('option',{key:v,value:v==='All Status'?'All':v},v))
        ),
        React.createElement('div'),
        React.createElement('button',{className:'btn btn-primary btn-sm',onClick:resetFilters},React.createElement('i',{className:'fas fa-rotate-left',style:{marginRight:6}}),'Reset Filters')
      )
    ),
    React.createElement(Breadcrumb,{items:[{label:'Manage Users',active:true}]}),
    React.createElement('div',{className:'boxCard-demo',style:{margin:0}},
      React.createElement(GridToolbar,{
        search,onSearch:v=>{setSearch(v);setPage(1);},
        onAdd:()=>showToast('Add User'),
        onRefresh:()=>{resetFilters();showToast('Refreshed');},
        editBtns:selected.length>0?React.createElement('div',{className:'dfs',style:{marginLeft:8}},
          selected.length===1&&React.createElement('button',{className:'act-btn edit'},React.createElement('i',{className:'fas fa-pen-to-square'})),
          React.createElement('button',{className:'act-btn del',onClick:()=>{ setUsers(users.filter(u=>!selected.includes(u.id))); setSelected([]); showToast('User(s) removed','error'); }},React.createElement('i',{className:'fas fa-trash-can'}))
        ):null
      }),
      React.createElement('table',{className:'dms-table'},
        React.createElement('thead',null,
          React.createElement('tr',null,
            React.createElement('th',{style:{width:36}},''),
            ['Name','Email','Role','Status','Last Login','Action'].map(h=>React.createElement('th',{key:h},h))
          )
        ),
        React.createElement('tbody',null,
          paged.map(u=>React.createElement('tr',{key:u.id},
            React.createElement('td',null,React.createElement('input',{type:'checkbox',checked:selected.includes(u.id),onChange:()=>toggleSelect(u.id)})),
            React.createElement('td',null,
              React.createElement('div',{className:'dfs'},
                React.createElement('div',{style:{width:32,height:32,borderRadius:'50%',background:'#1E88E5',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:600,fontSize:13,flexShrink:0}},
                  u.name.split(' ').map(n=>n[0]).join('')
                ),
                React.createElement('span',{style:{marginLeft:10,fontWeight:500}},u.name)
              )
            ),
            React.createElement('td',null,u.email),
            React.createElement('td',null,
              React.createElement('span',{className:'role-tag role-'+u.role.toLowerCase()},u.role)
            ),
            React.createElement('td',null,React.createElement(StatusBadge,{status:u.status})),
            React.createElement('td',null,u.last),
            React.createElement('td',null,React.createElement('button',{className:'act-btn edit'},React.createElement('i',{className:'fas fa-pen-to-square'})))
          ))
        )
      ),
      React.createElement(Pagination,{total:filtered.length,page,perPage:6,onChange:setPage})
    )
  );
}

/* ===================================================
   SCREEN: CTD FOLDER STRUCTURE (CREATE CTD FOLDER)
=================================================== */
function CTDFolderStructure() {
  const [selected, setSelected] = useState([]);
  const toggleSelect = id => setSelected(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);
  return React.createElement('div',null,
    React.createElement('h1',{className:'mainTitle',style:{marginTop:0,marginBottom:16}},'CTD Folder Structure'),
    React.createElement('div',{className:'white-card-section'},
      React.createElement('div',{className:'summary-cards-container',style:{marginBottom:0}},
        React.createElement(SummaryCard,{icon:'fas fa-layer-group',  title:'Total Modules', value:5, subtitle:'CTD modules',    color:'blue'}),
        React.createElement(SummaryCard,{icon:'fas fa-folder-tree',  title:'Root Modules',  value:5, subtitle:'Top-level',      color:'purple'}),
        React.createElement(SummaryCard,{icon:'fas fa-check-circle', title:'Active',        value:5, subtitle:'Active modules', color:'green'}),
        React.createElement(SummaryCard,{icon:'fas fa-folder-minus', title:'Inactive',      value:0, subtitle:'Inactive',       color:'orange'}),
      )
    ),
    React.createElement(Breadcrumb,{items:[{label:'CTD Folder Structure',active:true}]}),
    React.createElement('div',{className:'boxCard-demo',style:{margin:0}},
      React.createElement(GridToolbar,{
        search:'', onSearch:()=>{},
        addLabel:'Add Folder', onAdd:()=>showToast('Add Folder'),
        onRefresh:()=>showToast('Refreshed'),
        editBtns: selected.length>0 ? React.createElement('div',{className:'dfs',style:{marginLeft:8}},
          selected.length===1&&React.createElement('button',{className:'act-btn edit'},React.createElement('i',{className:'fas fa-pen-to-square'})),
          React.createElement('button',{className:'act-btn del'},React.createElement('i',{className:'fas fa-trash-can'}))
        ):null
      }),
      React.createElement('table',{className:'dms-table'},
        React.createElement('thead',null,React.createElement('tr',null,
          React.createElement('th',{style:{width:36}},''),
          ['Module','Description','Documents','Status','Action'].map(h=>React.createElement('th',{key:h},h))
        )),
        React.createElement('tbody',null,
          CTD_TREE.map(n=>React.createElement('tr',{key:n.id},
            React.createElement('td',null,React.createElement('input',{type:'checkbox',checked:selected.includes(n.id),onChange:()=>toggleSelect(n.id)})),
            React.createElement('td',null,
              React.createElement('div',{className:'dfs',style:{paddingLeft:n.isModule?0:20}},
                React.createElement('i',{className:n.isModule?'fas fa-layer-group':'fas fa-folder',style:{color:n.isModule?'#1B2A4A':'#FF9800',marginRight:8}}),
                React.createElement('span',{style:{fontWeight:n.isModule?600:400}},n.label)
              )
            ),
            React.createElement('td',null,n.isModule?'CTD Module':'Sub-section'),
            React.createElement('td',null,n.docs+' docs'),
            React.createElement('td',null,React.createElement(StatusBadge,{status:'Active'})),
            React.createElement('td',null,
              React.createElement('div',{className:'dfs'},
                React.createElement('button',{className:'act-btn view'},React.createElement('i',{className:'fas fa-eye'})),
                React.createElement('button',{className:'act-btn edit'},React.createElement('i',{className:'fas fa-pen-to-square'}))
              )
            )
          ))
        )
      )
    )
  );
}

/* ===================================================
   SCREEN: REPORTS
=================================================== */
function Reports() {
  return React.createElement('div',null,
    React.createElement('h1',{className:'mainTitle',style:{marginTop:0,marginBottom:16}},'Document Reports'),
    React.createElement('div',{className:'white-card-section'},
      React.createElement('div',{className:'summary-cards-container',style:{marginBottom:0}},
        React.createElement(SummaryCard,{icon:'fas fa-chart-pie',    title:'Total Reports', value:14,  subtitle:'All reports',      color:'blue'}),
        React.createElement(SummaryCard,{icon:'fas fa-chart-line',   title:'Workflow',      value:6,   subtitle:'Workflow reports', color:'green'}),
        React.createElement(SummaryCard,{icon:'fas fa-chart-bar',    title:'Usage',         value:5,   subtitle:'Usage reports',    color:'orange'}),
        React.createElement(SummaryCard,{icon:'fas fa-file-export',  title:'Exports',       value:3,   subtitle:'Exported',         color:'purple'}),
      )
    ),
    React.createElement(Breadcrumb,{items:[{label:'Document Reports',active:true}]}),
    React.createElement('div',{className:'boxCard-demo',style:{padding:24}},
      React.createElement('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}},
        [['Document Status Distribution','fas fa-chart-pie'],['Monthly Uploads','fas fa-chart-bar'],['Approval Rate','fas fa-chart-line'],['User Activity','fas fa-users']].map(([t,ic])=>
          React.createElement('div',{key:t,style:{background:'#f9f9f9',borderRadius:8,padding:20,border:'1px solid #eee'}},
            React.createElement('div',{style:{display:'flex',alignItems:'center',gap:10,marginBottom:16}},
              React.createElement('i',{className:ic,style:{color:'#1E88E5',fontSize:18}}),
              React.createElement('span',{style:{fontWeight:600,color:'#1B2A4A',fontSize:15}},t)
            ),
            React.createElement('div',{style:{height:120,display:'flex',alignItems:'flex-end',gap:8}},
              [65,45,30,80,55,40].map((h,i)=>
                React.createElement('div',{key:i,style:{flex:1,height:h+'%',background:'#1E88E5',borderRadius:'4px 4px 0 0',opacity:0.7+i*0.05}})
              )
            )
          )
        )
      )
    )
  );
}

/* ===================================================
   MAIN APP SHELL
=================================================== */
const NAV_ITEMS = [
  { id:'dashboard',          label:'Dashboard',           icon:'fas fa-chart-pie' },
  { id:'__master',           label:'MASTER',              isSection:true },
  { id:'categories',         label:'Categories',          icon:'fas fa-folder' },
  { id:'templates',          label:'Templates',           icon:'fas fa-file-alt' },
  { id:'createCTDFolder',    label:'CTD Folder Structure',icon:'fas fa-folder-tree' },
  { id:'drugsDatabase',      label:'Drugs',               icon:'fas fa-capsules' },
  { id:'__documents',        label:'DOCUMENTS',           isSection:true },
  { id:'allDocuments',       label:'All Documents',       icon:'fas fa-file' },
  { id:'myDocuments',        label:'My Documents',        icon:'fas fa-file-user' },
  { id:'assignedToMe',       label:'Assigned to Me',      icon:'fas fa-file-circle-check' },
  { id:'ctdView',            label:'CTD View',            icon:'fas fa-sitemap' },
  { id:'reports',            label:'Document Reports',    icon:'fas fa-chart-line' },
  { id:'workflowReports',    label:'Workflow Reports',    icon:'fas fa-chart-bar' },
  { id:'__users',            label:'USERS',               isSection:true },
  { id:'users',              label:'Manage Users',        icon:'fas fa-users' },
];

function App() {
  const [view, setView] = useState('dashboard');
  const [role, setRole] = useState('Admin');

  const renderScreen = () => {
    switch(view) {
      case 'dashboard':       return React.createElement(AdminDashboard);
      case 'templates':       return React.createElement(ManageTemplates);
      case 'categories':      return React.createElement(ManageCategories);
      case 'drugsDatabase':   return React.createElement(DrugsDatabase);
      case 'allDocuments':    return React.createElement(AllDocuments, {role});
      case 'myDocuments':     return React.createElement(AllDocuments, {filterUser:true, role});
      case 'assignedToMe':    return React.createElement(AllDocuments, {filterPending:true, role});
      case 'ctdView':         return React.createElement(CTDView);
      case 'createCTDFolder': return React.createElement(CTDFolderStructure);
      case 'reports':
      case 'workflowReports': return React.createElement(Reports);
      case 'users':           return React.createElement(ManageUsers);
      default:                return React.createElement(AdminDashboard);
    }
  };

  return React.createElement('div', { className: 'app' },
    /* ── HEADER ── */
    React.createElement('header', { className: 'header' },
      React.createElement('div', { className: 'header-title' }, 'Drug Management System'),
      React.createElement('div', { className: 'header-right' },
        React.createElement('div', { style:{ display:'flex', alignItems:'center', gap:8 } },
          React.createElement('label', { style:{fontSize:13,color:'#666'} }, 'Role:'),
          React.createElement('select', {
            value: role,
            onChange: e => { setRole(e.target.value); setView('dashboard'); },
            style:{ padding:'5px 10px', border:'1px solid #d0d0d0', borderRadius:6, fontSize:13, cursor:'pointer' }
          },
            ['Admin','Author','Reviewer','Approver','HR'].map(r => React.createElement('option',{key:r,value:r},r))
          )
        ),
        React.createElement('div', { className: 'user-info' },
          React.createElement('div', { className: 'user-details' },
            React.createElement('div', { className: 'user-name' }, 'John Smith'),
            React.createElement('div', { className: 'user-role' }, role)
          ),
          React.createElement('div', { className: 'user-avatar' }, 'JS')
        )
      )
    ),
    /* ── SIDEBAR ── */
    React.createElement('nav', { className: 'sidebar' },
      React.createElement('div', { className: 'nav-section' },
        NAV_ITEMS.map(item =>
          item.isSection
            ? React.createElement('div', { key: item.id, className: 'nav-section-title' }, item.label)
            : React.createElement('div', {
                key: item.id,
                className: 'nav-item' + (view === item.id ? ' active' : ''),
                onClick: () => setView(item.id)
              },
                React.createElement('i', { className: item.icon + ' nav-icon' }),
                React.createElement('span', { className: 'nav-label' }, item.label)
              )
        )
      )
    ),
    /* ── MAIN CONTENT ── */
    React.createElement('main', { className: 'main-content' },
      renderScreen()
    )
  );
}

ReactDOM.render(React.createElement(App), document.getElementById('root'));
</script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  const reqUrl = req.url.split('?')[0];

  if (reqUrl === '/app.css') {
    res.writeHead(200, { 'Content-Type': 'text/css' });
    return res.end(appCss);
  }
  if (reqUrl === '/styles.css') {
    res.writeHead(200, { 'Content-Type': 'text/css' });
    return res.end(stylesCss);
  }
  if (reqUrl === '/ui-professional.css') {
    res.writeHead(200, { 'Content-Type': 'text/css' });
    return res.end(uiCss);
  }
  if (reqUrl === '/enhanced-styles.css') {
    res.writeHead(200, { 'Content-Type': 'text/css' });
    return res.end(enhancedCss);
  }

  /* serve static assets (fonts, images) */
  const assetsBase = path.join(__dirname, 'src/webparts/drugManagementSystem/assets');
  const candidate = path.join(assetsBase, reqUrl);
  if (reqUrl !== '/' && !reqUrl.includes('..') && fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
    const ext = path.extname(candidate);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    return res.end(fs.readFileSync(candidate));
  }

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(HTML);
});

server.listen(PORT, HOST, () => {
  console.log('Drug Management System running at http://' + HOST + ':' + PORT);
});
