import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  FileSpreadsheet, 
  UploadCloud, 
  TrendingUp,
  Search,
  PlusCircle,
  FileBarChart,
  CheckCircle2,
  AlertCircle,
  Download,
  Edit,
  Camera,
  X,
  Save,
  FilePlus,
  FileText,
  Printer
} from 'lucide-react';

const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

const initialBudget = [
  {
    id: 1, perusahaan: "pt-a", coa: "1601.01", kodeAsset: "AST-24-001", groupAsset: "Peralatan Dan Perlengkapan", itemCapex: "Server Rack 42U", satuan: "Unit", prioritas: "Tinggi",
    monthly: Array(12).fill({ qty: 0, rupiah: 0 }).map((_, i) => i === 0 ? { qty: 2, rupiah: 45000000 } : { qty: 0, rupiah: 0 })
  },
  {
    id: 2, perusahaan: "pt-a", coa: "1601.02", kodeAsset: "AST-24-002", groupAsset: "Kendaraan", itemCapex: "Mobil MPV", satuan: "Unit", prioritas: "Sedang",
    monthly: Array(12).fill({ qty: 0, rupiah: 0 }).map((_, i) => i === 3 ? { qty: 1, rupiah: 250000000 } : { qty: 0, rupiah: 0 })
  },
  {
    id: 3, perusahaan: "pt-b", coa: "1602.01", kodeAsset: "AST-24-003", groupAsset: "Bangunan", itemCapex: "Pengecatan Interior", satuan: "Lot", prioritas: "Rendah",
    monthly: Array(12).fill({ qty: 0, rupiah: 0 }).map((_, i) => i === 5 ? { qty: 1, rupiah: 75000000 } : { qty: 0, rupiah: 0 })
  }
];

const initialPpint = [
  { id: 1, perusahaan: "pt-a", noPpint: "PPINT-24-001", tanggal: "2024-01-10", kodeAsset: "AST-24-001", itemCapex: "Server Rack 42U", satuanQty: "2 Unit", prioritas: "Tinggi", jumlahBiaya: 45000000, keterangan: "Pengadaan server baru divisi IT", rencanaBulan: "Januari (Qty: 2, Rp 45.000.000)" }
];

const initialRealisasi = [
  { id: 101, perusahaan: "pt-a", tanggal: "2024-01-15", noPpint: "PPINT-24-001", kodeAsset: "AST-24-001", itemCapex: "Server Rack 42U", qty: "2 Unit", rupiah: 44500000, keterangan: "Pembelian Server Rack" },
];

