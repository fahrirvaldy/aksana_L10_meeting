import React, { useState, useEffect, useRef, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import './App.css';

// --- INITIAL DATA ---
const DEFAULT_ATTENDANCE = [
  { role: 'Owner', checked: false },
  { role: 'Integrator', checked: false },
  { role: 'Marketing', checked: false },
  { role: 'Creative', checked: false },
  { role: 'RnD', checked: false },
  { role: 'PPIC', checked: false },
  { role: 'Gudang', checked: false },
  { role: 'Finance', checked: false },
  { role: 'Moderator', checked: false },
];

const INITIAL_STATE = {
  meetingDate: 'Senin, ...',
  attendance: DEFAULT_ATTENDANCE,
  goodNews: { owner: '...', integrator: '...', team: '...' },
  marketingKPI: [
    { kpi: 'Omzet Total', target: 'Rp 273,751,236', real: '...', jenis: 'outcome', status: 'on' },
    { kpi: 'Produk Terjual/Minggu', target: '2961', real: '...', jenis: 'outcome', status: 'on' },
    { kpi: 'Leads Baru/Minggu', target: '388', real: '...', jenis: 'output', status: 'on' },
    { kpi: 'Konversi Leads', target: '10%', real: '...', jenis: 'outcome', status: 'on' },
    { kpi: 'Rasio Iklan (ACOS)', target: '10.00%', real: '...', jenis: 'outcome', status: 'on' },
    { kpi: 'ROAS Rata-Rata', target: '8.00', real: '...', jenis: 'outcome', status: 'on' },
    { kpi: 'WA Story', target: '6', real: '...', jenis: 'output', status: 'on' },
    { kpi: 'Repeat Order', target: '5.00%', real: '...', jenis: 'outcome', status: 'on' },
  ],
  creativeKPI: [
    { kpi: 'Konten Tayang vs Rencana', target: '100%', real: '...', jenis: 'output', status: 'on' },
    { kpi: 'Hari aktif story & repost mitra', target: '6 Hari/Minggu', real: '...', jenis: 'output', status: 'on' },
    { kpi: 'Kesiapan bahan launching', target: 'Siap H-7', real: '...', jenis: 'output', status: 'on' },
    { kpi: 'Ketepatan Request Tim Lain', target: '>90% On-Time', real: '...', jenis: 'outcome', status: 'on' },
    { kpi: 'Content Plan Mingguan', target: '1 Dokumen/Minggu', real: '...', jenis: 'output', status: 'on' },
    { kpi: 'Kerjasama/Kolaborasi Brand', target: '1 Brand', real: '...', jenis: 'output', status: 'on' },
    { kpi: 'Total jangkauan audiens', target: 'Berjalan', real: '...', jenis: 'outcome', status: 'on' },
  ],
  rndKPI: [
    { kpi: 'Riset & Usulan Produk', target: '4 Produk/Minggu', real: '...', jenis: 'output', status: 'on' },
    { kpi: 'Pembuatan Mockup', target: '4 Mockup/Minggu', real: '...', jenis: 'output', status: 'on' },
    { kpi: 'Tes Pasar', target: 'Selesai < 30 Des 25', real: '...', jenis: 'outcome', status: 'on' },
    { kpi: 'Tugas RnD & Desain Mingguan', target: '100% Sesuai List', real: '...', jenis: 'output', status: 'on' },
    { kpi: 'Sampel Produk Puller', target: '6 Produk', real: '...', jenis: 'output', status: 'on' },
  ],
  ppicKPI: [
    { kpi: 'Lead time PO ke Vendor', target: '<2 hari kerja', real: '...', jenis: 'output', status: 'on' },
    { kpi: 'Disiplin Update Sistem', target: '>95% Terupdate', real: '...', jenis: 'output', status: 'on' },
    { kpi: 'Monitoring Vendor', target: '>90% Termonitor', real: '...', jenis: 'output', status: 'on' },
    { kpi: 'SKU Prioritas Stok Aman', target: '>90% Stok Aman', real: '...', jenis: 'outcome', status: 'on' },
    { kpi: 'Proyek Produksi On-time', target: '>80% On-Time', real: '...', jenis: 'outcome', status: 'on' },
    { kpi: 'Variansi Biaya vs Target FOB', target: '<+5% Biaya', real: '...', jenis: 'outcome', status: 'on' },
  ],
  financeKPI: [
    { kpi: 'Laporan Kas Harian Tepat Waktu', target: '>90% Terlapor', real: '...', jenis: 'output', status: 'on' },
    { kpi: 'Rekap Cashflow + Prioritas Bayar', target: '100% Terekap', real: '...', jenis: 'output', status: 'on' },
    { kpi: 'Selisih Saldo Bank vs Catatan', target: '<1% Selisih Harian', real: '...', jenis: 'outcome', status: 'on' },
    { kpi: 'Proses Pengajuan hingga Cair', target: '<2 Hari Kerja', real: '...', jenis: 'output', status: 'on' },
    { kpi: 'LPJ Lengkap', target: '<7 Hari', real: '...', jenis: 'output', status: 'on' },
    { kpi: 'Porsi Pengeluaran di Luar Rencana', target: '<10% / Minggu', real: '...', jenis: 'outcome', status: 'on' },
  ],
  gudangKPI: [
    { kpi: 'Jumlah Pesanan Diproses', target: '100 Diproses', real: '...', jenis: 'output', status: 'on' },
    { kpi: 'Pengiriman Tepat Waktu', target: '>95% Tepat Waktu', real: '...', jenis: 'outcome', status: 'on' },
    { kpi: 'Ketepatan Stok Barang', target: '>97% Sesuai', real: '...', jenis: 'outcome', status: 'on' },
    { kpi: 'Laporan Harian Retur, Gagal, Cancel', target: '100% Terlapor', real: '...', jenis: 'output', status: 'on' },
    { kpi: 'Produktivitas Rata-Rata per Orang', target: '>80 Nota / Hari', real: '...', jenis: 'outcome', status: 'on' },
    { kpi: 'Total Lembur', target: 'Tercatat Jika Ada', real: '...', jenis: 'outcome', status: 'on' },
  ],
  rockReview: [
    { owner: 'Owner', rock: 'KPI On-Track & Kas Akhir 4M', status: 'on', note: '...' },
    { owner: 'Marketing', rock: 'Target sales >-2M/bulan', status: 'on', note: '...' },
    { owner: 'Creative', rock: '>10 konten/minggu, ER by Reach 1% + View konten >1000', status: 'on', note: '...' },
    { owner: 'RnD', rock: 'Riset 4 Prod & 4 Mockup/Mgg', status: 'on', note: '...' },
    { owner: 'Finance', rock: 'EBITDA>-Rp 2,5M, akurasi harian', status: 'on', note: '...' },
    { owner: 'Gudang', rock: 'SLA <24 Jam, error <0,1%', status: 'on', note: '...' },
  ],
  headlines: {
    customer: ['...', '...', '...'],
    internal: ['...', '...', '...'],
  },
  todoList: [
    { text: '...', owner: '...', outcome: 'not' },
    { text: '...', owner: '...', outcome: 'not' },
    { text: '...', owner: '...', outcome: 'not' },
  ],
  ids: {
    issues: [],
    notes: 'Catat poin diskusi di sini...',
    solutions: '- Solusi 1 (Owner/Deadline)\n- Solusi 2',
  },
  ratings: {
    owner: '',
    integrator: '',
    marketing: '',
    creative: '',
    rnd: '',
    ppic: '',
    gudang: '',
    finance: '',
    moderator: '',
  }
};

// --- COMPONENTS ---

const Editable = ({ value, onChange, placeholder, className, style, id }) => {
  const contentRef = useRef();

  // Sync internal state with external value only when not focused
  useEffect(() => {
    if (contentRef.current && document.activeElement !== contentRef.current) {
      contentRef.current.innerText = value;
    }
  }, [value]);

  return (
    <div
      ref={contentRef}
      id={id}
      contentEditable
      className={className}
      style={style}
      onBlur={(e) => onChange(e.target.innerText)}
      onInput={(e) => {
        // Debounced or immediate input can be handled here if needed
      }}
      dangerouslySetInnerHTML={{ __html: value }}
    />
  );
};

const StatusButton = ({ status, onClick }) => (
  <div 
    className={`status-btn ${status === 'on' ? 'on' : 'off'}`} 
    onClick={onClick}
  />
);

const JenisButton = ({ jenis, onClick }) => (
  <div 
    className={`jenis-btn ${jenis === 'outcome' ? 'outcome' : 'output'}`} 
    onClick={onClick}
  />
);

const OutcomeButton = ({ outcome, onClick }) => (
  <div 
    className={`outcome-btn ${outcome === 'done' ? 'done' : 'not'}`} 
    onClick={onClick}
  />
);

function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('L10_Meeting_Data');
    return saved ? JSON.parse(saved) : INITIAL_STATE;
  });
  const [timeLeft, setTimeLeft] = useState(90 * 60);
  const [isPaused, setIsPaused] = useState(true);
  const [cloudMsg, setCloudMsg] = useState('Standlone Mode (Offline)');
  const [cloudStatus, setCloudStatus] = useState('saved');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  const slidesRef = useRef([]);

  // --- PERSISTENCE ---
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('L10_Meeting_Data', JSON.stringify(data));
      setCloudMsg('Tersimpan di Lokal');
      setCloudStatus('saved');
    }, 1000);
    return () => clearTimeout(timer);
  }, [data]);

  // --- TIMER LOGIC ---
  useEffect(() => {
    let interval;
    if (!isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsPaused(true);
    }
    return () => clearInterval(interval);
  }, [isPaused, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // --- ACTIONS ---
  const updateData = (path, value) => {
    setData((prev) => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
    setCloudMsg('Menyimpan...');
    setCloudStatus('saving');
  };

  const updateListItem = (listKey, index, field, value) => {
    setData((prev) => {
      const newList = [...prev[listKey]];
      newList[index] = { ...newList[index], [field]: value };
      return { ...prev, [listKey]: newList };
    });
    setCloudStatus('saving');
  };

  const addRow = (listKey, template) => {
    setData((prev) => ({
      ...prev,
      [listKey]: [...prev[listKey], template]
    }));
  };

  const nextSlide = () => {
    if (currentSlide < 12) setCurrentSlide(currentSlide + 1);
  };

  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
  };

  const populateIDS = () => {
    const offTrackKPIs = [];
    ['marketingKPI', 'creativeKPI', 'rndKPI', 'ppicKPI', 'financeKPI', 'gudangKPI', 'rockReview'].forEach(key => {
      data[key].forEach(item => {
        if (item.status === 'off') {
          offTrackKPIs.push(item.kpi || item.rock);
        }
      });
    });

    const newIssues = offTrackKPIs.map(text => ({ text, checked: false }));
    setData(prev => ({
      ...prev,
      ids: {
        ...prev.ids,
        issues: [...prev.ids.issues, ...newIssues]
      }
    }));
  };

  const saveAsPDF = async () => {
    setIsGeneratingPdf(true);
    const pdf = new jsPDF({ orientation: 'l', unit: 'mm', format: 'a4', compress: true });
    const pdfWidth = 297;
    const pdfHeight = 210;

    for (let i = 0; i < 13; i++) {
      setCurrentSlide(i);
      // Wait for re-render
      await new Promise(r => setTimeout(r, 500));
      
      const slideElement = document.querySelector(`.slide.active`);
      if (slideElement) {
        const canvas = await html2canvas(slideElement, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#f8fafc',
        });
        const imgData = canvas.toDataURL('image/png');
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      }
    }
    
    pdf.save('L10_Meeting_Report.pdf');
    setIsGeneratingPdf(false);
  };

  const getNextTuesday = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    let daysUntilTuesday = 2 - dayOfWeek;
    if (daysUntilTuesday < 0) daysUntilTuesday += 7;
    const nextTuesday = new Date(today);
    nextTuesday.setDate(today.getDate() + daysUntilTuesday);
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${days[nextTuesday.getDay()]}, ${nextTuesday.getDate()} ${months[nextTuesday.getMonth()]} ${nextTuesday.getFullYear()}`;
  };

  useEffect(() => {
    if (data.meetingDate === 'Senin, ...') {
      updateData('meetingDate', getNextTuesday());
    }
  }, []);

  return (
    <div className={isGeneratingPdf ? 'generating-pdf' : ''} onClick={(e) => {
      if (e.target.closest('button') || e.target.closest('input') || e.target.closest('[contenteditable="true"]') || e.target.closest('.floating-timer') || e.target.closest('.nav-controls')) return;
      nextSlide();
    }}>
      
      {/* FLOATING TIMER */}
      <div className="floating-timer">
        <i className="fa-regular fa-clock"></i>
        <span>{formatTime(timeLeft)}</span>
        <div className="timer-controls">
          <i className={`fa-solid ${isPaused ? 'fa-play' : 'fa-pause'}`} onClick={() => setIsPaused(!isPaused)}></i>
          <i className="fa-solid fa-rotate-right" onClick={() => { setIsPaused(true); setTimeLeft(90 * 60); }}></i>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="nav-controls">
        <button className="nav-btn" onClick={(e) => { e.stopPropagation(); prevSlide(); }}><i className="fa-solid fa-chevron-left"></i></button>
        <button className="nav-btn" onClick={(e) => { e.stopPropagation(); nextSlide(); }}><i className="fa-solid fa-chevron-right"></i></button>
      </div>

      <button className="action-btn" onClick={saveAsPDF}>
        <i className="fa-solid fa-file-pdf"></i> {isGeneratingPdf ? 'Processing...' : 'High Quality PDF'}
      </button>

      {/* CLOUD STATUS */}
      <div className={`cloud-status ${cloudStatus}`}>
        <i className="fa-solid fa-cloud"></i> <span>{cloudMsg}</span>
      </div>

      {/* SLIDES */}

      {/* 1. TITLE */}
      <div className={`slide ${currentSlide === 0 ? 'active' : ''}`}>
        <div className="card" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', border: 'none', background: 'transparent', boxShadow: 'none' }}>
          <h1 style={{ fontSize: '64px', color: 'var(--primary)', marginBottom: '10px' }}>LEVEL 10 MEETING</h1>
          <h2 style={{ fontSize: '36px', color: 'var(--accent)', marginBottom: '50px', fontWeight: 500 }}>Ammarkids Operational</h2>
          <div style={{ background: 'white', padding: '30px 60px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '16px', color: 'var(--text-light)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Tanggal Rapat</div>
            <Editable 
              className="editable-date"
              style={{ fontSize: '32px', fontWeight: 800, color: 'var(--primary)' }}
              value={data.meetingDate}
              onChange={(val) => updateData('meetingDate', val)}
            />
          </div>
          <p style={{ marginTop: '50px', color: '#94a3b8', fontSize: '16px' }}>Klik layar atau gunakan tombol navigasi untuk lanjut</p>
        </div>
      </div>

      {/* 2. SEGMEN AWAL */}
      <div className={`slide ${currentSlide === 1 ? 'active' : ''}`}>
        <h1>Segmen Awal</h1>
        <div className="subtitle">Kehadiran & Kabar Baik (5 Menit)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', height: '100%' }}>
          <div className="card">
            <h3>Daftar Hadir</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
              {data.attendance.map((att, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input 
                    type="checkbox" 
                    checked={att.checked} 
                    onChange={(e) => updateListItem('attendance', i, 'checked', e.target.checked)}
                    style={{ width: '22px', height: '22px' }}
                  />
                  <span style={{ fontSize: '18px' }}>{att.role}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <h3>Good News (Kabar Syukur)</h3>
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '18px' }}>
              <div><strong style={{ color: 'var(--accent)' }}>Owner:</strong> 
                <Editable className="input-box" value={data.goodNews.owner} onChange={(val) => updateData('goodNews.owner', val)} style={{ marginTop: '5px' }} />
              </div>
              <div><strong style={{ color: 'var(--accent)' }}>Integrator:</strong> 
                <Editable className="input-box" value={data.goodNews.integrator} onChange={(val) => updateData('goodNews.integrator', val)} style={{ marginTop: '5px' }} />
              </div>
              <div><strong style={{ color: 'var(--accent)' }}>Perwakilan Tim:</strong> 
                <Editable className="input-box" value={data.goodNews.team} onChange={(val) => updateData('goodNews.team', val)} style={{ marginTop: '5px' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI SLIDES TEMPLATE */}
      {[
        { title: 'Marketing', key: 'marketingKPI' },
        { title: 'Creative', key: 'creativeKPI' },
        { title: 'Research & Development', key: 'rndKPI' },
        { title: 'PPIC', key: 'ppicKPI' },
        { title: 'Finance', key: 'financeKPI' },
        { title: 'Gudang', key: 'gudangKPI' },
      ].map((sheet, index) => (
        <div key={sheet.key} className={`slide ${currentSlide === (index + 2) ? 'active' : ''}`}>
          <h1>Scorecard: {sheet.title}</h1>
          <div className="subtitle">Review KPI & Output</div>
          <div className="card">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '30%' }}>KPI</th>
                  <th style={{ width: '20%' }}>Target</th>
                  <th style={{ width: '20%' }}>Realisasi</th>
                  <th style={{ width: '15%', textAlign: 'center' }}>Jenis</th>
                  <th style={{ width: '15%', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {data[sheet.key].map((item, i) => (
                  <tr key={i}>
                    <td><Editable value={item.kpi} onChange={(val) => updateListItem(sheet.key, i, 'kpi', val)} /></td>
                    <td><Editable value={item.target} onChange={(val) => updateListItem(sheet.key, i, 'target', val)} /></td>
                    <td><Editable value={item.real} onChange={(val) => updateListItem(sheet.key, i, 'real', val)} /></td>
                    <td align="center"><JenisButton jenis={item.jenis} onClick={() => updateListItem(sheet.key, i, 'jenis', item.jenis === 'outcome' ? 'output' : 'outcome')} /></td>
                    <td align="center"><StatusButton status={item.status} onClick={() => updateListItem(sheet.key, i, 'status', item.status === 'on' ? 'off' : 'on')} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="add-btn" onClick={() => addRow(sheet.key, { kpi: '...', target: '...', real: '...', jenis: 'outcome', status: 'on' })}>+ Tambah KPI</button>
          </div>
        </div>
      ))}

      {/* 8. ROCK REVIEW */}
      <div className={`slide ${currentSlide === 8 ? 'active' : ''}`}>
        <h1>Rock Review</h1>
        <div className="subtitle">Prioritas 90 Hari</div>
        <div className="card">
          <table>
            <thead>
              <tr><th>Owner</th><th>Rock</th><th align="center">Status</th><th>Catatan</th></tr>
            </thead>
            <tbody>
              {data.rockReview.map((item, i) => (
                <tr key={i}>
                  <td>{item.owner}</td>
                  <td><Editable value={item.rock} onChange={(val) => updateListItem('rockReview', i, 'rock', val)} /></td>
                  <td align="center"><StatusButton status={item.status} onClick={() => updateListItem('rockReview', i, 'status', item.status === 'on' ? 'off' : 'on')} /></td>
                  <td><Editable value={item.note} onChange={(val) => updateListItem('rockReview', i, 'note', val)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 9. HEADLINES */}
      <div className={`slide ${currentSlide === 9 ? 'active' : ''}`}>
        <h1>Headlines</h1>
        <div className="subtitle">Berita Penting (Customer & Internal)</div>
        <div className="stacked-layout">
          <div className="card" style={{ maxHeight: '48%' }}>
            <h3 style={{ color: 'var(--accent)' }}>Customer Headlines</h3>
            <div style={{ overflowY: 'auto' }}>
              {data.headlines.customer.map((hl, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'start', gap: '15px', marginBottom: '10px' }}>
                  <span style={{ marginTop: '12px', fontWeight: 800, color: 'var(--text-light)', fontSize: '18px' }}>{i + 1}.</span>
                  <Editable className="input-box" value={hl} onChange={(val) => {
                    const newHl = [...data.headlines.customer];
                    newHl[i] = val;
                    updateData('headlines.customer', newHl);
                  }} />
                </div>
              ))}
            </div>
          </div>
          <div className="card" style={{ maxHeight: '48%' }}>
            <h3 style={{ color: 'var(--success)' }}>Internal Headlines</h3>
            <div style={{ overflowY: 'auto' }}>
              {data.headlines.internal.map((hl, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'start', gap: '15px', marginBottom: '10px' }}>
                  <span style={{ marginTop: '12px', fontWeight: 800, color: 'var(--text-light)', fontSize: '18px' }}>{i + 1}.</span>
                  <Editable className="input-box" value={hl} onChange={(val) => {
                    const newHl = [...data.headlines.internal];
                    newHl[i] = val;
                    updateData('headlines.internal', newHl);
                  }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 10. TO-DO LIST */}
      <div className={`slide ${currentSlide === 10 ? 'active' : ''}`}>
        <h1>To-Do List</h1>
        <div className="subtitle">Review minggu lalu & Action Plan</div>
        <div className="card">
          <ol className="todo-list">
            {data.todoList.map((item, i) => (
              <li key={i} className="todo-item">
                <span className="todo-number">{i + 1}.</span>
                <div className="todo-text-wrapper">
                  <Editable className="input-box" value={item.text} onChange={(val) => updateListItem('todoList', i, 'text', val)} />
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                    <span className="owner-label">Owner:</span>
                    <Editable className="owner-input" value={item.owner} onChange={(val) => updateListItem('todoList', i, 'owner', val)} />
                  </div>
                </div>
                <div className="todo-action">
                  <OutcomeButton outcome={item.outcome} onClick={() => updateListItem('todoList', i, 'outcome', item.outcome === 'done' ? 'not' : 'done')} />
                </div>
              </li>
            ))}
          </ol>
          <button className="add-btn" onClick={() => addRow('todoList', { text: '...', owner: '...', outcome: 'not' })}>+ Add To-Do</button>
        </div>
      </div>

      {/* 11. IDS */}
      <div className={`slide ${currentSlide === 11 ? 'active' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>IDS Session</h1>
          <button onClick={populateIDS} style={{ background: 'var(--danger)', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
            <i className="fa-solid fa-sync"></i> Tarik Data Off-Track
          </button>
        </div>
        <div className="subtitle">Identify, Discuss, Solve (60 Menit)</div>
        <div className="ids-container">
          <div className="ids-col">
            <h3>1. Identify (Issues List)</h3>
            <div id="ids-identify-list">
              {data.ids.issues.map((issue, i) => (
                <div key={i} className="ids-item">
                  <input 
                    type="checkbox" 
                    checked={issue.checked} 
                    onChange={(e) => {
                      const newIssues = [...data.ids.issues];
                      newIssues[i].checked = e.target.checked;
                      updateData('ids.issues', newIssues);
                    }}
                    className="ids-checkbox" 
                  />
                  <Editable 
                    className="ids-text" 
                    value={issue.text} 
                    onChange={(val) => {
                      const newIssues = [...data.ids.issues];
                      newIssues[i].text = val;
                      updateData('ids.issues', newIssues);
                    }} 
                  />
                </div>
              ))}
            </div>
            <button onClick={() => addRow('ids.issues', { text: 'Masalah baru...', checked: false })} style={{ width: '100%', marginTop: '15px', background: '#f1f5f9', border: 'none', padding: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', color: 'var(--text-light)' }}>+ Manual Issue</button>
          </div>
          <div className="ids-col">
            <h3>2. Discuss (Notes)</h3>
            <Editable 
              className="ids-notes" 
              style={{ height: '100%', outline: 'none' }} 
              value={data.ids.notes} 
              onChange={(val) => updateData('ids.notes', val)} 
            />
          </div>
          <div className="ids-col">
            <h3>3. Solve (Action Items)</h3>
            <Editable 
              className="ids-solutions" 
              style={{ height: '100%', outline: 'none' }} 
              value={data.ids.solutions} 
              onChange={(val) => updateData('ids.solutions', val)} 
            />
          </div>
        </div>
      </div>

      {/* 12. RATING */}
      <div className={`slide ${currentSlide === 12 ? 'active' : ''}`}>
        <h1>Segmen Akhir</h1>
        <div className="subtitle">Rating Rapat & Penutup (5 Menit)</div>
        <div className="card" style={{ justifyContent: 'center' }}>
          <h3>Beri Rating Rapat (1-10)</h3>
          <div className="rating-grid">
            {Object.keys(data.ratings).map((role) => (
              <div key={role} className="rating-card">
                <label style={{ textTransform: 'capitalize' }}>{role}</label>
                <input 
                  type="number" 
                  min="1" max="10" 
                  className="rating-input" 
                  value={data.ratings[role]} 
                  onChange={(e) => updateData(`ratings.${role}`, e.target.value)}
                />
              </div>
            ))}
          </div>
          <div className="rating-avg">
            {(() => {
              const vals = Object.values(data.ratings).map(v => parseFloat(v)).filter(v => !isNaN(v));
              return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '0.0';
            })()}
          </div>
          <p style={{ textAlign: 'center', color: 'var(--text-light)', marginTop: '20px', fontSize: '18px' }}>
            "Rapat yang hebat dimulai dari kedisiplinan dan diakhiri dengan komitmen."
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
