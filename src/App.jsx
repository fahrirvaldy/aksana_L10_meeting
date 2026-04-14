import React, { useState, useEffect, useRef } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import './App.css';

// 1. Pindahkan fungsi tanggal ke luar agar bisa dipakai di INITIAL_STATE
const getCurrentDate = () => {
  const today = new Date();
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  return `${days[today.getDay()]}, ${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;
};

// --- INITIAL DATA ---
const INITIAL_STATE = {
  meetingDate: getCurrentDate(), // Otomatis pakai tanggal hari ini
  goodNews: { owner: '', integrator: '', team: '' },
  marketingKPI: [
    { kpi: 'Omzet Total', target: 'Rp 273,751,236', real: '', jenis: 'outcome', status: 'on' },
    { kpi: 'Produk Terjual/Minggu', target: '2961', real: '', jenis: 'outcome', status: 'on' },
    { kpi: 'Leads Baru/Minggu', target: '388', real: '', jenis: 'output', status: 'on' },
    { kpi: 'Konversi Leads', target: '10%', real: '', jenis: 'outcome', status: 'on' },
    { kpi: 'Rasio Iklan (ACOS)', target: '10.00%', real: '', jenis: 'outcome', status: 'on' },
    { kpi: 'ROAS Rata-Rata', target: '8.00', real: '', jenis: 'outcome', status: 'on' },
    { kpi: 'WA Story', target: '6', real: '', jenis: 'output', status: 'on' },
    { kpi: 'Repeat Order', target: '5.00%', real: '', jenis: 'outcome', status: 'on' },
  ],
  creativeKPI: [
    { kpi: 'Konten Tayang vs Rencana', target: '100%', real: '', jenis: 'output', status: 'on' },
    { kpi: 'Hari aktif story & repost mitra', target: '6 Hari/Minggu', real: '', jenis: 'output', status: 'on' },
    { kpi: 'Kesiapan bahan launching', target: 'Siap H-7', real: '', jenis: 'output', status: 'on' },
    { kpi: 'Ketepatan Request Tim Lain', target: '>90% On-Time', real: '', jenis: 'outcome', status: 'on' },
    { kpi: 'Content Plan Mingguan', target: '1 Dokumen/Minggu', real: '', jenis: 'output', status: 'on' },
    { kpi: 'Kerjasama/Kolaborasi Brand', target: '1 Brand', real: '', jenis: 'output', status: 'on' },
    { kpi: 'Total jangkauan audiens', target: 'Berjalan', real: '', jenis: 'outcome', status: 'on' },
  ],
  rndKPI: [
    { kpi: 'Riset & Usulan Produk', target: '4 Produk/Minggu', real: '', jenis: 'output', status: 'on' },
    { kpi: 'Pembuatan Mockup', target: '4 Mockup/Minggu', real: '', jenis: 'output', status: 'on' },
    { kpi: 'Tes Pasar', target: 'Selesai < 30 Des 25', real: '', jenis: 'outcome', status: 'on' },
    { kpi: 'Tugas RnD & Desain Mingguan', target: '100% Sesuai List', real: '', jenis: 'output', status: 'on' },
    { kpi: 'Sampel Produk Puller', target: '6 Produk', real: '', jenis: 'output', status: 'on' },
  ],
  ppicKPI: [
    { kpi: 'Lead time PO ke Vendor', target: '<2 hari kerja', real: '', jenis: 'output', status: 'on' },
    { kpi: 'Disiplin Update Sistem', target: '>95% Terupdate', real: '', jenis: 'output', status: 'on' },
    { kpi: 'Monitoring Vendor', target: '>90% Termonitor', real: '', jenis: 'output', status: 'on' },
    { kpi: 'SKU Prioritas Stok Aman', target: '>90% Stok Aman', real: '', jenis: 'outcome', status: 'on' },
    { kpi: 'Proyek Produksi On-time', target: '>80% On-Time', real: '', jenis: 'outcome', status: 'on' },
    { kpi: 'Variansi Biaya vs Target FOB', target: '<+5% Biaya', real: '', jenis: 'outcome', status: 'on' },
  ],
  financeKPI: [
    { kpi: 'Laporan Kas Harian Tepat Waktu', target: '>90% Terlapor', real: '', jenis: 'output', status: 'on' },
    { kpi: 'Rekap Cashflow + Prioritas Bayar', target: '100% Terekap', real: '', jenis: 'output', status: 'on' },
    { kpi: 'Selisih Saldo Bank vs Catatan', target: '<1% Selisih Harian', real: '', jenis: 'outcome', status: 'on' },
    { kpi: 'Proses Pengajuan hingga Cair', target: '<2 Hari Kerja', real: '', jenis: 'output', status: 'on' },
    { kpi: 'LPJ Lengkap', target: '<7 Hari', real: '', jenis: 'output', status: 'on' },
    { kpi: 'Porsi Pengeluaran di Luar Rencana', target: '<10% / Minggu', real: '', jenis: 'outcome', status: 'on' },
  ],
  gudangKPI: [
    { kpi: 'Jumlah Pesanan Diproses', target: '100 Diproses', real: '', jenis: 'output', status: 'on' },
    { kpi: 'Pengiriman Tepat Waktu', target: '>95% Tepat Waktu', real: '', jenis: 'outcome', status: 'on' },
    { kpi: 'Ketepatan Stok Barang', target: '>97% Sesuai', real: '', jenis: 'outcome', status: 'on' },
    { kpi: 'Laporan Harian Retur, Gagal, Cancel', target: '100% Terlapor', real: '', jenis: 'output', status: 'on' },
    { kpi: 'Produktivitas Rata-Rata per Orang', target: '>80 Nota / Hari', real: '', jenis: 'outcome', status: 'on' },
    { kpi: 'Total Lembur', target: 'Tercatat Jika Ada', real: '', jenis: 'outcome', status: 'on' },
  ],
  rockReview: [
    { owner: 'Owner', rock: 'KPI On-Track & Kas Akhir 4M', status: 'on', note: '' },
    { owner: 'Marketing', rock: 'Target sales >-2M/bulan', status: 'on', note: '' },
    { owner: 'Creative', rock: '>10 konten/minggu, ER by Reach 1% + View konten >1000', status: 'on', note: '' },
    { owner: 'RnD', rock: 'Riset 4 Prod & 4 Mockup/Mgg', status: 'on', note: '' },
    { owner: 'Finance', rock: 'EBITDA>-Rp 2,5M, akurasi harian', status: 'on', note: '' },
    { owner: 'Gudang', rock: 'SLA <24 Jam, error <0,1%', status: 'on', note: '' },
  ],
  headlines: {
    customer: ['', '', ''],
    internal: ['', '', ''],
  },
  todoList: [
    { text: '', owner: '', outcome: 'not' },
    { text: '', owner: '', outcome: 'not' },
    { text: '', owner: '', outcome: 'not' },
  ],
  ids: {
    issues: [],
    notes: 'Catat poin diskusi di sini...',
    solutions: '- Solusi 1 (Owner/Deadline)\n- Solusi 2',
  },
  ratings: {
    owner: '', integrator: '', marketing: '', creative: '', rnd: '', ppic: '', gudang: '', finance: '', moderator: '',
  }
};

// --- COMPONENTS ---
const Editable = ({ value, onChange, placeholder, className, style, id }) => {
  return (
    <textarea
      id={id}
      className={className}
      style={{
        width: '100%', background: 'transparent', border: 'none', outline: 'none',
        resize: 'none', fontFamily: 'inherit', fontSize: 'inherit', color: 'inherit',
        fontWeight: 'inherit', overflow: 'hidden', padding: 0, margin: 0,
        display: 'block', lineHeight: '1.5', ...style
      }}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={1}
      onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
      onFocus={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
    />
  );
};

const StatusButton = ({ status, onClick }) => (
  <div className={`status-btn ${status === 'on' ? 'on' : 'off'}`} onClick={onClick} />
);

const JenisButton = ({ jenis, onClick }) => (
  <div className={`jenis-btn ${jenis === 'outcome' ? 'outcome' : 'output'}`} onClick={onClick} />
);

const OutcomeButton = ({ outcome, onClick }) => (
  <div className={`outcome-btn ${outcome === 'done' ? 'done' : 'not'}`} onClick={onClick} />
);

function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [data, setData] = useState(INITIAL_STATE);
  const [isDataLoaded, setIsDataLoaded] = useState(false); 
  const [attendances, setAttendances] = useState([
    { id: 1, name: 'Owner', checked: false }, 
    { id: 2, name: 'Integrator', checked: false }, 
    { id: 3, name: 'Marketing', checked: false }, 
    { id: 4, name: 'Creative', checked: false }
  ]);
  const [timeLeft, setTimeLeft] = useState(90 * 60);
  const [isPaused, setIsPaused] = useState(true);
  const [cloudMsg, setCloudMsg] = useState('Menghubungkan...');
  const [cloudStatus, setCloudStatus] = useState('saving');

  // Gembok Pintar untuk Auto-Save
  const isReceivingData = useRef(true);
  const saveTimeoutRef = useRef(null);

  // 1. DENGARKAN PERUBAHAN DARI FIREBASE
  useEffect(() => {
    const meetingDocRef = doc(db, 'meetings', 'currentMeeting');
    const unsubscribe = onSnapshot(meetingDocRef, (docSnap) => {
      // Nyalakan gembok karena data ini dari server!
      isReceivingData.current = true;
      
      if (docSnap.exists()) {
        const serverData = docSnap.data();
        setData(serverData);
        if (serverData.attendances) setAttendances(serverData.attendances);
      } else {
        // Buat file pertama kali jika benar-benar kosong
        setDoc(meetingDocRef, { ...INITIAL_STATE, attendances });
      }
      
      setIsDataLoaded(true);
      setCloudMsg('Terhubung & Sinkron');
      setCloudStatus('saved');

      // Buka gembok setelah 500 milidetik (Masa Tenggang)
      setTimeout(() => { isReceivingData.current = false; }, 500);
    });

    return () => unsubscribe();
  }, []);

  // 2. SISTEM AUTO-SAVE PINTAR (Debounced)
  useEffect(() => {
    // Jangan simpan kalau aplikasi baru dimuat atau sedang menerima data dari server
    if (!isDataLoaded || isReceivingData.current) return;

    setCloudMsg('Mengetik...');
    setCloudStatus('saving');

    // Hapus jadwal simpan sebelumnya jika user mengetik lagi dengan cepat
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    // Jadwalkan penyimpanan baru setelah user diam selama 1.5 detik
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const meetingDocRef = doc(db, 'meetings', 'currentMeeting');
        await setDoc(meetingDocRef, { ...data, attendances }, { merge: true });
        setCloudMsg('Tersimpan di Cloud');
        setCloudStatus('saved');
      } catch (error) {
        setCloudMsg('Gagal Menyimpan');
        setCloudStatus('error');
      }
    }, 1500);

    return () => clearTimeout(saveTimeoutRef.current);
  }, [data, attendances, isDataLoaded]);

  // --- ACTIONS PURE STATE (Sangat Cepat & Ringan) ---
  const handleAddAttendance = () => {
    const newId = attendances.length > 0 ? Math.max(...attendances.map(a => a.id)) + 1 : 1;
    setAttendances([...attendances, { id: newId, name: '', checked: false }]);
  };

  const handleDeleteAttendance = (id) => {
    setAttendances(attendances.filter(a => a.id !== id));
  };

  const handleUpdateAttendance = (id, field, value) => {
    setAttendances(attendances.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const updateData = (path, value) => {
    setData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let current = newData;
      for (let i = 0; i < keys.length - 1; i++) current = current[keys[i]];
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const updateListItem = (listKey, index, field, value) => {
    setData((prev) => {
      const newList = [...prev[listKey]];
      newList[index] = { ...newList[index], [field]: value };
      return { ...prev, [listKey]: newList };
    });
  };

  const addRow = (listKey, template) => {
    setData((prev) => ({ ...prev, [listKey]: [...prev[listKey], template] }));
  };

  const addIssue = () => {
    setData(prev => ({
      ...prev,
      ids: { ...prev.ids, issues: [...prev.ids.issues, { text: 'Masalah baru...', checked: false }] }
    }));
  };

  const populateIDS = () => {
    const offTrackKPIs = [];
    ['marketingKPI', 'creativeKPI', 'rndKPI', 'ppicKPI', 'financeKPI', 'gudangKPI', 'rockReview'].forEach(key => {
      if (data[key]) {
        data[key].forEach(item => {
          if (item.status === 'off') offTrackKPIs.push(item.kpi || item.rock);
        });
      }
    });

    setData(prev => {
      const existingTexts = prev.ids.issues.map(i => i.text);
      const newIssues = offTrackKPIs.filter(text => !existingTexts.includes(text)).map(text => ({ text, checked: false }));
      return { ...prev, ids: { ...prev.ids, issues: [...prev.ids.issues, ...newIssues] } };
    });
  };

  const nextSlide = () => { if (currentSlide < 12) setCurrentSlide(currentSlide + 1); };
  const prevSlide = () => { if (currentSlide > 0) setCurrentSlide(currentSlide - 1); };
  const generatePDF = () => { window.print(); };

  // --- TIMER LOGIC ---
  useEffect(() => {
    let interval;
    if (!isPaused && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) setIsPaused(true);
    return () => clearInterval(interval);
  }, [isPaused, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div id="pdf-content" className="max-w-7xl mx-auto p-4 md:p-8">
      
{/* --- CSS KHUSUS CETAK/PDF NATIVE (OPTIMIZED & STABILIZED) --- */}
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 12mm; }
          html, body, #root, #pdf-content { 
            height: auto !important; 
            overflow: visible !important; 
            background-color: white !important; 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
          }
          button, [data-html2canvas-ignore="true"], .nav-controls, .action-btn { 
            display: none !important; 
          }
          
          /* --- KUNCI PENSTABILAN BLANK PUTIH --- */
          .slide {
            display: block !important; 
            width: 100% !important; 
            height: auto !important;
            min-height: 0 !important; 
            overflow: visible !important; 
            position: relative !important;
            page-break-after: always !important; 
            break-after: page !important; 
            padding: 0 !important; 
            margin: 0 !important;
            
            /* RESET SEMUA EFEK SEMBUNYI DARI CSS REGULER */
            opacity: 1 !important;
            visibility: visible !important;
            transform: none !important;
            animation: none !important;
            transition: none !important;
          }
          
          table, tr, td, th, .bg-white, .rounded-xl, .card { 
            page-break-inside: avoid !important; 
            break-inside: avoid !important; 
          }
          * { box-shadow: none !important; }
          h1 { font-size: 24pt !important; }
          .subtitle { font-size: 14pt !important; }
        }
        .cloud-status.saving { color: var(--warning); }
        .cloud-status.saved { color: var(--success); }
        .cloud-status.error { color: var(--danger); }
      `}</style>

      {/* HEADER */}
      <div data-html2canvas-ignore="true" className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 pb-4 border-b md:sticky md:top-0 z-40 bg-white/90 backdrop-blur-md md:-mx-8 md:px-8 md:-mt-8 md:pt-8">
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-bold text-slate-800 m-0">L10 MEETING</h1>
          <p className="text-aksana-accent font-semibold text-lg md:text-xl m-0">Ammarkids Operational</p>
        </div>
        <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 text-aksana-accent text-2xl font-mono font-bold">
            <i className="fa-regular fa-clock text-xl"></i><span>{formatTime(timeLeft)}</span>
          </div>
          <div className="flex items-center gap-3 border-l pl-4">
            <button onClick={() => setIsPaused(!isPaused)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-aksana-primary hover:text-white transition-all">
              <i className={`fa-solid ${isPaused ? 'fa-play' : 'fa-pause'}`}></i>
            </button>
            <button onClick={() => { setIsPaused(true); setTimeLeft(90 * 60); }} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all">
              <i className="fa-solid fa-rotate-right"></i>
            </button>
          </div>
        </div>
      </div>

      {/* 1. TITLE PAGE */}
      <div className={`slide ${currentSlide === 0 ? 'active' : ''}`}>
        <div className="card" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', border: 'none', background: 'transparent', boxShadow: 'none' }}>
          <div style={{ background: 'white', padding: '40px 60px', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <div style={{ fontSize: '14px', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700 }}>Tanggal Rapat</div>
              <button onClick={() => updateData('meetingDate', getCurrentDate())} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '14px', padding: '5px' }} title="Set Otomatis ke Hari Ini">
                <i className="fa-solid fa-arrows-rotate"></i>
              </button>
            </div>
            <div className="text-3xl md:text-5xl font-extrabold text-aksana-primary">{data.meetingDate}</div>
          </div>
        </div>
      </div>

      {/* 2. SEGMEN AWAL */}
      <div className={`slide ${currentSlide === 1 ? 'active' : ''}`}>
        <div className="flex flex-col gap-1 mb-4">
          <h1>Segmen Awal</h1><div className="subtitle">Kehadiran & Kabar Baik (5 Menit)</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 h-auto">
          <div className="card" style={{ height: 'auto' }}>
            <h3>Daftar Hadir</h3>
            <div id="attendance-grid" className="flex flex-col gap-3 mt-4">
              {attendances.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100 w-full transition-all group hover:border-slate-200">
                  <div className="flex items-center gap-3 flex-grow">
                    <input type="checkbox" checked={item.checked} onChange={(e) => handleUpdateAttendance(item.id, 'checked', e.target.checked)} className="w-5 h-5 accent-aksana-primary cursor-pointer flex-shrink-0" />
                    {item.id > 4 ? (
                      <input type="text" value={item.name} onChange={(e) => handleUpdateAttendance(item.id, 'name', e.target.value)} placeholder="Nama Divisi..." className="bg-transparent border-none focus:ring-0 p-0 text-sm font-medium w-full text-slate-700 placeholder-slate-400 outline-none" />
                    ) : (<span className="text-sm font-medium text-slate-700">{item.name}</span>)}
                  </div>
                  {item.id > 4 && (
                    <button onClick={() => handleDeleteAttendance(item.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors flex-shrink-0" title="Hapus Divisi"><i className="fa-solid fa-xmark"></i></button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={handleAddAttendance} className="mt-4 text-sm font-semibold text-aksana-accent hover:text-aksana-primary transition-colors flex items-center gap-1"><i className="fa-solid fa-plus"></i> Tambah Divisi / Peserta</button>
          </div>
          <div className="card">
            <h3>Good News (Kabar Syukur)</h3>
            <div className="mt-5 flex flex-col gap-5 text-lg">
              <div><strong style={{ color: 'var(--accent)' }}>Owner:</strong><Editable className="input-box" value={data.goodNews.owner} onChange={(val) => updateData('goodNews.owner', val)} style={{ marginTop: '5px' }} /></div>
              <div><strong style={{ color: 'var(--accent)' }}>Integrator:</strong><Editable className="input-box" value={data.goodNews.integrator} onChange={(val) => updateData('goodNews.integrator', val)} style={{ marginTop: '5px' }} /></div>
              <div><strong style={{ color: 'var(--accent)' }}>Perwakilan Tim:</strong><Editable className="input-box" value={data.goodNews.team} onChange={(val) => updateData('goodNews.team', val)} style={{ marginTop: '5px' }} /></div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI SLIDES TEMPLATE */}
      {[
        { title: 'Marketing', key: 'marketingKPI' }, { title: 'Creative', key: 'creativeKPI' },
        { title: 'Research & Development', key: 'rndKPI' }, { title: 'PPIC', key: 'ppicKPI' },
        { title: 'Finance', key: 'financeKPI' }, { title: 'Gudang', key: 'gudangKPI' },
      ].map((sheet, index) => (
        <div key={sheet.key} className={`slide ${currentSlide === (index + 2) ? 'active' : ''}`}>
          <div className="flex flex-col gap-1 mb-4">
            <h1>Scorecard: {sheet.title}</h1><div className="subtitle">Review KPI & Output</div>
          </div>
          <div className="card" style={{ height: 'auto' }}>
            <div className="overflow-x-auto w-full">
              <table className="min-w-[600px] md:min-w-full">
                <thead>
                  <tr>
                    <th style={{ width: '30%' }}>KPI</th><th style={{ width: '20%' }}>Target</th><th style={{ width: '20%' }}>Realisasi</th>
                    <th style={{ width: '15%', textAlign: 'center' }}>Jenis</th><th style={{ width: '15%', textAlign: 'center' }}>Status</th>
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
            </div>
            <button className="add-btn" onClick={() => addRow(sheet.key, { kpi: '', target: '', real: '', jenis: 'outcome', status: 'on' })}>+ Tambah KPI</button>
          </div>
        </div>
      ))}

      {/* 8. ROCK REVIEW */}
      <div className={`slide ${currentSlide === 8 ? 'active' : ''}`}>
        <div className="flex flex-col gap-1 mb-4">
          <h1>Rock Review</h1><div className="subtitle">Prioritas 90 Hari</div>
        </div>
        <div className="card" style={{ height: 'auto' }}>
          <div className="overflow-x-auto w-full">
            <table className="min-w-[600px] md:min-w-full">
              <thead><tr><th style={{width: '15%'}}>Owner</th><th style={{width: '40%'}}>Rock</th><th align="center" style={{width: '15%'}}>Status</th><th style={{width: '30%'}}>Catatan</th></tr></thead>
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
      </div>

      {/* 9. HEADLINES */}
      <div className={`slide ${currentSlide === 9 ? 'active' : ''}`}>
        <div className="flex flex-col gap-1 mb-4">
          <h1>Headlines</h1><div className="subtitle">Berita Penting (Customer & Internal)</div>
        </div>
        <div className="flex flex-col md:flex-row gap-5 md:gap-6 h-auto pb-5">
          <div className="card headline-card flex-1 min-h-[300px] md:min-h-0">
            <h3 style={{ color: 'var(--accent)' }}>Customer Headlines</h3>
            <div className="mt-4">
              {data.headlines.customer.map((hl, i) => (
                <div key={i} className="flex items-start gap-4 mb-3">
                  <span className="mt-3 font-extrabold text-slate-400 text-lg">{i + 1}.</span>
                  <Editable className="input-box" value={hl} onChange={(val) => {
                    const newHl = [...data.headlines.customer]; newHl[i] = val;
                    updateData('headlines', { ...data.headlines, customer: newHl });
                  }} />
                </div>
              ))}
            </div>
            <button className="add-btn" onClick={() => {
              const newHl = [...data.headlines.customer, ''];
              updateData('headlines', { ...data.headlines, customer: newHl });
            }}>+ Tambah Customer Headline</button>
          </div>
          <div className="card headline-card flex-1 min-h-[300px] md:min-h-0">
            <h3 style={{ color: 'var(--success)' }}>Internal Headlines</h3>
            <div className="mt-4">
              {data.headlines.internal.map((hl, i) => (
                <div key={i} className="flex items-start gap-4 mb-3">
                  <span className="mt-3 font-extrabold text-slate-400 text-lg">{i + 1}.</span>
                  <Editable className="input-box" value={hl} onChange={(val) => {
                    const newHl = [...data.headlines.internal]; newHl[i] = val;
                    updateData('headlines', { ...data.headlines, internal: newHl });
                  }} />
                </div>
              ))}
            </div>
            <button className="add-btn" onClick={() => {
              const newHl = [...data.headlines.internal, ''];
              updateData('headlines', { ...data.headlines, internal: newHl });
            }}>+ Tambah Internal Headline</button>
          </div>
        </div>
      </div>

      {/* 10. TO-DO LIST */}
      <div className={`slide ${currentSlide === 10 ? 'active' : ''}`}>
        <div className="flex flex-col gap-1 mb-4">
          <h1>To-Do List</h1><div className="subtitle">Review minggu lalu & Action Plan</div>
        </div>
        <div className="card" style={{ height: 'auto' }}>
          <ol className="todo-list">
            {data.todoList.map((item, i) => (
              <li key={i} className="todo-item flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <span className="todo-number">{i + 1}.</span>
                <div className="todo-text-wrapper flex-grow w-full">
                  <Editable className="input-box" value={item.text} onChange={(val) => updateListItem('todoList', i, 'text', val)} />
                  <div className="flex items-center mt-2">
                    <span className="owner-label text-sm font-semibold mr-2">Owner:</span>
                    <Editable className="owner-input" value={item.owner} onChange={(val) => updateListItem('todoList', i, 'owner', val)} />
                  </div>
                </div>
                <div className="todo-action flex-shrink-0 self-end sm:self-center">
                  <OutcomeButton outcome={item.outcome} onClick={() => updateListItem('todoList', i, 'outcome', item.outcome === 'done' ? 'not' : 'done')} />
                </div>
              </li>
            ))}
          </ol>
          <button className="add-btn" onClick={() => addRow('todoList', { text: '', owner: '', outcome: 'not' })}>+ Add To-Do</button>
        </div>
      </div>

      {/* 11. IDS */}
      <div className={`slide ${currentSlide === 11 ? 'active' : ''}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div className="flex flex-col gap-1">
            <h1>IDS Session</h1><div className="subtitle">Identify, Discuss, Solve (60 Menit)</div>
          </div>
          <button onClick={populateIDS} className="bg-red-600 text-white border-none py-2 px-4 rounded-md cursor-pointer text-sm font-semibold hover:bg-red-700 transition-colors w-full sm:w-auto">
            <i className="fa-solid fa-sync"></i> Tarik Data Off-Track
          </button>
        </div>
        <div className="ids-container flex flex-col md:flex-row gap-5 h-auto mt-4">
          <div className="ids-col card flex-1 flex flex-col min-h-[300px]">
            <h3 className="mb-4">1. Identify (Issues List)</h3>
            <div id="ids-identify-list" className="flex flex-col gap-3 pr-1">
              {data.ids.issues.map((issue, i) => (
                <div key={i} className="ids-item flex gap-3 items-start bg-slate-50 p-3 rounded-lg">
                  <input type="checkbox" checked={issue.checked} onChange={(e) => {
                    const newIssues = [...data.ids.issues]; newIssues[i].checked = e.target.checked;
                    updateData('ids', { ...data.ids, issues: newIssues });
                  }} className="mt-1 flex-shrink-0" />
                  <Editable className="ids-text" value={issue.text} onChange={(val) => {
                    const newIssues = [...data.ids.issues]; newIssues[i].text = val;
                    updateData('ids', { ...data.ids, issues: newIssues });
                  }} />
                </div>
              ))}
            </div>
            <button onClick={addIssue} className="w-full mt-4 bg-slate-100 border-none p-3 cursor-pointer font-semibold text-sm text-slate-500 rounded-lg hover:bg-slate-200 transition-colors">+ Manual Issue</button>
          </div>
          <div className="ids-col card flex-1 flex flex-col min-h-[300px]">
            <h3 className="mb-4">2. Discuss (Notes)</h3>
            <div className="w-full"><Editable className="ids-notes" style={{ width: '100%', minHeight: '200px' }} value={data.ids.notes} onChange={(val) => updateData('ids.notes', val)} /></div>
          </div>
          <div className="ids-col card flex-1 flex flex-col min-h-[300px]">
            <h3 className="mb-4">3. Solve (Action Items)</h3>
            <div className="w-full"><Editable className="ids-solutions" style={{ width: '100%', minHeight: '200px' }} value={data.ids.solutions} onChange={(val) => updateData('ids.solutions', val)} /></div>
          </div>
        </div>
      </div>

      {/* 12. RATING */}
      <div className={`slide ${currentSlide === 12 ? 'active' : ''}`}>
        <div className="flex flex-col gap-1 mb-4">
          <h1>Segmen Akhir</h1><div className="subtitle">Rating Rapat & Penutup (5 Menit)</div>
        </div>
        <div className="card" style={{ height: 'auto' }}>
          <h3>Beri Rating Rapat (1-10)</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 my-8">
            {['owner', 'integrator', 'marketing', 'creative', 'rnd', 'ppic', 'gudang', 'finance', 'moderator'].map((role) => (
              <div key={role} className="flex flex-col items-center bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm">
                <label className="capitalize text-xs font-bold text-slate-400 mb-2 tracking-wider">{role}</label>
                <input type="number" min="1" max="10" className="w-16 h-12 text-2xl text-center border-2 border-slate-200 rounded-lg font-bold text-aksana-primary focus:border-aksana-accent focus:ring-4 focus:ring-blue-50 outline-none transition-all" value={data.ratings[role] || ''} onChange={(e) => {
                  updateData('ratings', { ...data.ratings, [role]: e.target.value });
                }} />
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center mt-8 pt-8 border-t border-slate-100">
            <div className="text-sm font-bold text-slate-400 uppercase tracking-[3px] mb-2">Rata-Rata Rating</div>
            <div className="text-7xl md:text-9xl font-black text-aksana-primary leading-none">
              {(() => {
                const vals = Object.values(data.ratings).map(v => parseFloat(v)).filter(v => !isNaN(v));
                return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '0.0';
              })()}
            </div>
          </div>
          <p style={{ textAlign: 'center', color: 'var(--text-light)', marginTop: '30px', fontSize: '18px', fontStyle: 'italic' }}>
            "Rapat yang hebat dimulai dari kedisiplinan dan diakhiri dengan komitmen."
          </p>
        </div>
      </div>

      {/* FOOTER */}
      <div data-html2canvas-ignore="true" className="flex flex-col md:flex-row items-center justify-between gap-6 mt-12 pt-4 border-t border-slate-200 pb-6 md:sticky md:bottom-0 z-40 bg-white/90 backdrop-blur-md md:-mx-8 md:px-8 md:-mb-8 md:pb-8">
        <div className="w-full md:w-auto flex justify-center md:justify-start">
          <button className="flex items-center gap-2 bg-slate-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-700 transition-all shadow-md active:scale-95 text-sm" onClick={generatePDF}>
            <i className="fa-solid fa-file-pdf"></i> High Quality PDF Report
          </button>
        </div>
        <div className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white border shadow-sm text-sm font-medium ${cloudStatus === 'error' ? 'text-red-500 border-red-100' : 'text-aksana-primary border-slate-100'}`}>
          <i className={`fa-solid ${cloudStatus === 'saving' ? 'fa-spinner fa-spin' : 'fa-cloud'}`}></i>
          <span>{cloudMsg}</span>
        </div>
        <div className="w-full md:w-auto flex justify-center md:justify-end gap-4">
          <button className="w-14 h-14 flex items-center justify-center rounded-full bg-aksana-primary text-white shadow-lg hover:bg-aksana-accent transition-all active:scale-90" onClick={(e) => { e.stopPropagation(); prevSlide(); }}>
            <i className="fa-solid fa-chevron-left text-xl"></i>
          </button>
          <div className="flex items-center justify-center font-bold text-slate-400 bg-slate-50 px-4 rounded-xl border">
            {currentSlide + 1} / 13
          </div>
          <button className="w-14 h-14 flex items-center justify-center rounded-full bg-aksana-primary text-white shadow-lg hover:bg-aksana-accent transition-all active:scale-90" onClick={(e) => { e.stopPropagation(); nextSlide(); }}>
            <i className="fa-solid fa-chevron-right text-xl"></i>
          </button>
        </div>
      </div>

    </div>
  );
}

export default App;
