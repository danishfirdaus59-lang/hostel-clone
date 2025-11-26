
/* fake-backend.js
   - Mock login (username only)
   - Save profile to localStorage under "mock_profile"
   - Save hostel leave submissions to localStorage under "mock_leaves"
   - Hook forms and display saved leaves in the existing table (if present)
*/
(function(){
  "use strict";

  function qs(sel, root=document){ return root.querySelector(sel); }
  function qsa(sel, root=document){ return Array.from((root||document).querySelectorAll(sel)); }

  // Simple login overlay
  function ensureLogin(){
    let profile = JSON.parse(localStorage.getItem('mock_profile')||'null');
    if(profile && profile.username) return profile.username;
    // create overlay
    const overlay = document.createElement('div');
    overlay.id = 'mockLoginOverlay';
    overlay.style = 'position:fixed;left:0;top:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:100000;';
    overlay.innerHTML = `<div style="background:#fff;padding:20px;border-radius:8px;max-width:420px;width:90%;box-shadow:0 6px 20px rgba(0,0,0,.2);">
      <h3 style="margin-top:0;font-family:Arial,Helvetica,sans-serif;">Mock login</h3>
      <p style="margin:0 0 10px;font-size:13px;color:#333">Enter a display name to continue (this is stored only in your browser).</p>
      <input id="mock_login_name" placeholder="Your name" style="width:100%;padding:8px;margin-bottom:8px;border:1px solid #ccc;border-radius:4px;">
      <div style="text-align:right"><button id="mock_login_btn" style="padding:8px 12px;background:#264c7e;color:#fff;border:none;border-radius:4px;cursor:pointer">Continue</button></div>
    </div>`;
    document.body.appendChild(overlay);
    const btn = document.getElementById('mock_login_btn');
    btn.onclick = function(){
      const name = document.getElementById('mock_login_name').value.trim() || 'Guest';
      const prof = { username: name, savedAt: Date.now() };
      localStorage.setItem('mock_profile', JSON.stringify(prof));
      overlay.remove();
      updateUIAfterLogin();
    };
    return null;
  }

  function updateUIAfterLogin(){
    const prof = JSON.parse(localStorage.getItem('mock_profile')||'null');
    if(!prof) return;
    // show name in header if possible
    const nameEls = qsa('.user-n-mob h5, .user-n-mob h6, .user-profile-link h6, #header .user-n-mob, .user-n-mob');
    nameEls.forEach(el=>{
      el.textContent = prof.username;
    });
    // small profile badge if avatar area present
    const avatarSpot = qs('.user-profile-link') || qs('.header-right') || qs('header');
    if(avatarSpot && !qs('#mockProfileBadge')){
      const span = document.createElement('div');
      span.id = 'mockProfileBadge';
      span.style = 'font-size:12px;color:#333;padding:6px 10px;display:inline-block;margin-left:8px';
      span.textContent = prof.username;
      avatarSpot.appendChild(span);
    }
  }

  // Hook leave submission form to save to localStorage
  function hookLeaveForm(){
    const form = qs('form#form1') || qs('form');
    if(!form) return;
    form.addEventListener('submit', function(evt){
      try{
        // try to collect leave fields by common IDs
        const type = (qs('#dropleaveType') || qs('[name$="dropleaveType"]') || {}).value || (qs('select[name*="leave"]')||{}).value || '';
        const fromDate = (qs('#txtFromDate')||qs('input[name*="FromDate"]')||{}).value || (qs('input[type="date"]')||{}).value || '';
        const toDate = (qs('#txtToDate')||qs('input[name*="ToDate"]')||{}).value || '';
        const timeFrom = (qs('input[placeholder*="Time From"]')||{}).value || '';
        const timeTo = (qs('input[placeholder*="Time To"]')||{}).value || '';
        const totaldays = (qs('#txttotaldays')||{}).value || '';
        const purpose = (qs('#txtpurpose')||qs('textarea[name*="purpose"]')||{}).value || '';
        const confirmed = !!(qs('#ContentPlaceHolder1_chkbConfirm') || qs('input[type="checkbox"]'));
        const profile = JSON.parse(localStorage.getItem('mock_profile')||'{}');
        const entry = {
          id: 'L'+Date.now(),
          user: profile.username||'Guest',
          type: type || 'N/A',
          fromDate: fromDate,
          toDate: toDate,
          timeFrom: timeFrom,
          timeTo: timeTo,
          totaldays: totaldays,
          purpose: purpose,
          confirmed: confirmed,
          createdAt: new Date().toISOString()
        };
        let arr = JSON.parse(localStorage.getItem('mock_leaves')||'[]');
        arr.unshift(entry);
        localStorage.setItem('mock_leaves', JSON.stringify(arr));
        evt.preventDefault();
        // show saved toast
        showTempMessage('Leave saved locally (localStorage). It is NOT submitted to CUIMS.', 4000);
        // update table
        renderLeavesTable();
      }catch(e){
        console.error(e);
      }
    }, true);
  }

  // Render saved leaves into the table or create a simple table if none exists
  function renderLeavesTable(){
    const container = qs('#ContentPlaceHolder1_divgrid') || qs('#ContentPlaceHolder1_divgrid') || qs('#ContentPlaceHolder1_divgrid') || document.body;
    const table = qs('#ContentPlaceHolder1_grdbind') || qs('table#ContentPlaceHolder1_grdbind');
    let arr = JSON.parse(localStorage.getItem('mock_leaves')||'[]');
    if(table){
      // clear tbody or recreate
      let tbody = table.querySelector('tbody');
      if(!tbody){
        tbody = document.createElement('tbody');
        table.appendChild(tbody);
      }
      tbody.innerHTML = '';
      arr.forEach((e, idx)=>{
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${e.createdAt}</td><td>${e.user}</td><td>${e.type}</td><td>${e.fromDate} ${e.timeFrom}</td><td>${e.toDate} ${e.timeTo}</td><td>${e.totaldays}</td><td>${e.purpose}</td>`;
        tbody.appendChild(tr);
      });
    } else {
      // create a simple list
      let mount = qs('#ContentPlaceHolder1_showheading') || container;
      let list = qs('#mockLeavesList');
      if(!list){
        list = document.createElement('div');
        list.id = 'mockLeavesList';
        list.style = 'background:#fff;padding:12px;border-radius:6px;margin-top:12px;border:1px solid #ddd';
        mount.parentNode.insertBefore(list, mount.nextSibling);
      }
      list.innerHTML = '<h3>Saved (local) Leaves</h3>';
      if(arr.length===0) list.innerHTML += '<p><em>No local submissions yet.</em></p>';
      else{
        const ul = document.createElement('ul');
        arr.forEach(e=>{
          const li = document.createElement('li');
          li.style = 'margin-bottom:6px';
          li.textContent = `${e.createdAt} — ${e.user} — ${e.type} — ${e.fromDate} to ${e.toDate} — ${e.purpose}`;
          ul.appendChild(li);
        });
        list.appendChild(ul);
      }
    }
  }

  // Minimal profile page hooks: show saved profile and allow edit
  function hookProfilePage(){
    if(!/CUIMS_Profile\.html$/i.test(location.pathname) && !/CUIMS_Profile\.html/i.test(location.href)) return;
    const prof = JSON.parse(localStorage.getItem('mock_profile')||'{}');
    // find place to show name
    const headerName = qs('.user-n-mob h5') || qs('.user-profile-link h6') || document.querySelector('h1') || null;
    if(headerName && prof.username){
      headerName.textContent = prof.username;
    }
    // create small edit panel
    const panel = document.createElement('div');
    panel.style='background:#fff;padding:12px;border-radius:6px;border:1px solid #ddd;max-width:520px;margin:12px 0';
    panel.innerHTML = `<h3>Local Profile (editable)</h3>
      <label style="display:block;margin:6px 0;font-size:13px">Display name</label>
      <input id="mock_profile_name" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:4px" value="${prof.username||''}">
      <div style="margin-top:8px"><button id="mock_profile_save" style="padding:8px 12px;background:#264c7e;color:#fff;border:none;border-radius:4px;cursor:pointer">Save Profile</button></div>
      <small style="display:block;margin-top:8px;color:#666">This saves to your browser only.</small>
    `;
    // insert near top
    const mount = qs('.inner-wrapper') || qs('.container') || document.body;
    mount.insertBefore(panel, mount.firstChild);
    document.getElementById('mock_profile_save').onclick = function(){
      const name = document.getElementById('mock_profile_name').value.trim() || 'Guest';
      const p = { username: name, savedAt: Date.now() };
      localStorage.setItem('mock_profile', JSON.stringify(p));
      showTempMessage('Profile saved locally',2000);
      updateUIAfterLogin();
    };
  }

  // small temporary message
  function showTempMessage(text, ms){
    ms = ms||2500;
    const el = document.createElement('div');
    el.style='position:fixed;right:20px;bottom:20px;background:#222;color:#fff;padding:10px 14px;border-radius:6px;z-index:100001';
    el.textContent = text;
    document.body.appendChild(el);
    setTimeout(()=>el.remove(), ms);
  }

  // initialize
  document.addEventListener('DOMContentLoaded', function(){
    ensureLogin();
    updateUIAfterLogin();
    hookLeaveForm();
    renderLeavesTable();
    hookProfilePage();
    // small helper: if quick edit toggle exists, hook to show our quick edit panel
    const quickToggle = qs('#quickEditToggle');
    if(quickToggle){
      quickToggle.addEventListener('click', function(e){
        e.preventDefault();
        const el = qs('#quickEditPopup');
        if(el) el.style.display = (el.style.display==='none' || !el.style.display)?'block':'none';
      });
    }
  });

})();
