const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 5000;
const HOST = '0.0.0.0';

const MIME_TYPES = {
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

const appCss = fs.readFileSync(
  path.join(__dirname, 'src/webparts/drugManagementSystem/components/Custom/styles/app.css'),
  'utf8'
);
const uiCss = fs.readFileSync(
  path.join(__dirname, 'src/webparts/drugManagementSystem/components/Custom/styles/ui-professional.css'),
  'utf8'
);
const enhancedCss = fs.readFileSync(
  path.join(__dirname, 'src/webparts/drugManagementSystem/components/Custom/styles/enhanced-styles.css'),
  'utf8'
);

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Drug Management System</title>
  <link rel="stylesheet" href="/app.css">
  <link rel="stylesheet" href="/ui-professional.css">
  <link rel="stylesheet" href="/enhanced-styles.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
  <style>
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .loading-screen {
      display: flex; align-items: center; justify-content: center;
      height: 100vh; background: #f5f5f5; flex-direction: column; gap: 16px;
    }
    .spinner {
      width: 40px; height: 40px; border: 4px solid #e0e0e0;
      border-top-color: #1E88E5; border-radius: 50%; animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 1000;
      display: flex; align-items: center; justify-content: center;
    }
    .modal-box {
      background: white; border-radius: 8px; padding: 28px 32px;
      min-width: 420px; max-width: 600px; box-shadow: 0 8px 40px rgba(0,0,0,0.18);
      max-height: 80vh; overflow-y: auto;
    }
    .modal-box h2 { font-size: 18px; margin-bottom: 20px; color: #1B2A4A; }
    .modal-box label { font-size: 13px; color: #555; display: block; margin-bottom: 4px; margin-top: 14px; }
    .modal-box input, .modal-box select, .modal-box textarea {
      width: 100%; padding: 8px 12px; border: 1px solid #d0d0d0; border-radius: 4px;
      font-size: 14px; box-sizing: border-box;
    }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 22px; }
    .btn-primary {
      background: #1E88E5; color: white; border: none; padding: 9px 20px;
      border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 500;
    }
    .btn-primary:hover { background: #1565C0; }
    .btn-secondary {
      background: white; color: #444; border: 1px solid #ccc; padding: 9px 20px;
      border-radius: 4px; cursor: pointer; font-size: 14px;
    }
    .btn-secondary:hover { background: #f5f5f5; }
    .stat-card {
      background: white; border-radius: 8px; padding: 20px 24px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08); display: flex; align-items: center; gap: 16px;
    }
    .stat-icon { font-size: 32px; width: 56px; height: 56px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center; }
    .stat-info h3 { font-size: 28px; font-weight: 700; margin: 0 0 4px; color: #1B2A4A; }
    .stat-info p { font-size: 13px; color: #777; margin: 0; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th {
      background: #f5f5f5; padding: 10px 14px; text-align: left;
      font-size: 12px; font-weight: 600; color: #555; text-transform: uppercase;
      letter-spacing: 0.5px; border-bottom: 2px solid #e0e0e0;
    }
    .data-table td { padding: 10px 14px; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
    .data-table tr:hover td { background: #fafafa; }
    .data-table-wrap { background: white; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); overflow: hidden; }
    .table-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #f0f0f0; }
    .table-header h3 { font-size: 16px; font-weight: 600; color: #1B2A4A; margin: 0; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; }
    .badge-draft { background: #f0f0f0; color: #555; }
    .badge-review { background: #fff3cd; color: #856404; }
    .badge-approved { background: #d1e7dd; color: #0a3622; }
    .badge-rejected { background: #f8d7da; color: #58151c; }
    .badge-pending { background: #cce5ff; color: #004085; }
    .search-bar { display: flex; gap: 10px; margin-bottom: 16px; }
    .search-bar input { flex: 1; padding: 9px 14px; border: 1px solid #d0d0d0; border-radius: 6px; font-size: 14px; outline: none; }
    .search-bar input:focus { border-color: #1E88E5; }
    .action-btn { background: none; border: none; cursor: pointer; padding: 4px 8px; border-radius: 4px; color: #666; font-size: 14px; }
    .action-btn:hover { background: #f0f0f0; color: #1E88E5; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: 13px; font-weight: 500; color: #444; margin-bottom: 6px; }
    .form-group input, .form-group select, .form-group textarea {
      width: 100%; padding: 9px 12px; border: 1px solid #d0d0d0; border-radius: 6px;
      font-size: 14px; box-sizing: border-box; outline: none;
    }
    .form-group input:focus, .form-group select:focus { border-color: #1E88E5; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .toast-container { position: fixed; top: 70px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 8px; }
    .toast { background: white; border-radius: 6px; padding: 12px 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      display: flex; align-items: center; gap: 10px; min-width: 280px; font-size: 14px;
      animation: slideIn 0.3s ease; border-left: 4px solid #1E88E5; }
    .toast.success { border-left-color: #4CAF50; }
    .toast.error { border-left-color: #F44336; }
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    .workflow-timeline { display: flex; align-items: center; gap: 0; margin: 16px 0; }
    .workflow-step {
      display: flex; flex-direction: column; align-items: center; flex: 1; position: relative;
    }
    .workflow-step::after {
      content: ''; position: absolute; left: 50%; top: 20px;
      width: 100%; height: 2px; background: #e0e0e0; z-index: 0;
    }
    .workflow-step:last-child::after { display: none; }
    .step-circle {
      width: 40px; height: 40px; border-radius: 50%; background: #e0e0e0;
      display: flex; align-items: center; justify-content: center; font-size: 16px;
      z-index: 1; margin-bottom: 8px;
    }
    .step-circle.done { background: #4CAF50; color: white; }
    .step-circle.active { background: #1E88E5; color: white; }
    .step-label { font-size: 12px; color: #666; text-align: center; }
    .card-section { background: white; border-radius: 8px; padding: 20px 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); margin-bottom: 20px; }
    .card-section h3 { font-size: 16px; font-weight: 600; color: #1B2A4A; margin: 0 0 16px; }
    .role-badge {
      display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px;
      border-radius: 20px; font-size: 13px; font-weight: 500;
    }
    .role-admin { background: #1B2A4A; color: white; }
    .role-author { background: #2E7D32; color: white; }
    .role-reviewer { background: #E65100; color: white; }
    .role-approver { background: #4527A0; color: white; }
    .empty-state { text-align: center; padding: 60px 20px; color: #999; }
    .empty-state i { font-size: 48px; margin-bottom: 16px; display: block; }
    .nav-role-selector { padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 8px; }
    .nav-role-selector label { font-size: 10px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px; }
    .nav-role-selector select {
      width: 100%; padding: 6px 10px; background: rgba(255,255,255,0.1); color: white;
      border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; font-size: 13px; cursor: pointer;
    }
    .nav-role-selector select option { background: #1B2A4A; }
    .report-chart { background: white; border-radius: 8px; padding: 20px 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
    .chart-bars { display: flex; align-items: flex-end; gap: 12px; height: 150px; margin-top: 16px; }
    .chart-bar-wrap { display: flex; flex-direction: column; align-items: center; flex: 1; gap: 6px; }
    .chart-bar { width: 100%; border-radius: 4px 4px 0 0; transition: height 0.5s ease; min-width: 30px; }
    .chart-bar-label { font-size: 11px; color: #888; }
    .chart-bar-val { font-size: 12px; font-weight: 600; color: #444; }
  </style>
</head>
<body>
<div id="root"></div>
<div id="toasts" class="toast-container"></div>
<script crossorigin src="https://unpkg.com/react@17/umd/react.development.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
<script>
const { useState, useEffect, useCallback, useMemo, useRef } = React;

// ========= MOCK DATA =========
const MOCK_DOCS = [
  { id:1, name:'Aspirin_Module2_Clinical_Study.docx', category:'Clinical', status:'Approved', lastModified:'2026-03-10', author:'John Smith', drug:'Aspirin', version:'2.1' },
  { id:2, name:'Paracetamol_Nonclinical_Safety.docx', category:'Nonclinical', status:'Under Review', lastModified:'2026-03-08', author:'Sarah Johnson', drug:'Paracetamol', version:'1.0' },
  { id:3, name:'Ibuprofen_Quality_Summary.docx', category:'Quality', status:'Draft', lastModified:'2026-03-07', author:'Mike Davis', drug:'Ibuprofen', version:'1.2' },
  { id:4, name:'Metformin_CTD_Module3.docx', category:'Quality', status:'Pending Approval', lastModified:'2026-03-05', author:'Emily Wilson', drug:'Metformin', version:'3.0' },
  { id:5, name:'Amoxicillin_Module1_Admin.docx', category:'Administrative', status:'Approved', lastModified:'2026-03-04', author:'Tom Brown', drug:'Amoxicillin', version:'1.5' },
  { id:6, name:'Lisinopril_Efficacy_Report.docx', category:'Clinical', status:'Draft', lastModified:'2026-03-02', author:'Anna Lee', drug:'Lisinopril', version:'1.0' },
  { id:7, name:'Omeprazole_Safety_Review.docx', category:'Nonclinical', status:'Under Review', lastModified:'2026-02-28', author:'Chris Martin', drug:'Omeprazole', version:'2.0' },
  { id:8, name:'Atorvastatin_Label.docx', category:'Administrative', status:'Approved', lastModified:'2026-02-25', author:'Lisa Chen', drug:'Atorvastatin', version:'4.1' },
];

const MOCK_USERS = [
  { id:1, name:'John Smith', email:'john.smith@pharma.com', role:'Admin', status:'Active', lastLogin:'2026-03-15' },
  { id:2, name:'Sarah Johnson', email:'sarah.j@pharma.com', role:'Author', status:'Active', lastLogin:'2026-03-14' },
  { id:3, name:'Mike Davis', email:'mike.davis@pharma.com', role:'Reviewer', status:'Active', lastLogin:'2026-03-13' },
  { id:4, name:'Emily Wilson', email:'emily.w@pharma.com', role:'Approver', status:'Active', lastLogin:'2026-03-12' },
  { id:5, name:'Tom Brown', email:'tom.brown@pharma.com', role:'Author', status:'Inactive', lastLogin:'2026-03-01' },
  { id:6, name:'Anna Lee', email:'anna.lee@pharma.com', role:'Reviewer', status:'Active', lastLogin:'2026-03-10' },
];

const MOCK_CATEGORIES = [
  { id:1, name:'Administrative', group:'Module 1', level:1, documents:12, status:'Active' },
  { id:2, name:'Clinical', group:'Module 5', level:1, documents:34, status:'Active' },
  { id:3, name:'Nonclinical', group:'Module 4', level:1, documents:18, status:'Active' },
  { id:4, name:'Quality', group:'Module 3', level:1, documents:27, status:'Active' },
  { id:5, name:'Summary Documents', group:'Module 2', level:2, documents:8, status:'Active' },
];

const MOCK_TEMPLATES = [
  { id:1, name:'Clinical Study Report Template', category:'Clinical', type:'Word', lastModified:'2026-01-15', status:'Active' },
  { id:2, name:'Nonclinical Overview Template', category:'Nonclinical', type:'Word', lastModified:'2026-01-10', status:'Active' },
  { id:3, name:'Quality Summary Template', category:'Quality', type:'Word', lastModified:'2025-12-20', status:'Active' },
  { id:4, name:'Investigator Brochure Template', category:'Clinical', type:'Word', lastModified:'2025-11-30', status:'Active' },
];

const MOCK_DRUGS = [
  { id:1, name:'Aspirin', genericName:'Acetylsalicylic Acid', indication:'Pain, Fever, Inflammation', status:'Active', phase:'Marketed' },
  { id:2, name:'Paracetamol', genericName:'Acetaminophen', indication:'Pain, Fever', status:'Active', phase:'Marketed' },
  { id:3, name:'Ibuprofen', genericName:'Ibuprofen', indication:'Pain, Inflammation', status:'Active', phase:'Phase III' },
  { id:4, name:'Metformin', genericName:'Metformin HCl', indication:'Type 2 Diabetes', status:'Active', phase:'Marketed' },
];

const MOCK_STATS = {
  totalDocuments: 89,
  templates: 12,
  categories: 24,
  users: 18,
  reviewPending: 11,
  approved: 45,
  drafts: 23,
  rejected: 10
};

const STATUS_COLORS = {
  'Approved': 'badge-approved',
  'Under Review': 'badge-review',
  'Draft': 'badge-draft',
  'Pending Approval': 'badge-pending',
  'Rejected': 'badge-rejected',
};

// ========= TOAST =========
function showToast(msg, type='success') {
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.innerHTML = '<i class="fas fa-' + (type==='success'?'check-circle':'exclamation-circle') + '" style="color:'+(type==='success'?'#4CAF50':'#F44336')+'"></i><span>' + msg + '</span>';
  document.getElementById('toasts').appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

// ========= COMPONENTS =========

function StatCard({ icon, label, value, color, bg }) {
  return React.createElement('div', { className: 'stat-card' },
    React.createElement('div', { className: 'stat-icon', style: { background: bg } },
      React.createElement('i', { className: icon, style: { color } })
    ),
    React.createElement('div', { className: 'stat-info' },
      React.createElement('h3', null, value),
      React.createElement('p', null, label)
    )
  );
}

function AdminDashboard() {
  const [docs, setDocs] = useState(MOCK_DOCS);
  const [search, setSearch] = useState('');
  const [showNewDoc, setShowNewDoc] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const filtered = docs.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.author.toLowerCase().includes(search.toLowerCase()));

  return React.createElement('div', null,
    React.createElement('div', { className: 'page-header' },
      React.createElement('h1', { className: 'page-title' }, 'Admin Dashboard'),
      React.createElement('p', { className: 'page-subtitle' }, 'Overview of all documents, users, and system activity')
    ),
    React.createElement('div', { className: 'stats-grid' },
      React.createElement(StatCard, { icon:'fas fa-file-alt', label:'Total Documents', value:MOCK_STATS.totalDocuments, color:'#1E88E5', bg:'#E3F2FD' }),
      React.createElement(StatCard, { icon:'fas fa-check-circle', label:'Approved', value:MOCK_STATS.approved, color:'#4CAF50', bg:'#E8F5E9' }),
      React.createElement(StatCard, { icon:'fas fa-clock', label:'Pending Review', value:MOCK_STATS.reviewPending, color:'#FF9800', bg:'#FFF3E0' }),
      React.createElement(StatCard, { icon:'fas fa-edit', label:'Drafts', value:MOCK_STATS.drafts, color:'#9E9E9E', bg:'#FAFAFA' }),
      React.createElement(StatCard, { icon:'fas fa-users', label:'Active Users', value:MOCK_STATS.users, color:'#7B1FA2', bg:'#F3E5F5' }),
      React.createElement(StatCard, { icon:'fas fa-folder', label:'Categories', value:MOCK_STATS.categories, color:'#E65100', bg:'#FBE9E7' }),
    ),
    React.createElement('div', { className: 'data-table-wrap' },
      React.createElement('div', { className: 'table-header' },
        React.createElement('h3', null, 'Recent Documents'),
        React.createElement('div', { style:{display:'flex',gap:10} },
          React.createElement('input', {
            placeholder:'Search documents...',
            value: search,
            onChange: e => setSearch(e.target.value),
            style:{padding:'7px 12px',border:'1px solid #ddd',borderRadius:6,fontSize:14,outline:'none',width:220}
          }),
          React.createElement('button', { className:'btn-primary', style:{fontSize:13,padding:'7px 14px'}, onClick:()=>setShowNewDoc(true) },
            React.createElement('i', {className:'fas fa-plus',style:{marginRight:6}}), 'New Document'
          )
        )
      ),
      React.createElement('table', { className:'data-table' },
        React.createElement('thead', null,
          React.createElement('tr', null,
            React.createElement('th', null, 'Document Name'),
            React.createElement('th', null, 'Category'),
            React.createElement('th', null, 'Author'),
            React.createElement('th', null, 'Status'),
            React.createElement('th', null, 'Last Modified'),
            React.createElement('th', null, 'Actions'),
          )
        ),
        React.createElement('tbody', null,
          filtered.map(doc =>
            React.createElement('tr', { key: doc.id },
              React.createElement('td', null,
                React.createElement('div', {style:{display:'flex',alignItems:'center',gap:8}},
                  React.createElement('i', {className:'fas fa-file-word',style:{color:'#2B579A',fontSize:18}}),
                  React.createElement('span', {style:{fontWeight:500}}, doc.name)
                )
              ),
              React.createElement('td', null, doc.category),
              React.createElement('td', null, doc.author),
              React.createElement('td', null,
                React.createElement('span', { className:'badge ' + (STATUS_COLORS[doc.status] || 'badge-draft') }, doc.status)
              ),
              React.createElement('td', null, doc.lastModified),
              React.createElement('td', null,
                React.createElement('div', {style:{display:'flex',gap:4}},
                  React.createElement('button', { className:'action-btn', title:'View', onClick:()=>setSelectedDoc(doc) },
                    React.createElement('i', {className:'fas fa-eye'})
                  ),
                  React.createElement('button', { className:'action-btn', title:'Edit' },
                    React.createElement('i', {className:'fas fa-edit'})
                  ),
                  React.createElement('button', { className:'action-btn', title:'Delete', onClick:()=>{ setDocs(docs.filter(d=>d.id!==doc.id)); showToast('Document removed'); }},
                    React.createElement('i', {className:'fas fa-trash',style:{color:'#e53935'}})
                  ),
                )
              )
            )
          )
        )
      )
    ),
    showNewDoc && React.createElement(NewDocumentModal, { onClose:()=>setShowNewDoc(false), onSave:(doc)=>{ setDocs([{...doc,id:Date.now(),lastModified:new Date().toISOString().split('T')[0]},...docs]); setShowNewDoc(false); showToast('Document created successfully'); } }),
    selectedDoc && React.createElement(ViewDocumentModal, { doc: selectedDoc, onClose:()=>setSelectedDoc(null) })
  );
}

function NewDocumentModal({ onClose, onSave }) {
  const [form, setForm] = useState({ name:'', category:'Clinical', author:'John Smith', status:'Draft', drug:'Aspirin' });
  return React.createElement('div', { className:'modal-backdrop', onClick:e=>{ if(e.target===e.currentTarget) onClose(); } },
    React.createElement('div', { className:'modal-box' },
      React.createElement('h2', null, React.createElement('i',{className:'fas fa-plus-circle',style:{marginRight:10,color:'#1E88E5'}}),'Create New Document'),
      ['name','drug'].map(f =>
        React.createElement('div', {className:'form-group', key:f},
          React.createElement('label', null, f==='name'?'Document Name':'Drug Name'),
          React.createElement('input', { value:form[f], onChange:e=>setForm({...form,[f]:e.target.value}), placeholder:f==='name'?'Enter document name...':'Drug name' })
        )
      ),
      React.createElement('div', {className:'form-group'},
        React.createElement('label', null, 'Category'),
        React.createElement('select', {value:form.category, onChange:e=>setForm({...form,category:e.target.value})},
          ['Administrative','Clinical','Nonclinical','Quality','Summary Documents'].map(c=>React.createElement('option',{key:c},c))
        )
      ),
      React.createElement('div', {className:'form-group'},
        React.createElement('label', null, 'Status'),
        React.createElement('select', {value:form.status, onChange:e=>setForm({...form,status:e.target.value})},
          ['Draft','Under Review','Pending Approval'].map(s=>React.createElement('option',{key:s},s))
        )
      ),
      React.createElement('div', {className:'modal-actions'},
        React.createElement('button', {className:'btn-secondary',onClick:onClose},'Cancel'),
        React.createElement('button', {className:'btn-primary',onClick:()=>onSave(form)}, React.createElement('i',{className:'fas fa-save',style:{marginRight:6}}),'Create Document')
      )
    )
  );
}

function ViewDocumentModal({ doc, onClose }) {
  return React.createElement('div', { className:'modal-backdrop', onClick:e=>{ if(e.target===e.currentTarget) onClose(); } },
    React.createElement('div', { className:'modal-box' },
      React.createElement('div', {style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}},
        React.createElement('h2', {style:{margin:0}}, React.createElement('i',{className:'fas fa-file-word',style:{marginRight:10,color:'#2B579A'}}), doc.name),
        React.createElement('button', {className:'btn-secondary',onClick:onClose,style:{padding:'6px 14px'}},
          React.createElement('i',{className:'fas fa-times'})
        )
      ),
      React.createElement('div', {style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px 24px'}},
        ...[['Category',doc.category],['Author',doc.author],['Drug',doc.drug],['Version',doc.version||'1.0'],['Last Modified',doc.lastModified]].map(([k,v])=>
          React.createElement('div', {key:k},
            React.createElement('div', {style:{fontSize:12,color:'#888',marginBottom:3}}, k),
            React.createElement('div', {style:{fontSize:14,fontWeight:500}}, v)
          )
        ),
        React.createElement('div', {key:'status'},
          React.createElement('div', {style:{fontSize:12,color:'#888',marginBottom:3}}, 'Status'),
          React.createElement('span', {className:'badge '+(STATUS_COLORS[doc.status]||'badge-draft')}, doc.status)
        )
      ),
      React.createElement('div', {style:{marginTop:20}},
        React.createElement('div', {style:{fontSize:12,color:'#888',marginBottom:8}}, 'Workflow Progress'),
        React.createElement('div', {className:'workflow-timeline'},
          [['Draft','fas fa-edit','done'],['Under Review','fas fa-eye',doc.status==='Under Review'||doc.status==='Pending Approval'||doc.status==='Approved'?'done':''],['Pending Approval','fas fa-clock',doc.status==='Pending Approval'||doc.status==='Approved'?'done':''],['Approved','fas fa-check-circle',doc.status==='Approved'?'done':'']].map(([label,icon,cls])=>
            React.createElement('div', {className:'workflow-step',key:label},
              React.createElement('div', {className:'step-circle '+(cls==='done'?'done':'')},
                React.createElement('i', {className:icon})
              ),
              React.createElement('div', {className:'step-label'}, label)
            )
          )
        )
      ),
      React.createElement('div', {className:'modal-actions'},
        React.createElement('button', {className:'btn-secondary',onClick:onClose},'Close'),
        React.createElement('button', {className:'btn-primary'}, React.createElement('i',{className:'fas fa-download',style:{marginRight:6}}),'Download')
      )
    )
  );
}

function ManageDocuments({ filterPending, filterMine }) {
  const [docs, setDocs] = useState(MOCK_DOCS);
  const [search, setSearch] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const filteredDocs = docs.filter(d => {
    if (filterPending) return d.status === 'Pending Approval' || d.status === 'Under Review';
    if (filterMine) return d.author === 'John Smith';
    return d.name.toLowerCase().includes(search.toLowerCase());
  });
  return React.createElement('div', null,
    React.createElement('div', {className:'page-header'},
      React.createElement('h1', {className:'page-title'}, filterPending ? 'Assigned to Me' : filterMine ? 'My Documents' : 'All Documents'),
      React.createElement('p', {className:'page-subtitle'}, filteredDocs.length + ' documents')
    ),
    !filterPending && !filterMine && React.createElement('div', {className:'search-bar'},
      React.createElement('input', {placeholder:'Search by name, author...', value:search, onChange:e=>setSearch(e.target.value)})
    ),
    React.createElement('div', {className:'data-table-wrap'},
      React.createElement('table', {className:'data-table'},
        React.createElement('thead', null, React.createElement('tr', null,
          React.createElement('th', null, 'Document'),
          React.createElement('th', null, 'Category'),
          React.createElement('th', null, 'Author'),
          React.createElement('th', null, 'Status'),
          React.createElement('th', null, 'Modified'),
          React.createElement('th', null, 'Actions'),
        )),
        React.createElement('tbody', null, filteredDocs.map(doc =>
          React.createElement('tr', {key:doc.id},
            React.createElement('td', null, React.createElement('div',{style:{display:'flex',alignItems:'center',gap:8}},React.createElement('i',{className:'fas fa-file-word',style:{color:'#2B579A',fontSize:18}}),React.createElement('span',{style:{fontWeight:500}},doc.name))),
            React.createElement('td', null, doc.category),
            React.createElement('td', null, doc.author),
            React.createElement('td', null, React.createElement('span',{className:'badge '+(STATUS_COLORS[doc.status]||'badge-draft')},doc.status)),
            React.createElement('td', null, doc.lastModified),
            React.createElement('td', null,
              React.createElement('div', {style:{display:'flex',gap:4}},
                React.createElement('button', {className:'action-btn',title:'View',onClick:()=>setSelectedDoc(doc)},React.createElement('i',{className:'fas fa-eye'})),
                filterPending && React.createElement('button', {className:'btn-primary',style:{fontSize:12,padding:'4px 10px'},onClick:()=>{ setDocs(docs.map(d=>d.id===doc.id?{...d,status:'Approved'}:d)); showToast('Document approved!'); }},
                  React.createElement('i',{className:'fas fa-check',style:{marginRight:4}}),'Approve'
                ),
                filterPending && React.createElement('button', {className:'btn-secondary',style:{fontSize:12,padding:'4px 10px'},onClick:()=>{ setDocs(docs.map(d=>d.id===doc.id?{...d,status:'Rejected'}:d)); showToast('Document rejected','error'); }},
                  React.createElement('i',{className:'fas fa-times',style:{marginRight:4}}),'Reject'
                ),
              )
            )
          )
        ))
      )
    ),
    selectedDoc && React.createElement(ViewDocumentModal, {doc:selectedDoc, onClose:()=>setSelectedDoc(null)})
  );
}

function ManageUsers() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
  return React.createElement('div', null,
    React.createElement('div', {className:'page-header'},
      React.createElement('h1', {className:'page-title'}, 'Manage Users'),
      React.createElement('p', {className:'page-subtitle'}, users.length + ' users in system')
    ),
    React.createElement('div', {className:'data-table-wrap'},
      React.createElement('div', {className:'table-header'},
        React.createElement('h3', null, 'System Users'),
        React.createElement('div', {style:{display:'flex',gap:10}},
          React.createElement('input', {placeholder:'Search users...', value:search, onChange:e=>setSearch(e.target.value), style:{padding:'7px 12px',border:'1px solid #ddd',borderRadius:6,fontSize:14,outline:'none'}}),
          React.createElement('button', {className:'btn-primary',style:{fontSize:13,padding:'7px 14px'},onClick:()=>setShowAdd(true)},
            React.createElement('i',{className:'fas fa-user-plus',style:{marginRight:6}}),'Add User'
          )
        )
      ),
      React.createElement('table', {className:'data-table'},
        React.createElement('thead', null, React.createElement('tr', null,
          React.createElement('th', null,'User'), React.createElement('th', null,'Email'), React.createElement('th', null,'Role'), React.createElement('th', null,'Status'), React.createElement('th', null,'Last Login'), React.createElement('th', null,'Actions'),
        )),
        React.createElement('tbody', null, filtered.map(user =>
          React.createElement('tr', {key:user.id},
            React.createElement('td', null,
              React.createElement('div', {style:{display:'flex',alignItems:'center',gap:10}},
                React.createElement('div', {style:{width:32,height:32,borderRadius:'50%',background:'#1E88E5',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:600,fontSize:13}}, user.name.split(' ').map(n=>n[0]).join('')),
                user.name
              )
            ),
            React.createElement('td', null, user.email),
            React.createElement('td', null,
              React.createElement('span', {className:'role-badge role-'+user.role.toLowerCase()}, user.role)
            ),
            React.createElement('td', null,
              React.createElement('span', {className:'badge '+(user.status==='Active'?'badge-approved':'badge-draft')}, user.status)
            ),
            React.createElement('td', null, user.lastLogin),
            React.createElement('td', null,
              React.createElement('div', {style:{display:'flex',gap:4}},
                React.createElement('button', {className:'action-btn', title:'Edit'}, React.createElement('i',{className:'fas fa-edit'})),
                React.createElement('button', {className:'action-btn', title:'Remove', onClick:()=>{ setUsers(users.filter(u=>u.id!==user.id)); showToast('User removed'); }},
                  React.createElement('i', {className:'fas fa-trash', style:{color:'#e53935'}})
                )
              )
            )
          )
        ))
      )
    ),
    showAdd && React.createElement('div', {className:'modal-backdrop',onClick:e=>{ if(e.target===e.currentTarget) setShowAdd(false); }},
      React.createElement('div', {className:'modal-box'},
        React.createElement('h2', null, React.createElement('i',{className:'fas fa-user-plus',style:{marginRight:10,color:'#1E88E5'}}),'Add New User'),
        React.createElement('div', {className:'form-group'}, React.createElement('label', null, 'Full Name'), React.createElement('input', {placeholder:'Enter full name'})),
        React.createElement('div', {className:'form-group'}, React.createElement('label', null, 'Email Address'), React.createElement('input', {type:'email', placeholder:'user@pharma.com'})),
        React.createElement('div', {className:'form-group'},
          React.createElement('label', null, 'Role'),
          React.createElement('select', null, ['Admin','Author','Reviewer','Approver','HR'].map(r=>React.createElement('option',{key:r},r)))
        ),
        React.createElement('div', {className:'modal-actions'},
          React.createElement('button', {className:'btn-secondary',onClick:()=>setShowAdd(false)},'Cancel'),
          React.createElement('button', {className:'btn-primary',onClick:()=>{ setShowAdd(false); showToast('User added successfully'); }},
            React.createElement('i',{className:'fas fa-save',style:{marginRight:6}}),'Add User'
          )
        )
      )
    )
  );
}

function ManageCategories() {
  const [cats, setCats] = useState(MOCK_CATEGORIES);
  const [showAdd, setShowAdd] = useState(false);
  return React.createElement('div', null,
    React.createElement('div', {className:'page-header'},
      React.createElement('h1', {className:'page-title'}, 'Categories'),
      React.createElement('p', {className:'page-subtitle'}, 'Manage document categories and CTD modules')
    ),
    React.createElement('div', {className:'data-table-wrap'},
      React.createElement('div', {className:'table-header'},
        React.createElement('h3', null, 'Document Categories'),
        React.createElement('button', {className:'btn-primary',style:{fontSize:13,padding:'7px 14px'},onClick:()=>setShowAdd(true)},
          React.createElement('i',{className:'fas fa-plus',style:{marginRight:6}}),'Add Category'
        )
      ),
      React.createElement('table', {className:'data-table'},
        React.createElement('thead', null, React.createElement('tr', null,
          ['Category Name','CTD Module','Level','Documents','Status','Actions'].map(h=>React.createElement('th',{key:h},h))
        )),
        React.createElement('tbody', null, cats.map(cat =>
          React.createElement('tr', {key:cat.id},
            React.createElement('td', null, React.createElement('div',{style:{display:'flex',alignItems:'center',gap:8}},React.createElement('i',{className:'fas fa-folder',style:{color:'#F59E0B',fontSize:18}}),React.createElement('strong',null,cat.name))),
            React.createElement('td', null, cat.group),
            React.createElement('td', null, 'Level ' + cat.level),
            React.createElement('td', null, cat.documents),
            React.createElement('td', null, React.createElement('span',{className:'badge badge-approved'},cat.status)),
            React.createElement('td', null,
              React.createElement('div', {style:{display:'flex',gap:4}},
                React.createElement('button',{className:'action-btn'},React.createElement('i',{className:'fas fa-edit'})),
                React.createElement('button',{className:'action-btn',onClick:()=>{ setCats(cats.filter(c=>c.id!==cat.id)); showToast('Category removed'); }},React.createElement('i',{className:'fas fa-trash',style:{color:'#e53935'}}))
              )
            )
          )
        ))
      )
    )
  );
}

function ManageTemplates() {
  const [templates] = useState(MOCK_TEMPLATES);
  return React.createElement('div', null,
    React.createElement('div', {className:'page-header'},
      React.createElement('h1', {className:'page-title'}, 'Templates'),
      React.createElement('p', {className:'page-subtitle'}, 'Manage document templates for authors')
    ),
    React.createElement('div', {className:'data-table-wrap'},
      React.createElement('div', {className:'table-header'},
        React.createElement('h3', null, 'Document Templates'),
        React.createElement('button', {className:'btn-primary',style:{fontSize:13,padding:'7px 14px'}},
          React.createElement('i',{className:'fas fa-upload',style:{marginRight:6}}),'Upload Template'
        )
      ),
      React.createElement('table', {className:'data-table'},
        React.createElement('thead', null, React.createElement('tr', null,
          ['Template Name','Category','Type','Last Modified','Status','Actions'].map(h=>React.createElement('th',{key:h},h))
        )),
        React.createElement('tbody', null, templates.map(t =>
          React.createElement('tr', {key:t.id},
            React.createElement('td', null, React.createElement('div',{style:{display:'flex',alignItems:'center',gap:8}},React.createElement('i',{className:'fas fa-file-word',style:{color:'#2B579A',fontSize:18}}),t.name)),
            React.createElement('td', null, t.category),
            React.createElement('td', null, t.type),
            React.createElement('td', null, t.lastModified),
            React.createElement('td', null, React.createElement('span',{className:'badge badge-approved'},t.status)),
            React.createElement('td', null,
              React.createElement('div',{style:{display:'flex',gap:4}},
                React.createElement('button',{className:'action-btn'},React.createElement('i',{className:'fas fa-download'})),
                React.createElement('button',{className:'action-btn'},React.createElement('i',{className:'fas fa-edit'}))
              )
            )
          )
        ))
      )
    )
  );
}

function DrugsDatabase() {
  const [drugs, setDrugs] = useState(MOCK_DRUGS);
  const [showAdd, setShowAdd] = useState(false);
  return React.createElement('div', null,
    React.createElement('div', {className:'page-header'},
      React.createElement('h1', {className:'page-title'}, '💊 Drugs Database'),
      React.createElement('p', {className:'page-subtitle'}, 'Manage pharmaceutical compounds and products')
    ),
    React.createElement('div', {className:'data-table-wrap'},
      React.createElement('div', {className:'table-header'},
        React.createElement('h3', null, 'Drug Registry'),
        React.createElement('button', {className:'btn-primary',style:{fontSize:13,padding:'7px 14px'},onClick:()=>setShowAdd(true)},
          React.createElement('i',{className:'fas fa-plus',style:{marginRight:6}}),'Add Drug'
        )
      ),
      React.createElement('table', {className:'data-table'},
        React.createElement('thead', null, React.createElement('tr', null,
          ['Brand Name','Generic Name','Indication','Phase','Status','Actions'].map(h=>React.createElement('th',{key:h},h))
        )),
        React.createElement('tbody', null, drugs.map(d =>
          React.createElement('tr', {key:d.id},
            React.createElement('td', null, React.createElement('strong',null,d.name)),
            React.createElement('td', null, d.genericName),
            React.createElement('td', null, d.indication),
            React.createElement('td', null, d.phase),
            React.createElement('td', null, React.createElement('span',{className:'badge badge-approved'},d.status)),
            React.createElement('td', null,
              React.createElement('div',{style:{display:'flex',gap:4}},
                React.createElement('button',{className:'action-btn'},React.createElement('i',{className:'fas fa-edit'})),
                React.createElement('button',{className:'action-btn',onClick:()=>{ setDrugs(drugs.filter(x=>x.id!==d.id)); showToast('Drug removed'); }},React.createElement('i',{className:'fas fa-trash',style:{color:'#e53935'}}))
              )
            )
          )
        ))
      )
    )
  );
}

function Reports() {
  const months = ['Oct','Nov','Dec','Jan','Feb','Mar'];
  const vals = [12, 18, 15, 22, 19, 27];
  const max = Math.max(...vals);
  return React.createElement('div', null,
    React.createElement('div', {className:'page-header'},
      React.createElement('h1', {className:'page-title'}, 'Document Reports'),
      React.createElement('p', {className:'page-subtitle'}, 'Analytics and statistics for document workflows')
    ),
    React.createElement('div', {className:'stats-grid', style:{marginBottom:24}},
      React.createElement(StatCard, {icon:'fas fa-file-alt',label:'Total Documents',value:89,color:'#1E88E5',bg:'#E3F2FD'}),
      React.createElement(StatCard, {icon:'fas fa-check-circle',label:'Approved This Month',value:14,color:'#4CAF50',bg:'#E8F5E9'}),
      React.createElement(StatCard, {icon:'fas fa-clock',label:'Avg Review Time',value:'3.2d',color:'#FF9800',bg:'#FFF3E0'}),
      React.createElement(StatCard, {icon:'fas fa-percent',label:'Approval Rate',value:'82%',color:'#7B1FA2',bg:'#F3E5F5'}),
    ),
    React.createElement('div', {style:{display:'grid',gridTemplateColumns:'2fr 1fr',gap:20}},
      React.createElement('div', {className:'report-chart'},
        React.createElement('h3', {style:{margin:'0 0 4px',fontSize:16,fontWeight:600,color:'#1B2A4A'}}, 'Documents Submitted per Month'),
        React.createElement('p', {style:{fontSize:13,color:'#888',margin:0}}, 'Last 6 months'),
        React.createElement('div', {className:'chart-bars'},
          months.map((m,i) =>
            React.createElement('div', {className:'chart-bar-wrap',key:m},
              React.createElement('div', {className:'chart-bar-val'}, vals[i]),
              React.createElement('div', {className:'chart-bar', style:{height: (vals[i]/max*130)+'px', background: i===5?'#1E88E5':'#90CAF9'}}),
              React.createElement('div', {className:'chart-bar-label'}, m)
            )
          )
        )
      ),
      React.createElement('div', {className:'card-section'},
        React.createElement('h3', null, 'Status Breakdown'),
        ...[['Approved','#4CAF50',45],['Under Review','#FF9800',11],['Drafts','#9E9E9E',23],['Rejected','#F44336',10]].map(([label,color,count]) =>
          React.createElement('div', {key:label, style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}},
            React.createElement('div', {style:{display:'flex',alignItems:'center',gap:8}},
              React.createElement('div', {style:{width:10,height:10,borderRadius:'50%',background:color}}),
              React.createElement('span', {style:{fontSize:14}}, label)
            ),
            React.createElement('div', {style:{display:'flex',alignItems:'center',gap:10}},
              React.createElement('div', {style:{width:80,height:6,background:'#f0f0f0',borderRadius:3}},
                React.createElement('div', {style:{width:(count/89*100)+'%',height:'100%',background:color,borderRadius:3}})
              ),
              React.createElement('span', {style:{fontSize:13,fontWeight:600,color:'#444',minWidth:24}}, count)
            )
          )
        )
      )
    )
  );
}

function AuthorDashboard() {
  return React.createElement('div', null,
    React.createElement('div', {className:'page-header'},
      React.createElement('h1', {className:'page-title'}, 'Author Dashboard'),
      React.createElement('p', {className:'page-subtitle'}, 'Create and manage your drug documents')
    ),
    React.createElement('div', {className:'stats-grid'},
      React.createElement(StatCard, {icon:'fas fa-file-alt',label:'My Documents',value:8,color:'#1E88E5',bg:'#E3F2FD'}),
      React.createElement(StatCard, {icon:'fas fa-clock',label:'Pending Review',value:3,color:'#FF9800',bg:'#FFF3E0'}),
      React.createElement(StatCard, {icon:'fas fa-check-circle',label:'Approved',value:4,color:'#4CAF50',bg:'#E8F5E9'}),
      React.createElement(StatCard, {icon:'fas fa-edit',label:'Drafts',value:1,color:'#9E9E9E',bg:'#FAFAFA'}),
    ),
    React.createElement(ManageDocuments, {filterMine: true})
  );
}

function ReviewerDashboard() {
  const [docs, setDocs] = useState(MOCK_DOCS.filter(d=>d.status==='Under Review'));
  return React.createElement('div', null,
    React.createElement('div', {className:'page-header'},
      React.createElement('h1', {className:'page-title'}, 'Review Queue'),
      React.createElement('p', {className:'page-subtitle'}, 'Documents awaiting your review')
    ),
    React.createElement('div', {className:'stats-grid'},
      React.createElement(StatCard, {icon:'fas fa-inbox',label:'In Queue',value:docs.length,color:'#1E88E5',bg:'#E3F2FD'}),
      React.createElement(StatCard, {icon:'fas fa-check-circle',label:'Reviewed Today',value:5,color:'#4CAF50',bg:'#E8F5E9'}),
    ),
    React.createElement('div', {className:'data-table-wrap', style:{marginTop:20}},
      React.createElement('div', {className:'table-header'},
        React.createElement('h3', null, 'Documents for Review')
      ),
      React.createElement('table', {className:'data-table'},
        React.createElement('thead', null, React.createElement('tr', null,
          ['Document','Category','Author','Submitted','Actions'].map(h=>React.createElement('th',{key:h},h))
        )),
        React.createElement('tbody', null, docs.map(doc =>
          React.createElement('tr', {key:doc.id},
            React.createElement('td', null, React.createElement('div',{style:{display:'flex',alignItems:'center',gap:8}},React.createElement('i',{className:'fas fa-file-word',style:{color:'#2B579A'}}),doc.name)),
            React.createElement('td', null, doc.category),
            React.createElement('td', null, doc.author),
            React.createElement('td', null, doc.lastModified),
            React.createElement('td', null,
              React.createElement('div', {style:{display:'flex',gap:6}},
                React.createElement('button', {className:'btn-primary',style:{fontSize:12,padding:'4px 12px'},onClick:()=>{ setDocs(docs.filter(d=>d.id!==doc.id)); showToast('Sent for approval!'); }},
                  React.createElement('i',{className:'fas fa-check',style:{marginRight:4}}),'Approve for Forwarding'
                ),
                React.createElement('button', {className:'btn-secondary',style:{fontSize:12,padding:'4px 12px'},onClick:()=>{ setDocs(docs.filter(d=>d.id!==doc.id)); showToast('Sent back to author','error'); }},
                  React.createElement('i',{className:'fas fa-undo',style:{marginRight:4}}),'Return'
                )
              )
            )
          )
        ))
      )
    )
  );
}

function ApproverDashboard() {
  return React.createElement('div', null,
    React.createElement('div', {className:'page-header'},
      React.createElement('h1', {className:'page-title'}, 'Approver Dashboard'),
      React.createElement('p', {className:'page-subtitle'}, 'Review and approve drug documents')
    ),
    React.createElement('div', {className:'stats-grid'},
      React.createElement(StatCard, {icon:'fas fa-inbox',label:'Awaiting Approval',value:MOCK_DOCS.filter(d=>d.status==='Pending Approval').length,color:'#FF9800',bg:'#FFF3E0'}),
      React.createElement(StatCard, {icon:'fas fa-check-circle',label:'Approved This Month',value:12,color:'#4CAF50',bg:'#E8F5E9'}),
    ),
    React.createElement(ManageDocuments, {filterPending: true})
  );
}

// ========= NAV ITEMS =========
function getNavItems(role) {
  switch(role) {
    case 'Admin': return [
      {id:'dashboard',label:'Dashboard',icon:'fas fa-chart-pie'},
      {id:'_master',label:'MASTER',section:true},
      {id:'categories',label:'Categories',icon:'fas fa-folder'},
      {id:'templates',label:'Templates',icon:'fas fa-file-alt'},
      {id:'drugsDatabase',label:'Drugs',icon:'fas fa-pills'},
      {id:'_documents',label:'DOCUMENTS',section:true},
      {id:'documents',label:'All Documents',icon:'fas fa-file-alt'},
      {id:'myDocuments',label:'My Documents',icon:'fas fa-file-signature'},
      {id:'pendingApproval',label:'Assigned to Me',icon:'fas fa-hourglass-half'},
      {id:'reports',label:'Document Reports',icon:'fas fa-chart-bar'},
      {id:'_users',label:'USERS',section:true},
      {id:'users',label:'Manage Users',icon:'fas fa-users'},
    ];
    case 'Author': return [
      {id:'dashboard',label:'Dashboard',icon:'fas fa-chart-pie'},
      {id:'_documents',label:'DOCUMENTS',section:true},
      {id:'myDocuments',label:'My Documents',icon:'fas fa-file-signature'},
      {id:'documents',label:'Assigned to Me',icon:'fas fa-file-alt'},
      {id:'reports',label:'Reports',icon:'fas fa-chart-bar'},
    ];
    case 'Reviewer': return [
      {id:'dashboard',label:'Review Queue',icon:'fas fa-inbox'},
    ];
    case 'Approver': return [
      {id:'dashboard',label:'Dashboard',icon:'fas fa-chart-pie'},
      {id:'_documents',label:'DOCUMENTS',section:true},
      {id:'pendingApproval',label:'Assigned to Me',icon:'fas fa-check-circle'},
      {id:'myDocuments',label:'My Documents',icon:'fas fa-file-signature'},
      {id:'reports',label:'Reports',icon:'fas fa-chart-bar'},
    ];
    default: return [{id:'dashboard',label:'Dashboard',icon:'fas fa-chart-pie'}];
  }
}

// ========= MAIN APP =========
function App() {
  const [role, setRole] = useState('Admin');
  const [view, setView] = useState('dashboard');
  const roles = ['Admin','Author','Reviewer','Approver'];

  const renderContent = () => {
    if (role === 'Reviewer') return React.createElement(ReviewerDashboard);
    if (role === 'Author') {
      if (view === 'myDocuments') return React.createElement(ManageDocuments, {filterMine:true});
      if (view === 'documents') return React.createElement(ManageDocuments);
      if (view === 'reports') return React.createElement(Reports);
      return React.createElement(AuthorDashboard);
    }
    if (role === 'Approver') {
      if (view === 'pendingApproval') return React.createElement(ManageDocuments, {filterPending:true});
      if (view === 'myDocuments') return React.createElement(ManageDocuments, {filterMine:true});
      if (view === 'reports') return React.createElement(Reports);
      return React.createElement(ApproverDashboard);
    }
    // Admin
    switch(view) {
      case 'documents': return React.createElement(ManageDocuments);
      case 'myDocuments': return React.createElement(ManageDocuments, {filterMine:true});
      case 'pendingApproval': return React.createElement(ManageDocuments, {filterPending:true});
      case 'categories': return React.createElement(ManageCategories);
      case 'templates': return React.createElement(ManageTemplates);
      case 'users': return React.createElement(ManageUsers);
      case 'reports': return React.createElement(Reports);
      case 'drugsDatabase': return React.createElement(DrugsDatabase);
      default: return React.createElement(AdminDashboard);
    }
  };

  const navItems = getNavItems(role);

  return React.createElement('div', {className:'app'},
    // Header
    React.createElement('header', {className:'header'},
      React.createElement('div', {className:'header-title'}, 'Drug Management System'),
      React.createElement('div', {className:'header-right'},
        React.createElement('div', {style:{display:'flex',alignItems:'center',gap:8,marginRight:8}},
          React.createElement('label', {style:{fontSize:13,color:'#666'}}, 'Role:'),
          React.createElement('select', {
            value: role,
            onChange: e => { setRole(e.target.value); setView('dashboard'); },
            style:{padding:'5px 10px',border:'1px solid #ddd',borderRadius:4,fontSize:13,cursor:'pointer',outline:'none'}
          }, roles.map(r => React.createElement('option', {key:r, value:r}, r)))
        ),
        React.createElement('div', {className:'user-info'},
          React.createElement('div', {className:'user-details'},
            React.createElement('div', {className:'user-name'}, 'John Smith'),
            React.createElement('div', {className:'user-role'}, role)
          ),
          React.createElement('div', {className:'user-avatar'}, 'JS')
        )
      )
    ),
    // Sidebar
    React.createElement('nav', {className:'sidebar'},
      React.createElement('div', {className:'nav-section'},
        navItems.map(item =>
          item.section
            ? React.createElement('div', {key:item.id, className:'nav-section-title'}, item.label)
            : React.createElement('div', {
                key: item.id,
                className: 'nav-item ' + (view === item.id ? 'active' : ''),
                onClick: () => setView(item.id),
              },
              React.createElement('i', {className: item.icon + ' nav-icon'}),
              React.createElement('span', {className:'nav-label'}, item.label)
            )
        )
      )
    ),
    // Main Content
    React.createElement('main', {className:'main-content'},
      renderContent()
    )
  );
}

ReactDOM.render(React.createElement(App), document.getElementById('root'));
</script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  const pathname = parsedUrl.pathname;

  if (pathname === '/app.css') {
    res.writeHead(200, { 'Content-Type': 'text/css' });
    res.end(appCss);
    return;
  }
  if (pathname === '/ui-professional.css') {
    res.writeHead(200, { 'Content-Type': 'text/css' });
    res.end(uiCss);
    return;
  }
  if (pathname === '/enhanced-styles.css') {
    res.writeHead(200, { 'Content-Type': 'text/css' });
    res.end(enhancedCss);
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/html', 'X-Powered-By': 'DMS' });
  res.end(HTML);
});

server.listen(PORT, HOST, () => {
  console.log('Drug Management System running at http://' + HOST + ':' + PORT);
});
