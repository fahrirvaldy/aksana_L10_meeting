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

// PERBAIKAN BUG #3: Ganti div contentEditable dengan textarea auto-resize
const Editable = ({ value, onChange, placeholder, className, style, id }) => {
  return (
    <textarea
      id={id}
      className={className}
      style={{
        width: '100%',
        background: 'transparent',
        border: 'none',
        outline: 'none',
        resize: 'none',
        fontFamily: 'inherit',
        fontSize: 'inherit',
        color: 'inherit',
        fontWeight: 'inherit',
        overflow: 'hidden',
        padding: 0,
        margin: 0,
        display: 'block',
        lineHeight: '1.5',
        ...style
      }}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={1}
      onInput={(e) => {
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
      }}
      onFocus={(e) => {
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
      }}
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

  const [attendances, setAttendances] = useState(() => {
    const saved = localStorage.getItem('L10_Meeting_Data');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.attendances) return parsed.attendances;
      if (parsed.attendance) {
        return parsed.attendance.map((a, i) => ({ 
          id: i + 1, name: a.role || a.name, checked: a.checked 
        }));
      }
    }
    return [
      { id: 1, name: 'Owner', checked: false }, 
      { id: 2, name: 'Integrator', checked: false }, 
      { id: 3, name: 'Marketing', checked: false }, 
      { id: 4, name: 'Creative', checked: false }
    ];
  });

  const [timeLeft, setTimeLeft] = useState(90 * 60);
  const [isPaused, setIsPaused] = useState(true);
  const [cloudMsg, setCloudMsg] = useState('Menghubungkan...');
  const [cloudStatus, setCloudStatus] = useState('saving');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // PERBAIKAN BUG #4: Mengambil data dari Backend saat Mount
  useEffect(() => {
    const fetchCloudData = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/l10');
        const json = await res.json();
        if (json.success && json.data) {
          if (json.data.attendances) setAttendances(json.data.attendances);
          setData(prev => ({ ...prev, ...json.data, attendances: undefined }));
          setCloudMsg('Terhubung ke Cloud');
          setCloudStatus('saved');
        }
      } catch (err) {
        setCloudMsg('Offline Mode (Local Storage)');
        setCloudStatus('error');
      }
    };
    fetchCloudData();
  }, []);

  // PERBAIKAN BUG #4: Mengirim data ke Backend via PUT
  const saveAllData = useCallback(async () => {
    const dataToSave = { ...data, attendances };
    localStorage.setItem('L10_Meeting_Data', JSON.stringify(dataToSave));
    
    setCloudMsg('Menyimpan ke Cloud...');
    setCloudStatus('saving');
    try {
      const res = await fetch('http://localhost:5000/api/l10', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave)
      });
      if (res.ok) {
        setCloudMsg('Tersimpan di Cloud');
        setCloudStatus('saved');
      } else {
        setCloudMsg('Gagal Menyimpan (Cloud)');
        setCloudStatus('error');
      }
    } catch (err) {
      setCloudMsg('Tersimpan Lokal (Offline)');
      setCloudStatus('saved');
    }
  }, [data, attendances]);

  const debouncedSave = useCallback(() => {
    setCloudMsg('Mengetik...');
    setCloudStatus('saving');
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      saveAllData();
    }, 1500); // Tunggu 1.5 detik setelah berhenti mengetik
    return () => clearTimeout(timer);
  }, [data, attendances, saveAllData]);

  // --- ATTENDANCE HANDLERS ---
  const handleAddAttendance = () => {
    const newId = attendances.length > 0 ? Math.max(...attendances.map(a => a.id)) + 1 : 1;
    setAttendances([...attendances, { id: newId, name: '', checked: false }]);
    debouncedSave();
  };

  const handleDeleteAttendance = (id) => {
    setAttendances(attendances.filter(a => a.id !== id));
    debouncedSave();
  };

  const handleUpdateAttendance = (id, field, value) => {
    setAttendances(attendances.map(a => a.id === id ? { ...a, [field]: value } : a));
    debouncedSave();
  };

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
  // PERBAIKAN BUG #3: Deep clone menggunakan JSON.parse(JSON.stringify) agar mutasi nested state aman
  const updateData = (path, value) => {
    setData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let current = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
    debouncedSave();
  };

  const updateListItem = (listKey, index, field, value) => {
    setData((prev) => {
      const newList = [...prev[listKey]];
      newList[index] = { ...newList[index], [field]: value };
      return { ...prev, [listKey]: newList };
    });
    debouncedSave();
  };

  const addRow = (listKey, template) => {
    setData((prev) => ({
      ...prev,
      [listKey]: [...prev[listKey], template]
    }));
    debouncedSave();
  };

  // PERBAIKAN BUG #2: Fungsi khusus untuk menambah issue IDS agar tidak error mencari prev['ids.issues']
  const addIssue = () => {
    setData(prev => ({
      ...prev,
      ids: {
        ...prev.ids,
        issues: [...prev.ids.issues, { text: 'Masalah baru...', checked: false }]
      }
    }));
    debouncedSave();
  };

  const nextSlide = () => {
    if (currentSlide < 12) setCurrentSlide(currentSlide + 1);
  };

  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
  };

  // PERBAIKAN BUG #1: Logika tarik Off-Track disempurnakan agar tidak tumpang tindih
  const populateIDS = () => {
    const offTrackKPIs = [];
    ['marketingKPI', 'creativeKPI', 'rndKPI', 'ppicKPI', 'financeKPI', 'gudangKPI', 'rockReview'].forEach(key => {
      if (data[key]) {
        data[key].forEach(item => {
          if (item.status === 'off') {
            offTrackKPIs.push(item.kpi || item.rock);
          }
        });
      }
    });

    setData(prev => {
      const existingTexts = prev.ids.issues.map(i => i.text);
      // Filter agar tidak memasukkan masalah yang sudah ada di list
      const newIssues = offTrackKPIs
        .filter(text => !existingTexts.includes(text))
        .map(text => ({ text, checked: false }));
        
      return {
        ...prev,
        ids: {
          ...prev.ids,
          issues: [...prev.ids.issues, ...newIssues]
        }
      };
    });
    debouncedSave();
  };

  const saveAsPDF = async () => {
    setIsGeneratingPdf(true);
    document.body.classList.add('generating-pdf');
    
    await new Promise(r => setTimeout(r, 500));
    
    const pdf = new jsPDF({ orientation: 'l', unit: 'mm', format: 'a4', compress: true });
    const slides = document.querySelectorAll('.slide');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const originalDisplay = slide.style.display;
      slide.style.display = 'flex'; 

      try {
        const canvas = await html2canvas(slide, {
          scale: 3, 
          useCORS: true,
          logging: false,
          backgroundColor: '#f8fafc',
          windowWidth: 1920,
          windowHeight: 1080
        });
        
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const imgProps = pdf.getImageProperties(imgData);
        const ratio = imgProps.width / imgProps.height;

        let finalWidth = pdfWidth;
        let finalHeight = pdfWidth / ratio;

        if (finalHeight > pdfHeight) {
          finalHeight = pdfHeight;
          finalWidth = pdfHeight * ratio;
        }

        const x = (pdfWidth - finalWidth) / 2;
        const y = (pdfHeight - finalHeight) / 2;

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', x, y, finalWidth, finalHeight, undefined, 'FAST');
      } catch (err) {
        console.error("Slide capture failed", err);
      } finally {
        slide.style.display = originalDisplay;
      }
    }
    
    pdf.save('L10_Meeting_Report_HQ.pdf');
    document.body.classList.remove('generating-pdf');
    setIsGeneratingPdf(false);
  };

  const getCurrentDate = () => {
    const today = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${days[today.getDay()]}, ${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;
  };

  useEffect(() => {
    if (data.meetingDate === 'Senin, ...') {
      updateData('meetingDate', getCurrentDate());
    }
  }, []);

  return (
    <div className={isGeneratingPdf ? 'generating-pdf' : ''}>
      
      {/* --- SUNTIKAN CSS PERBAIKAN LAYOUT (FOOTER SAFE ZONE) --- */}
      <style>{`
        /* 1. Kembalikan tombol aksi ke bawah, dan pindahkan Status Cloud ke TENGAH BAWAH */
        .action-btn, .nav-controls { z-index: 100 !important; }
        .cloud-status { 
          position: fixed !important; 
          bottom: 30px !important; 
          left: 50% !important; 
          transform: translateX(-50%) !important; /* Trik CSS untuk persis di tengah */
          margin: 0 !important;
          z-index: 100 !important; 
        }

        /* 2. BATASI TINGGI KONTEN BAWAH (Safe Zone) */
        .card, .ids-col { 
          max-height: 65vh !important; 
          margin-bottom: 80px !important; 
        }
        
        .card > div, .card > table, .card > ol {
          padding-bottom: 40px !important;
        }

        /* 3. Override khusus untuk kartu Headlines agar tingginya simetris 50:50 */
        .headline-card { margin-bottom: 0 !important; max-height: none !important; flex: 1; }
      `}</style>

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
      <div className={`cloud-status ${cloudStatus === 'error' ? 'error' : 'saved'}`}>
        <i className="fa-solid fa-cloud"></i> <span>{cloudMsg}</span>
      </div>

      {/* SLIDES */}

      {/* 1. TITLE */}
      <div className={`slide ${currentSlide === 0 ? 'active' : ''}`}>
        <div className="card" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', border: 'none', background: 'transparent', boxShadow: 'none' }}>
          <h1 style={{ fontSize: '64px', color: 'var(--primary)', marginBottom: '10px' }}>LEVEL 10 MEETING</h1>
          <h2 style={{ fontSize: '36px', color: 'var(--accent)', marginBottom: '50px', fontWeight: 500 }}>Ammarkids Operational</h2>
          <div style={{ background: 'white', padding: '30px 60px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{ fontSize: '16px', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '1px' }}>Tanggal Rapat</div>
              <button 
                onClick={() => updateData('meetingDate', getCurrentDate())} 
                style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '14px', padding: '5px', borderRadius: '50%' }} 
                title="Set Otomatis ke Hari Ini"
                className="hover:bg-slate-100 transition-colors"
              >
                <i className="fa-solid fa-arrows-rotate"></i>
              </button>
            </div>

            {/* TANGGAL SEKARANG DIBUAT STATIS (TIDAK BISA DIKETIK MANUAL) */}
            <div 
              className="editable-date"
              style={{ fontSize: '32px', fontWeight: 800, color: 'var(--primary)', textAlign: 'center', padding: '5px 0' }}
            >
              {data.meetingDate}
            </div>
          </div>
        </div>
      </div>

      {/* 2. SEGMEN AWAL */}
      <div className={`slide ${currentSlide === 1 ? 'active' : ''}`}>
        <h1>Segmen Awal</h1>
        <div className="subtitle">Kehadiran & Kabar Baik (5 Menit)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', height: '100%' }}>
          <div className="card" style={{ overflowY: 'auto', maxHeight: '65vh' }}>
            <h3>Daftar Hadir</h3>
            <div id="attendance-grid" className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              {attendances.map((item) => (
                <div key={item.id} className="flex items-center gap-3 group bg-slate-50 p-2 rounded-lg border border-transparent hover:border-slate-200 transition-all">
                  <input 
                    type="checkbox" 
                    checked={item.checked}
                    onChange={(e) => handleUpdateAttendance(item.id, 'checked', e.target.checked)}
                    className="w-5 h-5 accent-aksana-primary cursor-pointer flex-shrink-0"
                  />
                  <input 
                    type="text" 
                    value={item.name}
                    onChange={(e) => handleUpdateAttendance(item.id, 'name', e.target.value)}
                    placeholder="Nama Divisi..."
                    className="flex-grow bg-transparent border-none outline-none font-medium text-slate-700 focus:ring-0 p-0"
                  />
                  <button 
                    onClick={() => handleDeleteAttendance(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity p-1"
                    title="Hapus Divisi"
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
              ))}
            </div>
            <button 
              onClick={handleAddAttendance} 
              className="mt-4 text-sm font-semibold text-aksana-accent hover:text-aksana-primary transition-colors flex items-center gap-1"
            >
              <i className="fa-solid fa-plus"></i> Tambah Divisi / Peserta
            </button>
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
          <div className="card" style={{ overflowY: 'auto', maxHeight: '70vh' }}>
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
        <div className="card" style={{ overflowY: 'auto', maxHeight: '70vh' }}>
          <table>
            <thead>
              <tr><th style={{width: '15%'}}>Owner</th><th style={{width: '40%'}}>Rock</th><th align="center" style={{width: '15%'}}>Status</th><th style={{width: '30%'}}>Catatan</th></tr>
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
        
        {/* Wrapper Flexbox untuk membagi tinggi 50:50 */}
        <div className="stacked-layout" style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '65vh', paddingBottom: '20px' }}>
          
          <div className="card headline-card" style={{ overflowY: 'auto' }}>
            <h3 style={{ color: 'var(--accent)' }}>Customer Headlines</h3>
            <div>
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
            <button className="add-btn" onClick={() => {
              const newHl = [...data.headlines.customer, '...'];
              updateData('headlines.customer', newHl);
            }}>+ Tambah Customer Headline</button>
          </div>
          
          <div className="card headline-card" style={{ overflowY: 'auto' }}>
            <h3 style={{ color: 'var(--success)' }}>Internal Headlines</h3>
            <div>
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
            <button className="add-btn" onClick={() => {
              const newHl = [...data.headlines.internal, '...'];
              updateData('headlines.internal', newHl);
            }}>+ Tambah Internal Headline</button>
          </div>

        </div>
      </div>

      {/* 10. TO-DO LIST */}
      <div className={`slide ${currentSlide === 10 ? 'active' : ''}`}>
        <h1>To-Do List</h1>
        <div className="subtitle">Review minggu lalu & Action Plan</div>
        <div className="card" style={{ overflowY: 'auto', maxHeight: '70vh' }}>
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
        <div className="ids-container" style={{ display: 'flex', gap: '20px', height: '65vh' }}>
          
          <div className="ids-col card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginBottom: '15px' }}>1. Identify (Issues List)</h3>
            {/* PERBAIKAN BUG #5: Mengurung daftar IDS dengan overflowY agar bisa di-scroll */}
            <div id="ids-identify-list" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '5px' }}>
              {data.ids.issues.map((issue, i) => (
                <div key={i} className="ids-item" style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                  <input 
                    type="checkbox" 
                    checked={issue.checked} 
                    onChange={(e) => {
                      const newIssues = [...data.ids.issues];
                      newIssues[i].checked = e.target.checked;
                      updateData('ids.issues', newIssues);
                    }}
                    style={{ marginTop: '5px' }}
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
            <button onClick={addIssue} style={{ width: '100%', marginTop: '15px', background: '#f1f5f9', border: 'none', padding: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', color: 'var(--text-light)', borderRadius: '8px' }}>+ Manual Issue</button>
          </div>
          
          <div className="ids-col card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginBottom: '15px' }}>2. Discuss (Notes)</h3>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <Editable 
                className="ids-notes" 
                style={{ height: '100%', minHeight: '300px' }} 
                value={data.ids.notes} 
                onChange={(val) => updateData('ids.notes', val)} 
              />
            </div>
          </div>
          
          <div className="ids-col card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginBottom: '15px' }}>3. Solve (Action Items)</h3>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <Editable 
                className="ids-solutions" 
                style={{ height: '100%', minHeight: '300px' }} 
                value={data.ids.solutions} 
                onChange={(val) => updateData('ids.solutions', val)} 
              />
            </div>
          </div>

        </div>
      </div>

      {/* 12. RATING */}
      <div className={`slide ${currentSlide === 12 ? 'active' : ''}`}>
        <h1>Segmen Akhir</h1>
        <div className="subtitle">Rating Rapat & Penutup (5 Menit)</div>
        <div className="card" style={{ justifyContent: 'center', height: '65vh', overflowY: 'auto' }}>
          <h3>Beri Rating Rapat (1-10)</h3>
          <div className="rating-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center', margin: '30px 0' }}>
            {Object.keys(data.ratings).map((role) => (
              <div key={role} className="rating-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f8fafc', padding: '15px', borderRadius: '10px', width: '120px' }}>
                <label style={{ textTransform: 'capitalize', fontSize: '14px', fontWeight: 600, color: 'var(--text-light)', marginBottom: '10px' }}>{role}</label>
                <input 
                  type="number" 
                  min="1" max="10" 
                  style={{ width: '60px', height: '50px', fontSize: '24px', textAlign: 'center', border: '2px solid #e2e8f0', borderRadius: '8px', fontWeight: 'bold' }}
                  value={data.ratings[role]} 
                  onChange={(e) => updateData(`ratings.${role}`, e.target.value)}
                />
              </div>
            ))}
          </div>
          <div className="rating-avg" style={{ textAlign: 'center', marginTop: '30px' }}>
            <div style={{ fontSize: '80px', fontWeight: 900, color: 'var(--primary)' }}>
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

    </div>
  );
}

export default App;