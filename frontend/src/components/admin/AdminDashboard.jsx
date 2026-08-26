import React, { useState, useEffect } from 'react';
import { useWeddingData, generateShareableUrl } from '../../context/WeddingContext';
import { fetchRSVPs, saveAllRSVPs } from '../../api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { Heart, MessageSquare, Calendar, MapPin, Gift, Mail, Image as ImageIcon, Settings, Type, Users, Download, FileText, Plus, Trash2, Search, CheckCircle2, XCircle, RefreshCw, Share2, Server, CheckCircle, AlertCircle, Music } from 'lucide-react';

export default function AdminDashboard() {
  const { weddingData, decor, settings, updateWeddingData, updateDecor, updateSettings, saveAll, resetToDefaults } = useWeddingData();
  const [savePassword, setSavePassword] = useState('');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveError, setSaveError] = useState('');

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      setSaveError('');
      await saveAll(savePassword);
      setSaveDialogOpen(false);
      setSavePassword('');
      alert('تم حفظ التغييرات بنجاح! / Changes saved successfully!');
    } catch (err) {
      setSaveError(err.message || 'فشل حفظ التغييرات. يرجى التأكد من كلمة المرور / Failed to save changes.');
    }
  };

  const handleAddEvent = () => {
    const newSchedule = [...(weddingData?.schedule || []), { time: '12:00 PM', title: 'New Event' }];
    updateWeddingData('schedule', newSchedule);
  };

  const handleUpdateEvent = (index, field, value) => {
    const newSchedule = [...(weddingData?.schedule || [])];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    updateWeddingData('schedule', newSchedule);
  };

  const handleRemoveEvent = (index) => {
    const newSchedule = (weddingData?.schedule || []).filter((_, i) => i !== index);
    updateWeddingData('schedule', newSchedule);
  };

  const [guestList, setGuestList] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('sg_rsvps') || '[]');
      if (stored && stored.length > 0) return stored;
    } catch (_) {}
    return [];
  });
  const [guestSearch, setGuestSearch] = useState('');
  const [guestFilter, setGuestFilter] = useState('all');
  const [addGuestOpen, setAddGuestOpen] = useState(false);
  const [newGuest, setNewGuest] = useState({
    name: '',
    attending: 'yes',
    guests: '1',
    song: '',
    children: ''
  });

  const [customApiUrl, setCustomApiUrl] = useState(() => {
    return localStorage.getItem('wedding_custom_api') || 'https://wedding-syrine-backend.onrender.com/api';
  });
  const [apiTestStatus, setApiTestStatus] = useState(null); // 'testing', 'success', 'error'
  const [apiTestMessage, setApiTestMessage] = useState('');

  const handleTestAndSaveApi = async () => {
    setApiTestStatus('testing');
    setApiTestMessage('جاري فحص الاتصال بالسيرفر السحابي...');
    try {
      const cleanUrl = customApiUrl.trim().replace(/\/+$/, '');
      const res = await fetch(`${cleanUrl}/content`);
      if (res.ok) {
        localStorage.setItem('wedding_custom_api', cleanUrl);
        setApiTestStatus('success');
        setApiTestMessage('🟢 متصل بنجاح بالسيرفر السحابي! تم حفظ الرابط وسيقوم الموقع بالمزامنة التلقائية.');
      } else {
        localStorage.setItem('wedding_custom_api', cleanUrl);
        setApiTestStatus('success');
        setApiTestMessage('🟢 تم حفظ الرابط بنجاح!');
      }
    } catch (e) {
      localStorage.setItem('wedding_custom_api', customApiUrl.trim().replace(/\/+$/, ''));
      setApiTestStatus('error');
      setApiTestMessage('⚠️ تعذر الاتصال حالياً بالسيرفر. إذا كان السيرفر قيد التشغيل على Render، يرجى الانتظار دقيقة حتى يستيقظ.');
    }
  };

  const [refreshingGuests, setRefreshingGuests] = useState(false);

  // Load guest list from cloud on mount
  useEffect(() => {
    let isMounted = true;
    fetchRSVPs().then((list) => {
      if (isMounted && Array.isArray(list)) {
        setGuestList(list);
      }
    });
    return () => { isMounted = false; };
  }, []);

  const refreshGuestList = async () => {
    setRefreshingGuests(true);
    try {
      const list = await fetchRSVPs();
      setGuestList(list);
      alert('تم تحديث قائمة الضيوف من السحابة بنجاح! / Guest list updated from cloud!');
    } catch (_) {
      try {
        const list = JSON.parse(localStorage.getItem('sg_rsvps') || '[]');
        setGuestList(list);
      } catch (e) {}
    } finally {
      setRefreshingGuests(false);
    }
  };

  const handleAddManualGuest = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!newGuest.name.trim()) {
      alert('يرجى كتابة اسم الضيف');
      return;
    }
    const entry = {
      ...newGuest,
      id: 'manual_' + Date.now(),
      at: new Date().toISOString()
    };
    const updated = [entry, ...guestList];
    setGuestList(updated);
    await saveAllRSVPs(updated);
    setNewGuest({ name: '', attending: 'yes', guests: '1', song: '', children: '' });
    setAddGuestOpen(false);
    alert('تمت إضافة الضيف إلى القائمة بنجاح!');
  };

  const handleDeleteGuest = async (index) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الضيف من القائمة؟')) {
      const updated = guestList.filter((_, i) => i !== index);
      setGuestList(updated);
      await saveAllRSVPs(updated);
    }
  };

  const handleClearAllGuests = async () => {
    if (window.confirm('هل أنت متأكد من حذف جميع الضيوف من القائمة؟')) {
      setGuestList([]);
      await saveAllRSVPs([]);
    }
  };

  // Export Excel / CSV with UTF-8 BOM
  const handleExportExcel = () => {
    if (!guestList.length) {
      alert('لا توجد بيانات ضيوف في القائمة حالياً لتصديرها.');
      return;
    }
    const headers = ['الاسم', 'حالة الحضور', 'عدد الأفراد', 'إهداء أو دعاء', 'ملاحظات', 'تاريخ التسجيل'];
    const rows = guestList.map(g => [
      `"${(g.name || '').replace(/"/g, '""')}"`,
      `"${g.attending === 'yes' ? 'يشرفني الحضور' : 'اعتذار'}"`,
      `"${g.attending === 'yes' ? (g.guests || '1') : '0'}"`,
      `"${(g.song || '').replace(/"/g, '""')}"`,
      `"${(g.children || '').replace(/"/g, '""')}"`,
      `"${g.at ? new Date(g.at).toLocaleDateString('ar-TN') : ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `قائمة_ضيوف_زفاف_${weddingData?.couple?.groom || 'سيرين'}_${weddingData?.couple?.bride || 'وائل'}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export PDF
  const handleExportPDF = () => {
    if (!guestList.length) {
      alert('لا توجد بيانات ضيوف في القائمة حالياً لتصديرها.');
      return;
    }
    const totalAttending = guestList.filter(g => g.attending === 'yes').length;
    const totalDeclined = guestList.filter(g => g.attending === 'no').length;
    const totalSeats = guestList.reduce((acc, g) => acc + (g.attending === 'yes' ? parseInt(g.guests || 1, 10) : 0), 0);

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('يرجى السماح بالنوافذ المنبثقة لطباعة / تنزيل PDF.');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>قائمة ضيوف الزفاف - ${weddingData?.couple?.groom || 'سيرين'} & ${weddingData?.couple?.bride || 'وائل'}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; background: #fff; color: #333; margin: 0; padding: 20px; direction: rtl; }
          .header { text-align: center; border-bottom: 2px solid #a9802f; padding-bottom: 15px; margin-bottom: 20px; }
          .title { font-size: 26px; color: #a9802f; font-weight: bold; margin-bottom: 5px; }
          .subtitle { font-size: 14px; color: #666; }
          .kpis { display: flex; justify-content: space-around; background: #fdfbf7; border: 1px solid #e0d0b0; border-radius: 8px; padding: 12px; margin-bottom: 20px; }
          .kpi-box { text-align: center; }
          .kpi-value { font-size: 22px; font-weight: bold; color: #5a0f1b; }
          .kpi-label { font-size: 12px; color: #777; margin-top: 2px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
          th { background: #f5eedf; color: #6e521e; border: 1px solid #ddd; padding: 8px 10px; text-align: right; }
          td { border: 1px solid #ddd; padding: 8px 10px; }
          tr:nth-child(even) { background: #fafafa; }
          .badge-yes { background: #e8f5e9; color: #2e7d32; padding: 3px 8px; border-radius: 12px; font-weight: bold; }
          .badge-no { background: #ffebee; color: #c62828; padding: 3px 8px; border-radius: 12px; font-weight: bold; }
          .footer { margin-top: 25px; text-align: center; font-size: 11px; color: #999; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">قائمة ضيوف حفل الزفاف المبارك</div>
          <div class="subtitle">${weddingData?.couple?.groom || 'سيرين'} & ${weddingData?.couple?.bride || 'وائل'} · موعدنا: ${weddingData?.couple?.weddingDate || ''}</div>
        </div>
        <div class="kpis">
          <div class="kpi-box"><div class="kpi-value">${guestList.length}</div><div class="kpi-label">إجمالي الردود</div></div>
          <div class="kpi-box"><div class="kpi-value">${totalAttending}</div><div class="kpi-label">تأكيد الحضور</div></div>
          <div class="kpi-box"><div class="kpi-value">${totalSeats}</div><div class="kpi-label">إجمالي عدد الأفراد</div></div>
          <div class="kpi-box"><div class="kpi-value">${totalDeclined}</div><div class="kpi-label">اعتذار عن الحضور</div></div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 5%;">#</th>
              <th style="width: 25%;">الاسم الكريم</th>
              <th style="width: 15%;">الحالة</th>
              <th style="width: 10%;">عدد الأفراد</th>
              <th style="width: 25%;">إهداء / دعاء</th>
              <th style="width: 20%;">ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            ${guestList.map((g, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td><strong>${g.name || 'ضيف'}</strong></td>
                <td><span class="${g.attending === 'yes' ? 'badge-yes' : 'badge-no'}">${g.attending === 'yes' ? 'يشرفني الحضور' : 'اعتذار'}</span></td>
                <td>${g.attending === 'yes' ? (g.guests || 1) : 0}</td>
                <td>${g.song || '-'}</td>
                <td>${g.children || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">تم استخراج التقرير في ${new Date().toLocaleDateString('ar-TN')}</div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ weddingData, decor, settings }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `wedding_content_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-[#f8f1e5] p-4 md:p-8 font-body text-[#3d2e1e]">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#f0e5d3] p-6 rounded-[20px] shadow-[0_12px_35px_rgba(0,0,0,0.06)] border border-[#a9802f]/30 gap-4">
          <div>
            <h1 className="text-3xl font-display italic text-[#a9802f]">Wedding Invitation Dashboard</h1>
            <p className="text-[#6c513f] font-elegant text-xs tracking-[0.2em] uppercase mt-1">Manage & Customize Content</p>
          </div>
          
          <div className="flex gap-3 items-center flex-wrap">
            <Button
              type="button"
              onClick={() => {
                const url = generateShareableUrl({ weddingData, decor, settings });
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(url);
                  alert('تم نسخ رابط الدعوة الخاص بك بنجاح! يمكنك الآن إرساله لأي صديق وسيفتح معه بكافة التعديلات التي أجريتها فوراً.\nInvitation link copied to clipboard!');
                } else {
                  prompt('انسخ رابط الدعوة التالي:', url);
                }
              }}
              className="bg-[#a9802f] hover:bg-[#8a6a22] text-white text-xs py-2 px-4 rounded-[20px] flex items-center gap-1.5 shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5" /> نسخ رابط الدعوة للأصدقاء
            </Button>

            <Button 
              variant="outline" 
              onClick={() => {
                if (window.confirm('هل أنت متأكد من استعادة الإعدادات الافتراضية؟ / Are you sure you want to reset to defaults?')) {
                  resetToDefaults();
                  alert('تمت استعادة الإعدادات الافتراضية بنجاح!');
                }
              }}
              className="border-[#a9802f]/40 text-[#a9802f] hover:bg-[#a9802f]/10 rounded-[20px] text-xs py-2 px-4"
            >
              Reset to Defaults
            </Button>
            
            <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
              <DialogTrigger asChild>
                <button className="btn-2 !py-2 !px-6 !text-xs">
                  Save Changes
                </button>
              </DialogTrigger>
              <DialogContent className="bg-[#f0e5d3] border border-[#a9802f]/40 text-[#3d2e1e] rounded-[20px]">
                <DialogHeader>
                  <DialogTitle className="text-[#a9802f] font-display text-2xl">Confirm Save</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSave} className="space-y-4 py-4 text-left">
                  <div className="space-y-2">
                    <Label className="text-[#a9802f] font-elegant text-xs uppercase tracking-wider">Admin Password</Label>
                    <Input 
                      type="password" 
                      value={savePassword} 
                      onChange={(e) => setSavePassword(e.target.value)}
                      placeholder="Enter admin password"
                      className="bg-[#faf5ec] border-[#a9802f]/30 text-[#3d2e1e] focus:border-[#a9802f] focus:ring-[#a9802f] rounded-[5px]"
                      autoFocus
                    />
                  </div>
                  {saveError && (
                    <p className="text-red-600 text-sm bg-red-100 p-2.5 rounded border border-red-300">
                      {saveError}
                    </p>
                  )}
                  <DialogFooter className="gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => { setSaveDialogOpen(false); setSaveError(''); }} className="border-[#a9802f]/40 text-[#a9802f] rounded-[20px]">
                      Cancel
                    </Button>
                    <button type="submit" className="btn-2 !py-2 !px-6 !text-xs">
                      Confirm Save
                    </button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="couple" className="flex flex-col md:flex-row gap-6">
          
          {/* Sidebar */}
          <TabsList className="flex flex-col justify-start h-auto bg-[#f0e5d3] p-3 space-y-1.5 rounded-[15px] w-full md:w-60 border border-[#a9802f]/30">
            <TabsTrigger value="couple" className="w-full justify-start gap-3 py-2.5 rounded-[5px] text-[#3d2e1e] data-[state=active]:bg-[rgb(90,15,27)] data-[state=active]:text-[#f7ecd0] data-[state=active]:border data-[state=active]:border-[#a9802f]/40">
              <Heart className="w-4 h-4 text-[#a9802f]" /> Couple
            </TabsTrigger>
            <TabsTrigger value="intro" className="w-full justify-start gap-3 py-2.5 rounded-[5px] text-[#3d2e1e] data-[state=active]:bg-[rgb(90,15,27)] data-[state=active]:text-[#f7ecd0] data-[state=active]:border data-[state=active]:border-[#a9802f]/40">
              <MessageSquare className="w-4 h-4 text-[#a9802f]" /> Introduction
            </TabsTrigger>
            <TabsTrigger value="schedule" className="w-full justify-start gap-3 py-2.5 rounded-[5px] text-[#3d2e1e] data-[state=active]:bg-[rgb(90,15,27)] data-[state=active]:text-[#f7ecd0] data-[state=active]:border data-[state=active]:border-[#a9802f]/40">
              <Calendar className="w-4 h-4 text-[#a9802f]" /> Schedule
            </TabsTrigger>
            <TabsTrigger value="venue" className="w-full justify-start gap-3 py-2.5 rounded-[5px] text-[#3d2e1e] data-[state=active]:bg-[rgb(90,15,27)] data-[state=active]:text-[#f7ecd0] data-[state=active]:border data-[state=active]:border-[#a9802f]/40">
              <MapPin className="w-4 h-4 text-[#a9802f]" /> Venue
            </TabsTrigger>
            <TabsTrigger value="gift" className="w-full justify-start gap-3 py-2.5 rounded-[5px] text-[#3d2e1e] data-[state=active]:bg-[rgb(90,15,27)] data-[state=active]:text-[#f7ecd0] data-[state=active]:border data-[state=active]:border-[#a9802f]/40">
              <Gift className="w-4 h-4 text-[#a9802f]" /> Gift & Dress
            </TabsTrigger>
            <TabsTrigger value="rsvp" className="w-full justify-start gap-3 py-2.5 rounded-[5px] text-[#3d2e1e] data-[state=active]:bg-[rgb(90,15,27)] data-[state=active]:text-[#f7ecd0] data-[state=active]:border data-[state=active]:border-[#a9802f]/40">
              <Mail className="w-4 h-4 text-[#a9802f]" /> RSVP
            </TabsTrigger>
            <TabsTrigger value="closing" className="w-full justify-start gap-3 py-2.5 rounded-[5px] text-[#3d2e1e] data-[state=active]:bg-[rgb(90,15,27)] data-[state=active]:text-[#f7ecd0] data-[state=active]:border data-[state=active]:border-[#a9802f]/40">
              <Type className="w-4 h-4 text-[#a9802f]" /> Closing
            </TabsTrigger>
            <TabsTrigger value="images" className="w-full justify-start gap-3 py-2.5 rounded-[5px] text-[#3d2e1e] data-[state=active]:bg-[rgb(90,15,27)] data-[state=active]:text-[#f7ecd0] data-[state=active]:border data-[state=active]:border-[#a9802f]/40">
              <ImageIcon className="w-4 h-4 text-[#a9802f]" /> Images
            </TabsTrigger>
            <TabsTrigger value="guests" className="w-full justify-start gap-3 py-2.5 rounded-[5px] text-[#3d2e1e] data-[state=active]:bg-[rgb(90,15,27)] data-[state=active]:text-[#f7ecd0] data-[state=active]:border data-[state=active]:border-[#a9802f]/40">
              <Users className="w-4 h-4 text-[#a9802f]" /> Guests & RSVPs
            </TabsTrigger>
            <TabsTrigger value="settings" className="w-full justify-start gap-3 py-2.5 rounded-[5px] text-[#3d2e1e] data-[state=active]:bg-[rgb(90,15,27)] data-[state=active]:text-[#f7ecd0] data-[state=active]:border data-[state=active]:border-[#a9802f]/40">
              <Settings className="w-4 h-4 text-[#a9802f]" /> Settings
            </TabsTrigger>
          </TabsList>

          {/* Editors */}
          <div className="flex-1">
            <TabsContent value="couple" className="m-0 focus-visible:outline-none">
              <Card className="bg-[#f0e5d3] border-[#a9802f]/30 rounded-[15px] text-[#3d2e1e]">
                <CardHeader>
                  <CardTitle className="text-2xl font-display italic text-[#a9802f]">Couple Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[#a9802f]">Groom's Name</Label>
                      <Input dir="auto" value={weddingData?.couple?.groom || ''} onChange={(e) => updateWeddingData('couple', { ...weddingData?.couple, groom: e.target.value })} className="bg-[#faf5ec] border-[#a9802f]/30 text-[#3d2e1e] rounded-[5px]" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#a9802f]">Bride's Name</Label>
                      <Input dir="auto" value={weddingData?.couple?.bride || ''} onChange={(e) => updateWeddingData('couple', { ...weddingData?.couple, bride: e.target.value })} className="bg-[#faf5ec] border-[#a9802f]/30 text-[#3d2e1e] rounded-[5px]" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#a9802f]">Select Wedding Date (Calendar)</Label>
                      <Input
                        type="date"
                        value={
                          weddingData?.couple?.weddingDateISO
                            ? weddingData.couple.weddingDateISO.split('T')[0]
                            : ''
                        }
                        onChange={(e) => {
                          const selected = e.target.value;
                          if (selected) {
                            const parts = selected.split('-');
                            const autoDisplay = `${parts[2]}.${parts[1]}.${parts[0].slice(-2)}`;
                            updateWeddingData('couple', {
                              ...weddingData?.couple,
                              weddingDateISO: `${selected}T17:00:00`,
                              weddingDate: autoDisplay
                            });
                          }
                        }}
                        className="bg-[#faf5ec] border-[#a9802f]/30 text-[#3d2e1e] rounded-[5px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#a9802f]">Wedding Date Text (Display on Invitation)</Label>
                      <Input
                        dir="auto"
                        value={weddingData?.couple?.weddingDate || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          const dmy = val.match(/^(\d{1,2})[./\-](\d{1,2})[./\-](\d{2,4})/);
                          let iso = weddingData?.couple?.weddingDateISO;
                          if (dmy) {
                            let day = String(dmy[1]).padStart(2, '0');
                            let month = String(dmy[2]).padStart(2, '0');
                            let year = parseInt(dmy[3], 10);
                            if (year < 100) year += 2000;
                            iso = `${year}-${month}-${day}T17:00:00`;
                          }
                          updateWeddingData('couple', {
                            ...weddingData?.couple,
                            weddingDate: val,
                            ...(iso ? { weddingDateISO: iso } : {})
                          });
                        }}
                        placeholder="27.09.26"
                        className="bg-[#faf5ec] border-[#a9802f]/30 text-[#3d2e1e] rounded-[5px]"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="intro" className="m-0 focus-visible:outline-none">
              <Card className="bg-[#f0e5d3] border-[#a9802f]/30 rounded-[15px] text-[#3d2e1e]">
                <CardHeader>
                  <CardTitle className="text-2xl font-display italic text-[#a9802f]">Introduction</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[#a9802f]">Line One</Label>
                      <Input dir="auto" value={weddingData?.intro?.lineOne || ''} onChange={(e) => updateWeddingData('intro', { ...weddingData?.intro, lineOne: e.target.value })} className="bg-[#faf5ec] border-[#a9802f]/30 text-[#3d2e1e] rounded-[5px]" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#a9802f]">Line Two</Label>
                      <Input dir="auto" value={weddingData?.intro?.lineTwo || ''} onChange={(e) => updateWeddingData('intro', { ...weddingData?.intro, lineTwo: e.target.value })} className="bg-[#faf5ec] border-[#a9802f]/30 text-[#3d2e1e] rounded-[5px]" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#a9802f]">Line Three</Label>
                      <Input dir="auto" value={weddingData?.intro?.lineThree || ''} onChange={(e) => updateWeddingData('intro', { ...weddingData?.intro, lineThree: e.target.value })} className="bg-[#faf5ec] border-[#a9802f]/30 text-[#3d2e1e] rounded-[5px]" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#a9802f]">Salutation</Label>
                    <Input dir="auto" value={weddingData?.intro?.salutation || ''} onChange={(e) => updateWeddingData('intro', { ...weddingData?.intro, salutation: e.target.value })} className="bg-[#faf5ec] border-[#a9802f]/30 text-[#3d2e1e] rounded-[5px]" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#a9802f]">Body</Label>
                    <Textarea dir="auto" rows={4} value={weddingData?.intro?.body || ''} onChange={(e) => updateWeddingData('intro', { ...weddingData?.intro, body: e.target.value })} className="bg-[#faf5ec] border-[#a9802f]/30 text-[#3d2e1e] rounded-[5px]" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedule" className="m-0 focus-visible:outline-none">
              <Card className="bg-[#f0e5d3] border-[#a9802f]/30 rounded-[15px] text-[#3d2e1e]">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-2xl font-display italic text-[#a9802f]">Schedule</CardTitle>
                  <Button onClick={handleAddEvent} size="sm" className="bg-[rgb(90,15,27)] hover:bg-[rgb(118,20,36)] text-white border border-[#a9802f]/40 rounded-[20px]">
                    Add Event
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(weddingData?.schedule || []).map((event, idx) => (
                    <div key={idx} className="flex gap-4 items-end bg-[#faf5ec] p-4 rounded-[10px] border border-[#a9802f]/20">
                      <div className="space-y-2 flex-1">
                        <Label className="text-[#a9802f]">Time</Label>
                        <Input dir="auto" value={event.time || ''} onChange={(e) => handleUpdateEvent(idx, 'time', e.target.value)} className="bg-[#faf5ec] border-[#a9802f]/30 text-[#3d2e1e] rounded-[5px]" />
                      </div>
                      <div className="space-y-2 flex-1">
                        <Label className="text-[#a9802f]">Title</Label>
                        <Input dir="auto" value={event.title || ''} onChange={(e) => handleUpdateEvent(idx, 'title', e.target.value)} className="bg-[#faf5ec] border-[#a9802f]/30 text-[#3d2e1e] rounded-[5px]" />
                      </div>
                      <Button variant="destructive" onClick={() => handleRemoveEvent(idx)} className="mb-0 rounded-[5px]">Remove</Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="venue" className="m-0 focus-visible:outline-none">
              <Card className="bg-[#f0e5d3] border-[#a9802f]/30 rounded-[15px] text-[#3d2e1e]">
                <CardHeader>
                  <CardTitle className="text-2xl font-display italic text-[#a9802f]">Venue</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-b border-[#a9802f]/20 pb-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-display text-[#a9802f]">الموقع الأول (الرئيسي) / Primary Location</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[#a9802f]">Location Title / عنوان الموقع (اختياري)</Label>
                        <Input 
                          dir="auto" 
                          value={weddingData?.venue?.title || ''} 
                          onChange={(e) => updateWeddingData('venue', { ...weddingData?.venue, title: e.target.value })} 
                          placeholder="e.g. حفل عقد القران / Ceremony"
                          className="bg-[#faf5ec] border-[#a9802f]/30 text-[#3d2e1e] rounded-[5px]" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[#a9802f]">Venue Name / اسم القاعة أو المكان</Label>
                        <Input 
                          dir="auto" 
                          value={weddingData?.venue?.name || ''} 
                          onChange={(e) => {
                            const newName = e.target.value;
                            const addr = weddingData?.venue?.address || '';
                            const q = encodeURIComponent([newName, addr].filter(Boolean).join(', '));
                            updateWeddingData('venue', { 
                              ...weddingData?.venue, 
                              name: newName,
                              mapUrl: `https://www.google.com/maps/search/?api=1&query=${q}`,
                              embedUrl: `https://www.google.com/maps?q=${q}&output=embed`
                            });
                          }} 
                          placeholder="e.g. قاعة رويال بالاس"
                          className="bg-[#faf5ec] border-[#a9802f]/30 text-[#3d2e1e] rounded-[5px]" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#a9802f]">Address / العنوان بالتفصيل</Label>
                      <Input 
                        dir="auto" 
                        value={weddingData?.venue?.address || ''} 
                        onChange={(e) => {
                          const newAddr = e.target.value;
                          const vName = weddingData?.venue?.name || '';
                          const q = encodeURIComponent([vName, newAddr].filter(Boolean).join(', '));
                          updateWeddingData('venue', { 
                            ...weddingData?.venue, 
                            address: newAddr,
                            mapUrl: `https://www.google.com/maps/search/?api=1&query=${q}`,
                            embedUrl: `https://www.google.com/maps?q=${q}&output=embed`
                          });
                        }} 
                        placeholder="e.g. شارع الأمير، تونس"
                        className="bg-[#faf5ec] border-[#a9802f]/30 text-[#3d2e1e] rounded-[5px]" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#a9802f]">Google Maps Link (Optional Custom Link)</Label>
                      <Input 
                        dir="ltr" 
                        value={weddingData?.venue?.mapUrl || ''} 
                        onChange={(e) => updateWeddingData('venue', { ...weddingData?.venue, mapUrl: e.target.value })} 
                        placeholder="https://maps.google.com/..."
                        className="bg-[#faf5ec] border-[#a9802f]/30 text-[#3d2e1e] rounded-[5px]" 
                      />
                    </div>
                  </div>

                  {/* Second Location Section */}
                  <div className="pt-2 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-display text-[#a9802f]">الموقع الثاني (اختياري) / Second Location</h3>
                        <p className="text-xs text-[#6c513f]">أضف موقعاً ثانياً في حال كان عقد القران أو العشاء في مكان منفصل</p>
                      </div>
                      <Button
                        type="button"
                        onClick={() => {
                          const currentEnabled = Boolean(weddingData?.secondVenue?.enabled);
                          updateWeddingData('secondVenue', {
                            ...weddingData?.secondVenue,
                            enabled: !currentEnabled,
                            title: weddingData?.secondVenue?.title || 'حفل الاستقبال والزفاف'
                          });
                        }}
                        className={weddingData?.secondVenue?.enabled 
                          ? "bg-red-800/80 hover:bg-red-900 text-white text-xs py-1.5 px-3 rounded-[20px]" 
                          : "bg-[#a9802f] hover:bg-[#8a6a22] text-white text-xs py-1.5 px-3 rounded-[20px]"}
                      >
                        {weddingData?.secondVenue?.enabled ? 'إلغاء الموقع الثاني / Disable' : '+ إضافة موقع ثانٍ / Add Second Location'}
                      </Button>
                    </div>

                    {weddingData?.secondVenue?.enabled && (
                      <div className="bg-[#faf5ec] p-4 rounded-[12px] border border-[#a9802f]/30 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[#a9802f]">Second Location Title / عنوان الموقع الثاني</Label>
                            <Input 
                              dir="auto" 
                              value={weddingData?.secondVenue?.title || ''} 
                              onChange={(e) => updateWeddingData('secondVenue', { ...weddingData?.secondVenue, title: e.target.value })} 
                              placeholder="e.g. حفل الاستقبال / Reception"
                              className="bg-[#fffdf9] border-[#a9802f]/30 text-[#3d2e1e] rounded-[5px]" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[#a9802f]">Second Venue Name / اسم القاعة أو المكان الثاني</Label>
                            <Input 
                              dir="auto" 
                              value={weddingData?.secondVenue?.name || ''} 
                              onChange={(e) => {
                                const newName = e.target.value;
                                const addr = weddingData?.secondVenue?.address || '';
                                const q = encodeURIComponent([newName, addr].filter(Boolean).join(', '));
                                updateWeddingData('secondVenue', { 
                                  ...weddingData?.secondVenue, 
                                  name: newName,
                                  mapUrl: `https://www.google.com/maps/search/?api=1&query=${q}`,
                                  embedUrl: `https://www.google.com/maps?q=${q}&output=embed`
                                });
                              }} 
                              placeholder="e.g. نزل المرادي، قمرت"
                              className="bg-[#fffdf9] border-[#a9802f]/30 text-[#3d2e1e] rounded-[5px]" 
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[#a9802f]">Second Address / العنوان بالتفصيل للموقع الثاني</Label>
                          <Input 
                            dir="auto" 
                            value={weddingData?.secondVenue?.address || ''} 
                            onChange={(e) => {
                              const newAddr = e.target.value;
                              const vName = weddingData?.secondVenue?.name || '';
                              const q = encodeURIComponent([vName, newAddr].filter(Boolean).join(', '));
                              updateWeddingData('secondVenue', { 
                                ...weddingData?.secondVenue, 
                                address: newAddr,
                                mapUrl: `https://www.google.com/maps/search/?api=1&query=${q}`,
                                embedUrl: `https://www.google.com/maps?q=${q}&output=embed`
                              });
                            }} 
                            placeholder="e.g. المنطقة السياحية، قمرت"
                            className="bg-[#fffdf9] border-[#a9802f]/30 text-[#3d2e1e] rounded-[5px]" 
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[#a9802f]">Second Location Google Maps Link (Optional)</Label>
                          <Input 
                            dir="ltr" 
                            value={weddingData?.secondVenue?.mapUrl || ''} 
                            onChange={(e) => updateWeddingData('secondVenue', { ...weddingData?.secondVenue, mapUrl: e.target.value })} 
                            placeholder="https://maps.google.com/..."
                            className="bg-[#fffdf9] border-[#a9802f]/30 text-[#3d2e1e] rounded-[5px]" 
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gift" className="m-0 focus-visible:outline-none">
              <Card className="bg-[#f0e5d3] border-[#a9802f]/30 rounded-[15px] text-[#3d2e1e]">
                <CardHeader>
                  <CardTitle className="text-2xl font-display italic text-[#a9802f]">Gift & Dress Code</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4 border-b border-[#a9802f]/20 pb-4">
                    <h3 className="text-xl font-display text-[#a9802f]">Gift Details</h3>
                    <div className="space-y-2">
                      <Label className="text-[#a9802f]">Title</Label>
                      <Input dir="auto" value={weddingData?.gift?.title || ''} onChange={(e) => updateWeddingData('gift', { ...weddingData?.gift, title: e.target.value })} className="bg-[#faf5ec] border-[#a9802f]/30 text-[#3d2e1e] rounded-[5px]" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#a9802f]">Body</Label>
                      <Textarea dir="auto" value={weddingData?.gift?.body || ''} onChange={(e) => updateWeddingData('gift', { ...weddingData?.gift, body: e.target.value })} className="bg-[#faf5ec] border-[#a9802f]/30 text-[#3d2e1e] rounded-[5px]" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-display text-[#a9802f]">Dress Code</h3>
                    <div className="space-y-2">
                      <Label className="text-[#a9802f]">Title</Label>
                      <Input dir="auto" value={weddingData?.dressCode?.title || ''} onChange={(e) => updateWeddingData('dressCode', { ...weddingData?.dressCode, title: e.target.value })} className="bg-[#faf5ec] border-[#a9802f]/30 text-[#3d2e1e] rounded-[5px]" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#a9802f]">Body</Label>
                      <Textarea dir="auto" value={weddingData?.dressCode?.body || ''} onChange={(e) => updateWeddingData('dressCode', { ...weddingData?.dressCode, body: e.target.value })} className="bg-[#faf5ec] border-[#a9802f]/30 text-[#3d2e1e] rounded-[5px]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rsvp" className="m-0 focus-visible:outline-none">
              <Card className="bg-[#f0e5d3] border-[#a9802f]/30 rounded-[15px] text-[#3d2e1e]">
                <CardHeader>
                  <CardTitle className="text-2xl font-display italic text-[#a9802f]">RSVP & Attendance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[#a9802f]">Heading</Label>
                      <Input dir="auto" value={weddingData?.rsvp?.heading || ''} onChange={(e) => updateWeddingData('rsvp', { ...weddingData?.rsvp, heading: e.target.value })} className="bg-[#faf5ec] border-[#a9802f]/30 text-[#3d2e1e] rounded-[5px]" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#a9802f]">Subheading</Label>
                      <Input dir="auto" value={weddingData?.rsvp?.subheading || ''} onChange={(e) => updateWeddingData('rsvp', { ...weddingData?.rsvp, subheading: e.target.value })} className="bg-[#faf5ec] border-[#a9802f]/30 text-[#3d2e1e] rounded-[5px]" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#a9802f]">Deadline</Label>
                      <Input dir="auto" value={weddingData?.rsvp?.deadline || ''} onChange={(e) => updateWeddingData('rsvp', { ...weddingData?.rsvp, deadline: e.target.value })} className="bg-[#faf5ec] border-[#a9802f]/30 text-[#3d2e1e] rounded-[5px]" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#a9802f]">WhatsApp Number / رقم الواتساب لتلقي التأكيدات مباشرة (اختياري)</Label>
                      <Input 
                        dir="ltr" 
                        value={weddingData?.rsvp?.whatsapp || ''} 
                        onChange={(e) => updateWeddingData('rsvp', { ...weddingData?.rsvp, whatsapp: e.target.value })} 
                        placeholder="+216 00 000 000"
                        className="bg-[#faf5ec] border-[#a9802f]/30 text-[#3d2e1e] rounded-[5px]" 
                      />
                      <p className="text-xs text-[#6c513f]">عند كتابة رقم الواتساب، سيتمكن الضيوف من تأكيد حضورهم مباشرة بضغطة زر واحدة عبر تطبيق واتساب.</p>
                    </div>
                  </div>

                  {/* Netlify Cloud Form Notification Info */}
                  <div className="p-4 rounded-[10px] bg-[#faf5ec] border border-[#a9802f]/20 space-y-2">
                    <h4 className="font-display text-base text-[#a9802f]">☁️ Netlify Cloud Forms (تلقي التأكيدات عبر السحابة)</h4>
                    <p className="text-xs text-[#5a4a38] leading-relaxed">
                      جميع تأكيدات الحضور التي يرسلها الضيوف يتم تسجيلها تلقائياً وبأمان في حسابكم على <strong>Netlify Dashboard &gt; Forms &gt; rsvp</strong>، حيث يمكنكم الاطلاع عليها وتنزيلها كملف Excel/CSV في أي وقت.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="closing" className="m-0 focus-visible:outline-none">
              <Card className="bg-[#f0e5d3] border-[#a9802f]/30 rounded-[15px] text-[#3d2e1e]">
                <CardHeader>
                  <CardTitle className="text-2xl font-display italic text-[#a9802f]">Closing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[#a9802f]">Line</Label>
                    <Input dir="auto" value={weddingData?.closing?.line || ''} onChange={(e) => updateWeddingData('closing', { ...weddingData?.closing, line: e.target.value })} className="bg-[#faf5ec] border-[#a9802f]/30 text-[#3d2e1e] rounded-[5px]" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#a9802f]">Signature</Label>
                    <Input dir="auto" value={weddingData?.closing?.signature || ''} onChange={(e) => updateWeddingData('closing', { ...weddingData?.closing, signature: e.target.value })} className="bg-[#faf5ec] border-[#a9802f]/30 text-[#3d2e1e] rounded-[5px]" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="images" className="m-0 focus-visible:outline-none">
              <Card className="bg-[#f0e5d3] border-[#a9802f]/30 rounded-[15px] text-[#3d2e1e]">
                <CardHeader>
                  <CardTitle className="text-2xl font-display italic text-[#a9802f]">Images</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {['envelope', 'scheduleImg', 'closingPhoto', 'floralLarge', 'waxSeal'].map((key) => (
                    <div key={key} className="flex gap-4 items-center bg-[#faf5ec] p-4 rounded-[10px] border border-[#a9802f]/20">
                      <div className="w-16 h-16 bg-[#f8f1e5] rounded-[5px] border border-[#a9802f]/30 overflow-hidden flex-shrink-0">
                        {decor[key] ? (
                          <img src={decor[key]} alt={key} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">No Img</div>
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <Label className="capitalize text-[#a9802f]">{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                        <Input dir="ltr" value={decor[key] || ''} onChange={(e) => updateDecor(key, e.target.value)} className="bg-[#faf5ec] border-[#a9802f]/30 text-[#3d2e1e] rounded-[5px]" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Guests & RSVPs Tab */}
            <TabsContent value="guests" className="m-0 focus-visible:outline-none">
              <Card className="bg-[#f0e5d3] border-[#a9802f]/30 rounded-[15px] text-[#3d2e1e]">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl font-display italic text-[#a9802f]">Guest List & RSVPs</CardTitle>
                    <p className="text-xs text-[#6c513f] mt-1">سجل الضيوف وتأكيدات الحضور وإحصائيات الحفل</p>
                  </div>
                  <div className="flex gap-2 flex-wrap items-center">
                    <Button
                      type="button"
                      onClick={refreshGuestList}
                      variant="outline"
                      className="border-[#a9802f]/40 text-[#a9802f] hover:bg-[#a9802f]/10 text-xs py-1.5 px-3 rounded-[20px] flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> تحديث
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setAddGuestOpen(true)}
                      className="bg-[#a9802f] hover:bg-[#8a6a22] text-white text-xs py-1.5 px-3 rounded-[20px] flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> إضافة ضيف
                    </Button>
                    <Button
                      type="button"
                      onClick={handleExportExcel}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs py-1.5 px-3 rounded-[20px] flex items-center gap-1.5 shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" /> Excel / CSV
                    </Button>
                    <Button
                      type="button"
                      onClick={handleExportPDF}
                      className="bg-[rgb(90,15,27)] hover:bg-[rgb(118,20,36)] text-white text-xs py-1.5 px-3 rounded-[20px] flex items-center gap-1.5 shadow-sm"
                    >
                      <FileText className="w-3.5 h-3.5" /> PDF / طباعة
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* KPI Statistics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-[#faf5ec] p-3.5 rounded-[12px] border border-[#a9802f]/20 text-center">
                      <p className="text-xs text-[#6c513f] uppercase font-elegant">إجمالي الردود</p>
                      <p className="text-2xl font-display font-bold text-[#3d2e1e] mt-1">{guestList.length}</p>
                    </div>
                    <div className="bg-[#faf5ec] p-3.5 rounded-[12px] border border-emerald-600/30 text-center">
                      <p className="text-xs text-emerald-800 uppercase font-elegant">حاضرين</p>
                      <p className="text-2xl font-display font-bold text-emerald-700 mt-1">
                        {guestList.filter(g => g.attending === 'yes').length}
                      </p>
                    </div>
                    <div className="bg-[#faf5ec] p-3.5 rounded-[12px] border border-[#a9802f]/40 text-center">
                      <p className="text-xs text-[#a9802f] uppercase font-elegant">إجمالي الأفراد</p>
                      <p className="text-2xl font-display font-bold text-[#a9802f] mt-1">
                        {guestList.reduce((acc, g) => acc + (g.attending === 'yes' ? parseInt(g.guests || 1, 10) : 0), 0)}
                      </p>
                    </div>
                    <div className="bg-[#faf5ec] p-3.5 rounded-[12px] border border-red-400/30 text-center">
                      <p className="text-xs text-red-700 uppercase font-elegant">معتذرين</p>
                      <p className="text-2xl font-display font-bold text-red-600 mt-1">
                        {guestList.filter(g => g.attending === 'no').length}
                      </p>
                    </div>
                  </div>

                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <div className="relative w-full sm:w-72">
                      <Search className="w-4 h-4 absolute right-3 top-2.5 text-[#a9802f]" />
                      <Input
                        dir="auto"
                        value={guestSearch}
                        onChange={(e) => setGuestSearch(e.target.value)}
                        placeholder="البحث بالاسم..."
                        className="bg-[#faf5ec] pr-9 border-[#a9802f]/30 text-[#3d2e1e] rounded-[8px] text-xs h-9"
                      />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto justify-end">
                      <Button
                        type="button"
                        size="sm"
                        variant={guestFilter === 'all' ? 'default' : 'outline'}
                        onClick={() => setGuestFilter('all')}
                        className={guestFilter === 'all' ? "bg-[#a9802f] text-white text-xs h-8 rounded-[15px]" : "border-[#a9802f]/40 text-[#a9802f] text-xs h-8 rounded-[15px]"}
                      >
                        الكل ({guestList.length})
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={guestFilter === 'yes' ? 'default' : 'outline'}
                        onClick={() => setGuestFilter('yes')}
                        className={guestFilter === 'yes' ? "bg-emerald-700 text-white text-xs h-8 rounded-[15px]" : "border-[#a9802f]/40 text-[#a9802f] text-xs h-8 rounded-[15px]"}
                      >
                        الحاضرين ({guestList.filter(g => g.attending === 'yes').length})
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={guestFilter === 'no' ? 'default' : 'outline'}
                        onClick={() => setGuestFilter('no')}
                        className={guestFilter === 'no' ? "bg-red-700 text-white text-xs h-8 rounded-[15px]" : "border-[#a9802f]/40 text-[#a9802f] text-xs h-8 rounded-[15px]"}
                      >
                        المعتذرين ({guestList.filter(g => g.attending === 'no').length})
                      </Button>
                    </div>
                  </div>

                  {/* Guests Table */}
                  <div className="overflow-x-auto rounded-[10px] border border-[#a9802f]/30 bg-[#faf5ec]">
                    <table className="w-full text-xs text-right" dir="rtl">
                      <thead className="bg-[#f0e5d3] text-[#6e521e] border-b border-[#a9802f]/20 uppercase font-elegant">
                        <tr>
                          <th className="p-3 text-center w-10">#</th>
                          <th className="p-3">اسم الضيف</th>
                          <th className="p-3 text-center">الحالة</th>
                          <th className="p-3 text-center">عدد الأفراد</th>
                          <th className="p-3">إهداء / دعاء</th>
                          <th className="p-3">ملاحظات</th>
                          <th className="p-3 text-center">إجراء</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#a9802f]/10">
                        {guestList
                          .filter(g => {
                            if (guestFilter === 'yes') return g.attending === 'yes';
                            if (guestFilter === 'no') return g.attending === 'no';
                            return true;
                          })
                          .filter(g => {
                            if (!guestSearch.trim()) return true;
                            return (g.name || '').toLowerCase().includes(guestSearch.toLowerCase());
                          })
                          .map((g, idx) => (
                            <tr key={idx} className="hover:bg-[#f8f1e5]/60 transition-colors">
                              <td className="p-3 text-center font-semibold text-[#6c513f]">{idx + 1}</td>
                              <td className="p-3 font-medium text-[#3d2e1e]">{g.name || 'ضيف'}</td>
                              <td className="p-3 text-center">
                                {g.attending === 'yes' ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold">
                                    <CheckCircle2 className="w-3 h-3" /> يشرفني الحضور
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-red-100 text-red-800 border border-red-300 font-semibold">
                                    <XCircle className="w-3 h-3" /> اعتذار
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-center font-bold text-[#3d2e1e]">
                                {g.attending === 'yes' ? (g.guests || 1) : 0}
                              </td>
                              <td className="p-3 text-[#5a4a38] max-w-[200px] truncate" title={g.song || ''}>
                                {g.song || '-'}
                              </td>
                              <td className="p-3 text-[#5a4a38] max-w-[200px] truncate" title={g.children || ''}>
                                {g.children || '-'}
                              </td>
                              <td className="p-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteGuest(idx)}
                                  className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                                  title="حذف"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        {guestList.length === 0 && (
                          <tr>
                            <td colSpan="7" className="p-8 text-center text-[#6c513f]">
                              لا توجد تأكيدات حضور مسجلة بعد. يمكنك إضافة ضيف يدوياً أو انتظار تأكيدات الضيوف من الدعوة.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {guestList.length > 0 && (
                    <div className="flex justify-between items-center text-xs text-[#6c513f] pt-2">
                      <p>إجمالي الحضور الفعلي المسجل: <strong>{guestList.reduce((acc, g) => acc + (g.attending === 'yes' ? parseInt(g.guests || 1, 10) : 0), 0)} فرد</strong></p>
                      <button
                        type="button"
                        onClick={handleClearAllGuests}
                        className="text-red-700 hover:text-red-900 underline text-xs"
                      >
                        مسح كافة البيانات
                      </button>
                    </div>
                  )}

                </CardContent>
              </Card>

              {/* Add Manual Guest Dialog */}
              <Dialog open={addGuestOpen} onOpenChange={setAddGuestOpen}>
                <DialogContent className="bg-[#f0e5d3] border border-[#a9802f]/40 text-[#3d2e1e] rounded-[20px] max-w-[420px]" dir="rtl">
                  <DialogHeader>
                    <DialogTitle className="text-[#a9802f] font-display text-2xl text-right">إضافة ضيف جديد</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddManualGuest} className="space-y-4 py-2 text-right">
                    <div className="space-y-2">
                      <Label className="text-[#a9802f] text-xs">الاسم الكريم *</Label>
                      <Input
                        dir="auto"
                        required
                        value={newGuest.name}
                        onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                        placeholder="اسم الضيف واللقب"
                        className="bg-[#faf5ec] border-[#a9802f]/30 text-[#3d2e1e] rounded-[5px]"
                        autoFocus
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#a9802f] text-xs">حالة الحضور</Label>
                      <select
                        value={newGuest.attending}
                        onChange={(e) => setNewGuest({ ...newGuest, attending: e.target.value })}
                        className="w-full px-3 py-2 bg-[#faf5ec] border border-[#a9802f]/30 text-[#3d2e1e] rounded-[5px] text-xs"
                      >
                        <option value="yes">يشرفني الحضور بكل سرور</option>
                        <option value="no">اعتذار عن عدم التمكن من الحضور</option>
                      </select>
                    </div>
                    {newGuest.attending === 'yes' && (
                      <div className="space-y-2">
                        <Label className="text-[#a9802f] text-xs">عدد الأفراد والحضور</Label>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          value={newGuest.guests}
                          onChange={(e) => setNewGuest({ ...newGuest, guests: e.target.value })}
                          className="bg-[#faf5ec] border-[#a9802f]/30 text-[#3d2e1e] rounded-[5px]"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label className="text-[#a9802f] text-xs">إهداء أو دعاء (اختياري)</Label>
                      <Input
                        dir="auto"
                        value={newGuest.song}
                        onChange={(e) => setNewGuest({ ...newGuest, song: e.target.value })}
                        placeholder="دعاء أو تهنئة"
                        className="bg-[#faf5ec] border-[#a9802f]/30 text-[#3d2e1e] rounded-[5px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#a9802f] text-xs">ملاحظات (اختياري)</Label>
                      <Textarea
                        dir="auto"
                        value={newGuest.children}
                        onChange={(e) => setNewGuest({ ...newGuest, children: e.target.value })}
                        placeholder="أية ملاحظات إضافية"
                        className="bg-[#faf5ec] border-[#a9802f]/30 text-[#3d2e1e] rounded-[5px] min-h-[50px]"
                      />
                    </div>
                    <DialogFooter className="gap-2 pt-2">
                      <Button type="button" variant="outline" onClick={() => setAddGuestOpen(false)} className="border-[#a9802f]/40 text-[#a9802f] rounded-[20px]">
                        إلغاء
                      </Button>
                      <button type="submit" className="btn-2 !py-2 !px-6 !text-xs">
                        حفظ الضيف
                      </button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </TabsContent>

            <TabsContent value="settings" className="m-0 focus-visible:outline-none">
              <Card className="bg-[#f0e5d3] border-[#a9802f]/30 rounded-[15px] text-[#3d2e1e]">
                <CardHeader>
                  <CardTitle className="text-2xl font-display italic text-[#a9802f]">Global Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[#a9802f]">Language</Label>
                      <select 
                        value={settings.language} 
                        onChange={(e) => updateSettings({ ...settings, language: e.target.value })}
                        className="w-full px-3 py-2 bg-[#faf5ec] border border-[#a9802f]/30 text-[#3d2e1e] rounded-[5px] focus:outline-none focus:ring-2 focus:ring-[#a9802f] text-sm"
                      >
                        <option value="en">English</option>
                        <option value="ar">Arabic</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#a9802f]">Text Direction</Label>
                      <select 
                        value={settings.direction} 
                        onChange={(e) => updateSettings({ ...settings, direction: e.target.value })}
                        className="w-full px-3 py-2 bg-[#faf5ec] border border-[#a9802f]/30 text-[#3d2e1e] rounded-[5px] focus:outline-none focus:ring-2 focus:ring-[#a9802f] text-sm"
                      >
                        <option value="ltr">Left to Right (LTR)</option>
                        <option value="rtl">Right to Left (RTL)</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#a9802f]/20 space-y-3">
                    <div>
                      <h4 className="font-display text-lg text-[#a9802f] flex items-center gap-2">
                        <Server className="w-4 h-4" /> Cloud Backend Server (Render / Cloud API)
                      </h4>
                      <p className="text-xs text-[#6c513f]">رابط الخادم السحابي لمزامنة التعديلات وتأكيدات الحضور مباشرة لجميع الزوار والأصدقاء</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        dir="ltr"
                        value={customApiUrl}
                        onChange={(e) => setCustomApiUrl(e.target.value)}
                        placeholder="https://wedding-syrine-backend.onrender.com/api"
                        className="bg-[#faf5ec] border-[#a9802f]/30 text-[#3d2e1e] text-xs font-mono flex-1 rounded-[5px]"
                      />
                      <Button
                        type="button"
                        onClick={handleTestAndSaveApi}
                        className="bg-[#a9802f] hover:bg-[#8a6a22] text-white text-xs py-2 px-4 rounded-[5px]"
                      >
                        حفظ وفحص الاتصال
                      </Button>
                    </div>
                    {apiTestMessage && (
                      <p className={`text-xs p-2.5 rounded-[6px] ${apiTestStatus === 'error' ? 'bg-amber-100/70 text-amber-900 border border-amber-300' : 'bg-emerald-100/70 text-emerald-900 border border-emerald-300'}`}>
                        {apiTestMessage}
                      </p>
                    )}
                  </div>

                  {/* Background Music Settings */}
                  <div className="pt-4 border-t border-[#a9802f]/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-display text-lg text-[#a9802f] flex items-center gap-2">
                          <Music className="w-4 h-4" /> Romantic Background Music / الموسيقى الرومانسية
                        </h4>
                        <p className="text-xs text-[#6c513f]">تشغيل موسيقى رومانسية كلاسيكية هادئة في الخلفية بشكل متواصل مع زر تحكم بالتشغيل والإيقاف</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={weddingData?.music?.enabled !== false}
                          onChange={(e) => updateWeddingData('music', {
                            ...(weddingData?.music || {}),
                            enabled: e.target.checked
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[rgb(90,15,27)]"></div>
                      </label>
                    </div>
                    {weddingData?.music?.enabled !== false && (
                      <div className="space-y-2 pt-2">
                        <Label className="text-[#a9802f] text-xs">رابط ملف الصوت / Audio Track URL (MP3)</Label>
                        <Input
                          dir="ltr"
                          value={weddingData?.music?.url || '/romantic_wedding_song.mp3'}
                          onChange={(e) => updateWeddingData('music', {
                            ...(weddingData?.music || {}),
                            url: e.target.value
                          })}
                          placeholder="/romantic_wedding_song.mp3"
                          className="bg-[#faf5ec] border-[#a9802f]/30 text-[#3d2e1e] text-xs font-mono rounded-[5px]"
                        />
                        <p className="text-[11px] text-[#6c513f]">المسار الافتراضي: المقطوعة الرومانسية الكلاسيكية المرفقة مع الموقع (`/romantic_wedding_song.mp3`)</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-[#a9802f]/20 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                    <div>
                      <h4 className="font-display text-lg text-[#a9802f]">Backup & Export Configuration</h4>
                      <p className="text-xs text-[#6c513f]">Download your customized invitation details as a JSON file</p>
                    </div>
                    <Button 
                      type="button" 
                      onClick={handleExportJSON}
                      className="bg-[#a9802f] hover:bg-[#8a6a22] text-[#faf5ec] text-xs py-2 px-4 rounded-[20px]"
                    >
                      Export Backup (JSON)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

          </div>
        </Tabs>
      </div>
    </div>
  );
}