const formatRp = (value) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPerusahaan, setSelectedPerusahaan] = useState('all');
  const [budgetData, setBudgetData] = useState(initialBudget);
  const [realisasiData, setRealisasiData] = useState(initialRealisasi);
  const [ppintData, setPpintData] = useState(initialPpint);
  
  const [formRealisasi, setFormRealisasi] = useState({ tanggal: '', noPpint: '', kodeAsset: '', itemCapex: '', qty: '', rupiah: '', keterangan: '' });

  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const [editingBudget, setEditingBudget] = useState(null);
  const [logoUrl, setLogoUrl] = useState('Gemini_Generated_Image_yxy9jeyxy9jeyxy9.png');

  const [ppintModal, setPpintModal] = useState({ isOpen: false, data: null });
  const [formPpint, setFormPpint] = useState({ noPpint: '', tanggal: '', itemCapexManual: '', qtyPengajuan: '', jumlahBiaya: '', keterangan: '' });

  const [printPpintModal, setPrintPpintModal] = useState(null);

  const filteredBudget = useMemo(() => {
    if (selectedPerusahaan === 'all') return budgetData;
    return budgetData.filter(b => b.perusahaan === selectedPerusahaan);
  }, [budgetData, selectedPerusahaan]);

  const filteredRealisasi = useMemo(() => {
    if (selectedPerusahaan === 'all') return realisasiData;
    return realisasiData.filter(r => r.perusahaan === selectedPerusahaan);
  }, [realisasiData, selectedPerusahaan]);

  const filteredPpint = useMemo(() => {
    if (selectedPerusahaan === 'all') return ppintData;
    return ppintData.filter(p => p.perusahaan === selectedPerusahaan);
  }, [ppintData, selectedPerusahaan]);

  const { totalBudget, totalRealisasi, sisaBudget } = useMemo(() => {
    let tBudget = 0;
    filteredBudget.forEach(item => {
      item.monthly.forEach(m => { tBudget += m.rupiah; });
    });

    let tRealisasi = 0;
    filteredRealisasi.forEach(item => { tRealisasi += Number(item.rupiah); });

    return { totalBudget: tBudget, totalRealisasi: tRealisasi, sisaBudget: tBudget - tRealisasi };
  }, [filteredBudget, filteredRealisasi]);

  const reportData = useMemo(() => {
    return filteredBudget.map(b => {
      let bTotal = 0;
      let bQty = 0;
      b.monthly.forEach(m => {
        bTotal += m.rupiah;
        bQty += m.qty;
      });
      
      let rTotal = 0;
      let rQty = 0;
      filteredRealisasi.filter(r => r.kodeAsset === b.kodeAsset).forEach(r => {
        rTotal += Number(r.rupiah);
        // Extract numeric part from qty string like "2 Unit"
        const qNum = parseInt(r.qty) || 0;
        rQty += qNum;
      });
      
      return {
        kodeAsset: b.kodeAsset,
        groupAsset: b.groupAsset,
        itemCapex: b.itemCapex,
        satuan: b.satuan,
        budgetQty: bQty,
        realisasiQty: rQty,
        budget: bTotal,
        realisasi: rTotal,
        sisa: bTotal - rTotal,
        persentase: bTotal === 0 ? 0 : (rTotal / bTotal) * 100
      };
    });
  }, [filteredBudget, filteredRealisasi]);

  const handleDownloadTemplate = () => {
    // Generate CSV template matching Budget CAPEX structure
    const headers = [
      "Perusahaan", "COA", "Kode_Asset", "Group_Asset", "Item_Capex", "Satuan", "Prioritas",
      ...MONTHS.map(m => `${m}_Qty`),
      ...MONTHS.map(m => `${m}_Rupiah`)
    ];
    
    const sampleRow = [
      "pt-a", "1601.01", "AST-24-001", "Peralatan Dan Perlengkapan", "Server Rack 42U", "Unit", "Tinggi",
      "2", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0",
      "45000000", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0"
    ];

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), sampleRow.join(",")].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Template_Master_Budget_CAPEX.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSimulateUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    setUploadSuccess(false);
    
    setTimeout(() => {
      const newDummyData = {
        id: Date.now(), perusahaan: selectedPerusahaan === 'all' ? 'pt-a' : selectedPerusahaan, coa: "1603.05", kodeAsset: `AST-24-00${budgetData.length + 1}`, 
        groupAsset: "Mesin-Mesin", itemCapex: "Genset 500kVA", satuan: "Unit", prioritas: "Tinggi",
        monthly: Array(12).fill({ qty: 0, rupiah: 0 }).map((_, i) => i === 7 ? { qty: 1, rupiah: 150000000 } : { qty: 0, rupiah: 0 })
      };
      
      setBudgetData([...budgetData, newDummyData]);
      setIsUploading(false);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    }, 1500);
  };

  const handlePpintChange = (e) => {
    const selectedNo = e.target.value;
    const selectedPpint = ppintData.find(p => p.noPpint === selectedNo);
    
    setFormRealisasi({
      ...formRealisasi,
      noPpint: selectedNo,
      kodeAsset: selectedPpint ? selectedPpint.kodeAsset : '',
      itemCapex: selectedPpint ? selectedPpint.itemCapex : formRealisasi.itemCapex,
      qty: selectedPpint ? selectedPpint.satuanQty : formRealisasi.qty,
      rupiah: selectedPpint ? selectedPpint.jumlahBiaya : formRealisasi.rupiah
    });
  };

  const handleSubmitRealisasi = (e) => {
    e.preventDefault();
    if (!formRealisasi.kodeAsset || !formRealisasi.rupiah) return;
    
    const targetPerusahaan = selectedPerusahaan === 'all' ? 'pt-a' : selectedPerusahaan;
    setRealisasiData([...realisasiData, { ...formRealisasi, perusahaan: targetPerusahaan, id: Date.now() }]);
    setFormRealisasi({ tanggal: '', noPpint: '', kodeAsset: '', itemCapex: '', qty: '', rupiah: '', keterangan: '' });
    alert("Data realisasi berhasil disimpan!");
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newLogoUrl = URL.createObjectURL(file);
      setLogoUrl(newLogoUrl);
    }
  };

  const handleEditMonthly = (index, field, value) => {
    const newMonthly = [...editingBudget.monthly];
    newMonthly[index] = { ...newMonthly[index], [field]: Number(value) };
    setEditingBudget({ ...editingBudget, monthly: newMonthly });
  };

  const handleSaveBudget = (e) => {
    e.preventDefault();
    setBudgetData(budgetData.map(b => b.id === editingBudget.id ? editingBudget : b));
    setEditingBudget(null);
    alert("Data master budget beserta rencana cashflow bulanan berhasil diperbarui!");
  };

  const openPpintModal = (budgetRow) => {
    const totalRowBudget = budgetRow.monthly.reduce((sum, m) => sum + m.rupiah, 0);
    const totalRowQty = budgetRow.monthly.reduce((sum, m) => sum + m.qty, 0);
    const rencana = budgetRow.monthly
      .map((m, i) => m.rupiah > 0 ? `${MONTHS[i]} (Qty: ${m.qty}, ${formatRp(m.rupiah)})` : null)
      .filter(Boolean)
      .join(', ');

    setPpintModal({ isOpen: true, data: { ...budgetRow, rencanaBulan: rencana || 'Belum ada alokasi' } });
    setFormPpint({ 
      noPpint: `PPINT-24-${String(ppintData.length + 1).padStart(3, '0')}`, 
      tanggal: '', 
      itemCapexManual: budgetRow.itemCapex,
      qtyPengajuan: `${totalRowQty || 1} ${budgetRow.satuan}`,
      jumlahBiaya: totalRowBudget,
      keterangan: ''
    });
  };

  const handleSubmitPpint = (e) => {
    e.preventDefault();
    const newPpint = {
      id: Date.now(),
      perusahaan: ppintModal.data.perusahaan,
      noPpint: formPpint.noPpint,
      tanggal: formPpint.tanggal,
      kodeAsset: ppintModal.data.kodeAsset,
      itemCapex: formPpint.itemCapexManual,
      satuanQty: formPpint.qtyPengajuan,
      prioritas: ppintModal.data.prioritas,
      jumlahBiaya: Number(formPpint.jumlahBiaya),
      keterangan: formPpint.keterangan,
      rencanaBulan: ppintModal.data.rencanaBulan
    };
    setPpintData([...ppintData, newPpint]);
    setPpintModal({ isOpen: false, data: null });
    alert(`Pengajuan ${newPpint.noPpint} berhasil dibuat!`);
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Dashboard CAPEX</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Wallet size={28} /></div>
          <div className="min-w-0">
            <p className="text-sm text-slate-500 font-medium">Total Budget</p>
            <p className="text-xl font-bold text-slate-800 truncate" title={formatRp(totalBudget)}>{formatRp(totalBudget)}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center space-x-4">
          <div className="p-3 bg-rose-100 text-rose-600 rounded-lg"><TrendingUp size={28} /></div>
          <div className="min-w-0">
            <p className="text-sm text-slate-500 font-medium">Total Realisasi</p>
            <p className="text-xl font-bold text-slate-800 truncate" title={formatRp(totalRealisasi)}>{formatRp(totalRealisasi)}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center space-x-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg"><LayoutDashboard size={28} /></div>
          <div className="min-w-0">
            <p className="text-sm text-slate-500 font-medium">Sisa Budget</p>
            <p className="text-xl font-bold text-slate-800 truncate" title={formatRp(sisaBudget)}>{formatRp(sisaBudget)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Highlight Sisa Budget Capex</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="py-3 px-4 rounded-tl-lg">Kode Asset</th>
                <th className="py-3 px-4">Group Asset</th>
                <th className="py-3 px-4">Sisa Budget</th>
                <th className="py-3 px-4 rounded-tr-lg">Status Terpakai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reportData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-indigo-600">{row.kodeAsset}</td>
                  <td className="py-3 px-4">{row.groupAsset}</td>
                  <td className="py-3 px-4 font-medium text-emerald-600">{formatRp(row.sisa)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div className={`h-2.5 rounded-full ${row.persentase > 80 ? 'bg-rose-500' : row.persentase > 50 ? 'bg-amber-400' : 'bg-emerald-500'}`} style={{ width: `${Math.min(row.persentase, 100)}%` }}></div>
                      </div>
                      <span className="text-xs font-semibold">{row.persentase.toFixed(0)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
              {reportData.length === 0 && (
                <tr><td colSpan="4" className="text-center py-6 text-slate-400">Tidak ada data untuk filter perusahaan ini.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderBudget = () => (
    <div className="space-y-4 flex flex-col h-full">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Budget CAPEX</h2>
        
        <div className="flex space-x-3">
          <button 
            onClick={handleDownloadTemplate}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 font-medium transition-colors text-sm"
          >
            <Download size={16} />
            <span>Download Template</span>
          </button>
          
          <div className="relative">
            <input 
              type="file" 
              accept=".xlsx, .xls, .csv" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleSimulateUpload}
              disabled={isUploading}
            />
            <button className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-white font-medium transition-colors text-sm ${isUploading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
              {isUploading ? <Search className="animate-spin" size={16} /> : <UploadCloud size={16} />}
              <span>{isUploading ? 'Memproses Excel...' : 'Upload Budget Excel'}</span>
            </button>
          </div>
        </div>
      </div>
      
      {uploadSuccess && (
        <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg flex items-center space-x-2">
          <CheckCircle2 size={18} />
          <span>Berhasil membaca data dari file Excel dan memperbarui sistem.</span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="min-w-max w-full text-left text-xs border-collapse">
            <thead className="bg-[#fffde7] text-slate-800 border-b-2 border-slate-300 sticky top-0 z-10">
              <tr>
                <th className="border p-2 text-center align-middle bg-[#fef08a]" rowSpan="2">Aksi</th>
                <th className="border p-2 text-center align-middle" rowSpan="2">COA</th>
                <th className="border p-2 text-center align-middle" rowSpan="2">Kode_Asset</th>
                <th className="border p-2 text-center align-middle min-w-[150px]" rowSpan="2">Group_Asset</th>
                <th className="border p-2 text-center align-middle min-w-[150px]" rowSpan="2">Item_Capex</th>
                <th className="border p-2 text-center align-middle" rowSpan="2">Satuan</th>
                <th className="border p-2 text-center align-middle" rowSpan="2">Prioritas</th>
                <th className="border p-2 text-center align-middle bg-[#fef08a]" rowSpan="2">Total_Qty</th>
                <th className="border p-2 text-center align-middle bg-[#fef08a]" rowSpan="2">Total_Capex</th>
                {MONTHS.map(m => (
                  <th key={m} className="border p-2 text-center" colSpan="2">{m}</th>
                ))}
              </tr>
              <tr>
                {MONTHS.map(m => (
                  <React.Fragment key={m+"_sub"}>
                    <th className="border p-2 text-center bg-[#fff9c4]">Qty</th>
                    <th className="border p-2 text-center bg-[#fff9c4] min-w-[100px]">Rupiah</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredBudget.map((row, idx) => {
                const rowTotalQty = row.monthly.reduce((sum, m) => sum + m.qty, 0);
                const rowTotalCapex = row.monthly.reduce((sum, m) => sum + m.rupiah, 0);
                return (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="border p-2 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button onClick={() => setEditingBudget({...row})} className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors" title="Edit Data"><Edit size={14} /></button>
                        <button onClick={() => openPpintModal(row)} className="p-1.5 bg-emerald-100 text-emerald-600 rounded hover:bg-emerald-200 transition-colors" title="Pengajuan PPINT"><FilePlus size={14} /></button>
                      </div>
                    </td>
                    <td className="border p-2 text-center">{row.coa}</td>
                    <td className="border p-2 font-medium text-indigo-600">{row.kodeAsset}</td>
                    <td className="border p-2">{row.groupAsset}</td>
                    <td className="border p-2">{row.itemCapex}</td>
                    <td className="border p-2 text-center">{row.satuan}</td>
                    <td className="border p-2 text-center">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${row.prioritas === 'Tinggi' ? 'bg-rose-100 text-rose-700' : row.prioritas === 'Sedang' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                        {row.prioritas}
                      </span>
                    </td>
                    <td className="border p-2 text-center font-bold text-slate-700 bg-slate-50">{rowTotalQty}</td>
                    <td className="border p-2 text-right font-bold text-slate-700 bg-slate-50">{formatRp(rowTotalCapex)}</td>
                    
                    {row.monthly.map((m, mIdx) => (
                      <React.Fragment key={mIdx}>
                        <td className="border p-2 text-center">{m.qty || '-'}</td>
                        <td className="border p-2 text-right">{m.rupiah ? new Intl.NumberFormat('id-ID').format(m.rupiah) : '-'}</td>
                      </React.Fragment>
                    ))}
                  </tr>
                );
              })}
              {filteredBudget.length === 0 && (
                 <tr>
                    <td colSpan={10 + (12*2)} className="text-center p-8 text-slate-500">Tidak ada data budget untuk perusahaan yang dipilih.</td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="text-xs text-slate-500 flex items-center space-x-1"><AlertCircle size={14}/><span>Klik icon Edit untuk mengubah data / alokasi bulan, atau icon Plus hijau untuk membuat pengajuan PPINT.</span></div>
    </div>
  );

  const renderRealisasi = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Input Realisasi CAPEX</h2>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-lg font-semibold mb-4 text-slate-700 flex items-center"><PlusCircle className="mr-2" size={20} /> Form Pencatatan Realisasi</h3>
        <form onSubmit={handleSubmitRealisasi} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-600">Tanggal Realisasi</label>
            <input type="date" required className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" value={formRealisasi.tanggal} onChange={e => setFormRealisasi({...formRealisasi, tanggal: e.target.value})} />
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-600">Pilih No PPINT (Pengajuan)</label>
            <select className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-emerald-50" value={formRealisasi.noPpint} onChange={handlePpintChange}>
              <option value="">-- Tanpa PPINT / Pilih --</option>
              {filteredPpint.map(p => (
                <option key={p.id} value={p.noPpint}>{p.noPpint} - {p.itemCapex} (Qty: {p.satuanQty}, {formatRp(p.jumlahBiaya)})</option>
              ))}
            </select>
            <p className="text-[10px] text-slate-500">Pilih dari pengajuan untuk otomatisasi pengisian.</p>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-600">Kode Asset</label>
            <input type="text" required placeholder="Contoh: AST-24-001" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" value={formRealisasi.kodeAsset} onChange={e => setFormRealisasi({...formRealisasi, kodeAsset: e.target.value})} />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-600">Item Capex</label>
            <input 
              type="text" 
              list="item-capex-options"
              required 
              placeholder="Pilih dari list atau ketik manual..."
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
              value={formRealisasi.itemCapex} 
              onChange={e => setFormRealisasi({...formRealisasi, itemCapex: e.target.value})} 
            />
            <datalist id="item-capex-options">
              {filteredBudget.map(b => (
                <option key={b.id} value={b.itemCapex}>{b.groupAsset} - {b.kodeAsset}</option>
              ))}
            </datalist>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-600">Qty & Satuan</label>
            <input type="text" required placeholder="Contoh: 2 Unit" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" value={formRealisasi.qty} onChange={e => setFormRealisasi({...formRealisasi, qty: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-600">Rupiah</label>
            <input type="number" required min="0" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="Contoh: 15000000" value={formRealisasi.rupiah} onChange={e => setFormRealisasi({...formRealisasi, rupiah: e.target.value})} />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium text-slate-600">Keterangan / Catatan</label>
            <textarea className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" rows="2" value={formRealisasi.keterangan} onChange={e => setFormRealisasi({...formRealisasi, keterangan: e.target.value})}></textarea>
          </div>
          <div className="md:col-span-2 flex justify-end mt-2">
            <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-sm">Simpan Realisasi</button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-semibold text-slate-700">Histori Realisasi</h3>
          <span className="text-xs text-slate-500">Total Data: {filteredRealisasi.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-white text-slate-500 border-b">
              <tr>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">No PPINT</th>
                <th className="py-3 px-4">Kode Asset</th>
                <th className="py-3 px-4">Item Capex</th>
                <th className="py-3 px-4">Keterangan</th>
                <th className="py-3 px-4 text-center">Qty</th>
                <th className="py-3 px-4 text-right">Rupiah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRealisasi.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-6 text-slate-400">Belum ada data realisasi tercatat untuk perusahaan ini.</td></tr>
              ) : (
                filteredRealisasi.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 px-4">{row.tanggal}</td>
                    <td className="py-3 px-4 text-emerald-600 text-xs font-semibold">{row.noPpint || '-'}</td>
                    <td className="py-3 px-4 font-medium text-indigo-600">{row.kodeAsset}</td>
                    <td className="py-3 px-4">{row.itemCapex}</td>
                    <td className="py-3 px-4">{row.keterangan}</td>
                    <td className="py-3 px-4 text-center">{row.qty}</td>
                    <td className="py-3 px-4 text-right font-medium">{formatRp(row.rupiah)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderReport = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Laporan Kontrol CAPEX</h2>
          <p className="text-slate-500 text-sm mt-1">Perbandingan antara nilai Budget dan Realisasi aktual.</p>
        </div>
        <button className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-medium flex items-center shadow-sm">
          <FileBarChart className="mr-2" size={16} /> Export Laporan
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-indigo-50 text-indigo-900 border-b border-indigo-100">
              <tr>
                <th className="py-4 px-4 font-semibold">Kode Asset</th>
                <th className="py-4 px-4 font-semibold">Group Asset</th>
                <th className="py-4 px-4 font-semibold">Item_Capex</th>
                <th className="py-4 px-4 font-semibold text-center">Budget Qty</th>
                <th className="py-4 px-4 font-semibold text-center">Realisasi Qty</th>
                <th className="py-4 px-4 font-semibold text-right">Total Budget</th>
                <th className="py-4 px-4 font-semibold text-right">Total Realisasi</th>
                <th className="py-4 px-4 font-semibold text-right">Sisa Biaya (Variance)</th>
                <th className="py-4 px-4 font-semibold text-center">Tingkat Penyerapan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reportData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-indigo-600">{row.kodeAsset}</td>
                  <td className="py-3 px-4">{row.groupAsset}</td>
                  <td className="py-3 px-4">{row.itemCapex}</td>
                  <td className="py-3 px-4 text-center font-medium">{row.budgetQty} {row.satuan}</td>
                  <td className="py-3 px-4 text-center font-medium text-rose-600">{row.realisasiQty} {row.satuan}</td>
                  <td className="py-3 px-4 text-right">{formatRp(row.budget)}</td>
                  <td className="py-3 px-4 text-right text-rose-600">{formatRp(row.realisasi)}</td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-600">{formatRp(row.sisa)}</td>
                  <td className="py-3 px-4">
                     <div className="flex flex-col items-center justify-center">
                        <span className="text-xs font-bold mb-1">{row.persentase.toFixed(1)}%</span>
                        <div className="w-24 bg-slate-200 rounded-full h-2">
                          <div className={`h-2 rounded-full ${row.persentase > 90 ? 'bg-rose-500' : row.persentase > 60 ? 'bg-amber-400' : 'bg-emerald-500'}`} style={{ width: `${Math.min(row.persentase, 100)}%` }}></div>
                        </div>
                     </div>
                  </td>
                </tr>
              ))}
              {reportData.length === 0 && (
                <tr><td colSpan="9" className="text-center py-6 text-slate-400">Tidak ada data laporan untuk perusahaan ini.</td></tr>
              )}
              <tr className="bg-slate-50 font-bold text-slate-800 border-t-2 border-slate-200">
                 <td colSpan="5" className="py-4 px-4 text-right">GRAND TOTAL :</td>
                 <td className="py-4 px-4 text-right">{formatRp(totalBudget)}</td>
                 <td className="py-4 px-4 text-right text-rose-600">{formatRp(totalRealisasi)}</td>
                 <td className="py-4 px-4 text-right text-emerald-600">{formatRp(sisaBudget)}</td>
                 <td className="py-4 px-4 text-center">
                   {totalBudget > 0 ? ((totalRealisasi/totalBudget)*100).toFixed(1) : 0}%
                 </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderPpintList = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Daftar Pengajuan PPINT</h2>
          <p className="text-slate-500 text-sm mt-1">Daftar lembar pengajuan pembelian/investasi (PPINT) yang telah dibuat.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 border-b">
              <tr>
                <th className="py-3 px-4">No PPINT</th>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Kode Asset</th>
                <th className="py-3 px-4">Item Capex</th>
                <th className="py-3 px-4 text-center">Qty & Satuan</th>
                <th className="py-3 px-4 text-right">Jumlah Biaya Diajukan</th>
                <th className="py-3 px-4">Prioritas</th>
                <th className="py-3 px-4 text-center">Aksi Cetak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPpint.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-6 text-slate-400">Belum ada pengajuan PPINT untuk perusahaan ini.</td></tr>
              ) : (
                filteredPpint.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-semibold text-emerald-600">{p.noPpint}</td>
                    <td className="py-3 px-4">{p.tanggal}</td>
                    <td className="py-3 px-4 font-medium text-indigo-600">{p.kodeAsset}</td>
                    <td className="py-3 px-4">{p.itemCapex}</td>
                    <td className="py-3 px-4 text-center font-bold">{p.satuanQty}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-700">{formatRp(p.jumlahBiaya)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${p.prioritas === 'Tinggi' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                        {p.prioritas}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button 
                        onClick={() => setPrintPpintModal(p)}
                        className="px-3 py-1 bg-slate-800 text-white rounded hover:bg-slate-900 transition-colors flex items-center justify-center space-x-1 mx-auto text-xs"
                      >
                        <Printer size={14} />
                        <span>Cetak / Lihat</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* SIDEBAR (KIRI) */}
      <aside className="w-64 bg-[#1e293b] text-slate-300 flex flex-col h-full shadow-2xl z-20 transition-all">
        <div className="p-6 border-b border-slate-700/50 flex flex-col items-center">
          
          <div className="relative group mb-4 cursor-pointer" title="Ubah Logo (Akses Admin)">
            <img src={logoUrl} alt="Logo MOD" className="w-24 h-24 object-contain bg-white rounded-2xl p-2 shadow-lg" />
            <label className="absolute inset-0 bg-black/50 text-white rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera size={24} className="mb-1" />
              <span className="text-[10px] font-bold">Ubah Logo</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
            </label>
          </div>

          <div className="w-full">
            <label className="text-xs text-slate-400 mb-1 block font-medium">Filter Perusahaan</label>
            <select 
              value={selectedPerusahaan} 
              onChange={(e) => setSelectedPerusahaan(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="all">Semua Perusahaan</option>
              <option value="pt-a">PT. MAG</option>
              <option value="pt-b">PT. SIP</option>
            </select>
          </div>
        </div>
        
        <div className="p-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Menu Utama</h2>
          <nav className="space-y-2">
            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'hover:bg-slate-800 hover:text-white'}`}>
              <LayoutDashboard size={20} /> <span>Dashboard</span>
            </button>
            <button onClick={() => setActiveTab('budget')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'budget' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'hover:bg-slate-800 hover:text-white'}`}>
              <FileSpreadsheet size={20} /> <span>Data Budget</span>
            </button>
            <button onClick={() => setActiveTab('ppint')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'ppint' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'hover:bg-slate-800 hover:text-white'}`}>
              <FileText size={20} /> <span>Daftar PPINT</span>
            </button>
            <button onClick={() => setActiveTab('realisasi')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'realisasi' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'hover:bg-slate-800 hover:text-white'}`}>
              <PlusCircle size={20} /> <span>Input Realisasi</span>
            </button>
            <button onClick={() => setActiveTab('report')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'report' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'hover:bg-slate-800 hover:text-white'}`}>
              <FileBarChart size={20} /> <span>Laporan Kontrol</span>
            </button>
          </nav>
        </div>
        
        <div className="mt-auto p-6">
           <div className="text-center">
              <p className="text-xs text-slate-500">&copy; {new Date().getFullYear()} Mill Operasional Departemen.</p>
           </div>
        </div>
      </aside>

      {/* AREA KONTEN UTAMA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm z-10">
           <div className="flex items-center space-x-3">
              <div className="bg-indigo-600 text-white p-2 rounded-lg"><Wallet size={20} /></div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">MOD <span className="font-normal text-slate-500 text-base">| Mill Operasional Departemen</span></h1>
           </div>
           <div className="flex items-center space-x-3 text-sm font-medium text-slate-600">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center border border-indigo-200">Admin</div>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto h-full">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'budget' && renderBudget()}
            {activeTab === 'ppint' && renderPpintList()}
            {activeTab === 'realisasi' && renderRealisasi()}
            {activeTab === 'report' && renderReport()}
          </div>
        </main>
      </div>

      {/* Modal Edit Master Data Budget */}
      {editingBudget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[95vh]">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Edit Master Data & Cashflow CAPEX</h3>
              <button onClick={() => setEditingBudget(null)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="edit-budget-form" onSubmit={handleSaveBudget} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-600">Kode Asset</label>
                    <input type="text" className="w-full p-2 border border-slate-300 rounded-lg bg-slate-100" value={editingBudget.kodeAsset} readOnly />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-600">COA</label>
                    <input type="text" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" value={editingBudget.coa} onChange={e => setEditingBudget({...editingBudget, coa: e.target.value})} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-600">Group Asset</label>
                    <select className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" value={editingBudget.groupAsset} onChange={e => setEditingBudget({...editingBudget, groupAsset: e.target.value})} required>
                      <option value="Bangunan">Bangunan</option>
                      <option value="Mesin-Mesin">Mesin-Mesin</option>
                      <option value="Alat Berat">Alat Berat</option>
                      <option value="Kendaraan">Kendaraan</option>
                      <option value="Peralatan Dan Perlengkapan">Peralatan Dan Perlengkapan</option>
                      <option value="Sarana & Prasarana">Sarana & Prasarana</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-600">Item Capex</label>
                    <input type="text" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" value={editingBudget.itemCapex} onChange={e => setEditingBudget({...editingBudget, itemCapex: e.target.value})} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-600">Satuan</label>
                    <input type="text" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" value={editingBudget.satuan} onChange={e => setEditingBudget({...editingBudget, satuan: e.target.value})} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-600">Prioritas</label>
                    <select className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" value={editingBudget.prioritas} onChange={e => setEditingBudget({...editingBudget, prioritas: e.target.value})} required>
                      <option value="Tinggi">Tinggi</option>
                      <option value="Sedang">Sedang</option>
                      <option value="Rendah">Rendah</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <h4 className="text-md font-semibold text-slate-800 mb-3 flex items-center justify-between">
                    <span>Pengaturan Cashflow Bulanan (Qty & Biaya)</span>
                    <span className="text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-sm">
                      Total Qty: {editingBudget.monthly.reduce((sum, m) => sum + m.qty, 0)} | Total: {formatRp(editingBudget.monthly.reduce((sum, m) => sum + m.rupiah, 0))}
                    </span>
                  </h4>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {MONTHS.map((m, idx) => (
                      <div key={idx} className="p-3 border border-slate-200 rounded-lg bg-slate-50">
                        <label className="block text-xs font-bold text-slate-700 mb-2">{m}</label>
                        <div className="space-y-2">
                          <div className="flex items-center text-xs">
                            <span className="w-12 text-slate-500">Qty</span>
                            <input type="number" min="0" className="w-full p-1 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500" value={editingBudget.monthly[idx].qty} onChange={(e) => handleEditMonthly(idx, 'qty', e.target.value)} />
                          </div>
                          <div className="flex items-center text-xs">
                            <span className="w-12 text-slate-500">Rp</span>
                            <input type="number" min="0" className="w-full p-1 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500" value={editingBudget.monthly[idx].rupiah} onChange={(e) => handleEditMonthly(idx, 'rupiah', e.target.value)} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end space-x-3 bg-white">
              <button type="button" onClick={() => setEditingBudget(null)} className="px-5 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 font-medium">Batal</button>
              <button type="submit" form="edit-budget-form" className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center shadow-sm">
                <Save size={18} className="mr-2" /> Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pengajuan PPINT */}
      {ppintModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-emerald-50">
              <h3 className="text-lg font-bold text-emerald-800 flex items-center"><FilePlus className="mr-2" size={20}/> Form Pengajuan PPINT</h3>
              <button onClick={() => setPpintModal({ isOpen: false, data: null })} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmitPpint} className="p-6 overflow-y-auto">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-600">No PPINT</label>
                    <input type="text" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" value={formPpint.noPpint} onChange={e => setFormPpint({...formPpint, noPpint: e.target.value})} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-600">Tanggal Pengajuan</label>
                    <input type="date" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" value={formPpint.tanggal} onChange={e => setFormPpint({...formPpint, tanggal: e.target.value})} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-600">Kode Asset</label>
                    <input type="text" className="w-full p-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-500" value={ppintModal.data.kodeAsset} readOnly />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-600">Item Capex (Edit Manual)</label>
                    <input type="text" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" value={formPpint.itemCapexManual} onChange={e => setFormPpint({...formPpint, itemCapexManual: e.target.value})} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-600">Qty & Satuan</label>
                    <input type="text" required className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-700" value={formPpint.qtyPengajuan} onChange={e => setFormPpint({...formPpint, qtyPengajuan: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-600">Prioritas</label>
                    <input type="text" className="w-full p-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-500" value={ppintModal.data.prioritas} readOnly />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-600">Jumlah Biaya yang Ingin Diajukan (Rp)</label>
                  <input type="number" min="0" required className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-700" value={formPpint.jumlahBiaya} onChange={e => setFormPpint({...formPpint, jumlahBiaya: e.target.value})} />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-600">Keterangan / Keperluan</label>
                  <textarea rows="2" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" placeholder="Tuliskan keterangan / tujuan pengadaan..." value={formPpint.keterangan} onChange={e => setFormPpint({...formPpint, keterangan: e.target.value})}></textarea>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs font-bold text-amber-800 mb-1 flex items-center"><FileText size={14} className="mr-1"/> Jadwal Rencana Budget (Cashflow):</p>
                  <p className="text-sm text-amber-900">{ppintModal.data.rencanaBulan}</p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button type="button" onClick={() => setPpintModal({ isOpen: false, data: null })} className="px-5 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 font-medium">Batal</button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium shadow-sm">
                  Simpan & Ajukan PPINT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cetak PPINT */}
      {printPpintModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center"><Printer className="mr-2" size={20}/> Lembar Cetak PPINT</h3>
              <button onClick={() => setPrintPpintModal(null)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            
            <div className="p-8 space-y-6 bg-white text-slate-800">
              <div className="border-b pb-4 flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-lg text-indigo-900">MILL OPERASIONAL DEPARTEMEN</h4>
                  <p className="text-xs text-slate-500">PERMINTAAN PEMBELIAN / INVESTASI (PPINT)</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-600 text-lg">{printPpintModal.noPpint}</p>
                  <p className="text-xs text-slate-500">Tanggal: {printPpintModal.tanggal}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl border">
                <div>
                  <p className="text-xs text-slate-500">Kode Asset</p>
                  <p className="font-semibold">{printPpintModal.kodeAsset}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Item Capex</p>
                  <p className="font-semibold">{printPpintModal.itemCapex}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Jumlah Biaya Diajukan</p>
                  <p className="font-bold text-emerald-700 text-base">{formatRp(printPpintModal.jumlahBiaya)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Qty & Satuan</p>
                  <p className="font-semibold text-indigo-600 text-base">{printPpintModal.satuanQty}</p>
                </div>
              </div>

              <div className="space-y-1 text-sm">
                <p className="text-xs text-slate-500 font-bold">Keterangan / Tujuan Pengadaan:</p>
                <div className="p-3 bg-slate-50 border rounded-lg text-slate-700 min-h-[50px]">
                  {printPpintModal.keterangan || 'Tidak ada keterangan tambahan.'}
                </div>
              </div>

              <div className="space-y-1 text-sm">
                <p className="text-xs text-slate-500 font-bold flex items-center"><FileText size={14} className="mr-1"/> Rencana Budget (Cashflow Bulanan):</p>
                <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-amber-900">
                  {printPpintModal.rencanaBulan}
                </div>
              </div>

              <div className="pt-6 grid grid-cols-3 gap-4 text-center text-xs text-slate-600">
                <div className="space-y-12">
                  <p className="font-semibold">Diajukan Oleh,</p>
                  <p className="border-b border-dashed border-slate-400 w-3/4 mx-auto"></p>
                  <p>Departemen Terkait</p>
                </div>
                <div className="space-y-12">
                  <p className="font-semibold">Diperiksa Oleh,</p>
                  <p className="border-b border-dashed border-slate-400 w-3/4 mx-auto"></p>
                  <p>Finance / Accounting</p>
                </div>
                <div className="space-y-12">
                  <p className="font-semibold">Disetujui Oleh,</p>
                  <p className="border-b border-dashed border-slate-400 w-3/4 mx-auto"></p>
                  <p>Direksi / Management</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex justify-end space-x-3 bg-slate-50">
              <button type="button" onClick={() => setPrintPpintModal(null)} className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-100 font-medium text-sm">Tutup</button>
              <button type="button" onClick={() => window.print()} className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center shadow-sm text-sm">
                <Printer size={16} className="mr-2" /> Cetak Dokumen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}