import React, { useState } from 'react';
import { useWeddingData } from '../context/WeddingContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { toast } from '../hooks/use-toast';
import { submitRSVP } from '../api';

export default function RSVP() {
  const { weddingData, decor, settings = {} } = useWeddingData();
  const rsvp = weddingData?.rsvp || {};
  const isAr = settings?.language === 'ar' || settings?.direction === 'rtl';
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    attending: 'yes',
    guests: '1',
    song: '',
    children: '',
  });

  const handleChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setLoading(true);

    const submissionData = {
      name: form.name || 'ضيف مجهول',
      attending: form.attending,
      guests: form.guests || '1',
      song: form.song || '',
      children: form.children || ''
    };

    // 1. Submit to Netlify Forms (saves to Netlify Cloud dashboard)
    try {
      const encode = (data) => {
        return Object.keys(data)
          .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
          .join('&');
      };

      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode({ 'form-name': 'rsvp', ...submissionData })
      });
    } catch (err) {
      console.warn('Netlify form submission note:', err);
    }

    // 2. Submit to backend API if available
    try {
      await submitRSVP(submissionData);
    } catch (err) {
      console.warn('Backend API note:', err);
    }

    // 3. Local fallback persistence
    try {
      const existing = JSON.parse(localStorage.getItem('sg_rsvps') || '[]');
      existing.push({ ...submissionData, at: new Date().toISOString() });
      localStorage.setItem('sg_rsvps', JSON.stringify(existing));
    } catch (_) {}

    setLoading(false);
    setOpen(false);
    toast({
      title: isAr ? 'شكراً جزيلاً!' : 'Thank you!',
      description: isAr
        ? (form.attending === 'yes'
            ? 'تم تسجيل تأكيد حضوركم بنجاح. نتطلع بشوق لرؤيتكم والاحتفال معكم!'
            : 'تم تسجيل اعتذاركم بنجاح. سنفتقد وجودكم معنا.')
        : (form.attending === 'yes'
            ? 'Your RSVP has been received. We can’t wait to celebrate with you.'
            : 'Your response has been noted. You will be dearly missed.'),
    });
    setForm({ name: '', attending: 'yes', guests: '1', song: '', children: '' });
  };

  const handleWhatsAppRSVP = () => {
    const groomBride = `${weddingData?.couple?.groom || 'سيرين'} & ${weddingData?.couple?.bride || 'وائل'}`;
    const statusText = form.attending === 'yes' ? 'يشرفني الحضور بكل سرور' : 'أعتذر لعدم التمكن من الحضور';
    const msg = encodeURIComponent(
      `السلام عليكم،\nأود تأكيد الحضور لحفل زفاف ${groomBride}:\n\n` +
      `👤 الاسم: ${form.name || 'ضيف'}\n` +
      `✨ الحالة: ${statusText}\n` +
      `👥 عدد الحضور: ${form.guests}\n` +
      (form.song ? `🎶 إهداء: ${form.song}\n` : '') +
      (form.children ? `📝 ملاحظات: ${form.children}\n` : '')
    );
    const phone = (rsvp.whatsapp || '').replace(/[^0-9]/g, '');
    const url = phone ? `https://wa.me/${phone}?text=${msg}` : `https://wa.me/?text=${msg}`;
    window.open(url, '_blank');
  };

  return (
    <section className="relative w-full py-12 flex flex-col items-center text-center overflow-hidden">
      <img
        src={decor.rsvpDecoL}
        alt=""
        className="decor-img absolute -top-3 -left-2 w-[70px] sm:w-[90px] opacity-65 pointer-events-none"
      />
      <img
        src={decor.rsvpDecoR}
        alt=""
        className="decor-img absolute -top-3 -right-2 w-[65px] sm:w-[85px] opacity-65 pointer-events-none"
      />

      <div className="w-full flex flex-col items-center px-4 relative z-10 pt-2">
        <p className="font-elegant text-[11px] tracking-[0.25em] uppercase text-[#a9802f]">
          {isAr ? 'تأكيد الحضور' : 'RSVP'}
        </p>
        <h3 className="mt-2 font-display italic text-3xl sm:text-4xl text-[#3d2e1e]">
          {rsvp.heading}
        </h3>
        <div className="my-5 hairline w-28" />
        <p className="font-body text-[16px] leading-[1.6] text-[#5a4a38] max-w-[340px]">
          {rsvp.subheading}
        </p>

        {/* Button 3: padding 0px (Wax seal trigger) */}
        <button
          onClick={() => setOpen(true)}
          className="btn-3 group mt-10 inline-flex flex-col items-center focus:outline-none cursor-pointer"
          style={{ padding: '0px' }}
        >
          <img
            src={decor.waxSeal}
            alt={isAr ? 'تأكيد الحضور' : 'Open RSVP'}
            className="w-[130px] sm:w-[160px] rounded-full transition-transform duration-500 group-hover:scale-105 drop-shadow-[0_10px_24px_rgba(90,15,27,0.22)]"
            style={{ animation: 'floatY 5s ease-in-out infinite' }}
          />
          <span className="mt-4 font-elegant text-[11px] tracking-[0.2em] uppercase text-[#a9802f] group-hover:text-[#6e521e] transition-colors">
            {isAr ? 'اضغط لتأكيد الحضور' : 'Click to open'}
          </span>
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[400px] w-[94%] bg-[#f0e5d3] border border-[#a9802f]/40 rounded-[20px] shadow-[0_20px_50px_rgba(108,81,63,0.12)] text-[#5a4a38] p-5 sm:p-6 max-h-[90vh] overflow-y-auto" dir={isAr ? 'rtl' : 'ltr'}>
          <DialogHeader className="text-center">
            <DialogTitle className="font-display italic text-2xl sm:text-3xl text-[#6e521e] text-center">
              {rsvp.heading}
            </DialogTitle>
            <DialogDescription className="text-center font-body text-[#6e5d4d] text-[15px] mt-1">
              {rsvp.deadline}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-start">
            <div>
              <Label className="font-elegant text-[11px] tracking-[0.15em] uppercase text-[#a9802f]">
                {isAr ? 'الاسم الكريم' : 'Your name'}
              </Label>
              <Input
                required
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="mt-1.5 bg-[#faf5ec] border-[#a9802f]/40 text-[#3d2e1e] focus-visible:ring-[#a9802f] rounded-[8px]"
                placeholder={isAr ? 'الاسم واللقب' : 'Full name'}
                dir="auto"
              />
            </div>

            <div>
              <Label className="font-elegant text-[11px] tracking-[0.15em] uppercase text-[#a9802f]">
                {isAr ? 'هل ستشرفنا بالحضور؟' : 'Will you be attending?'}
              </Label>
              <RadioGroup
                value={form.attending}
                onValueChange={(v) => handleChange('attending', v)}
                className="mt-2.5 flex flex-col gap-2"
              >
                <label className="flex items-center gap-3 font-body text-[15px] text-[#3d2e1e] cursor-pointer">
                  <RadioGroupItem value="yes" id="yes" className="border-[#a9802f] text-[#a9802f]" />
                  {isAr ? 'يشرفني الحضور بكل سرور' : 'Accepts with pleasure'}
                </label>
                <label className="flex items-center gap-3 font-body text-[15px] text-[#3d2e1e] cursor-pointer">
                  <RadioGroupItem value="no" id="no" className="border-[#a9802f] text-[#a9802f]" />
                  {isAr ? 'أعتذر لعدم التمكن من الحضور' : 'Declines with regret'}
                </label>
              </RadioGroup>
            </div>

            <div>
              <Label className="font-elegant text-[11px] tracking-[0.15em] uppercase text-[#a9802f]">
                {isAr ? 'عدد الحضور والمرافقين' : 'Number of Guests Attending'}
              </Label>
              <Input
                type="number"
                min="0"
                max="10"
                value={form.guests}
                onChange={(e) => handleChange('guests', e.target.value)}
                className="mt-1.5 bg-[#faf5ec] border-[#a9802f]/40 text-[#3d2e1e] focus-visible:ring-[#a9802f] rounded-[8px]"
                dir="auto"
              />
            </div>

            <div>
              <Label className="font-elegant text-[11px] tracking-[0.15em] uppercase text-[#a9802f]">
                {isAr ? 'إهداء أو دعاء للعروسين' : 'A Song That Gets You Dancing'}
              </Label>
              <Input
                value={form.song}
                onChange={(e) => handleChange('song', e.target.value)}
                className="mt-1.5 bg-[#faf5ec] border-[#a9802f]/40 text-[#3d2e1e] focus-visible:ring-[#a9802f] rounded-[8px]"
                placeholder={isAr ? 'دعاء أو كلمة طيبة للعروسين' : 'Song title – artist'}
                dir="auto"
              />
            </div>

            <div>
              <Label className="font-elegant text-[11px] tracking-[0.15em] uppercase text-[#a9802f]">
                {isAr ? 'ملاحظات إضافية' : 'Children Attending'}
              </Label>
              <Textarea
                value={form.children}
                onChange={(e) => handleChange('children', e.target.value)}
                placeholder={isAr ? 'يرجى كتابة أية ملاحظات إضافية' : 'Please include names and ages.'}
                className="mt-1.5 bg-[#faf5ec] border-[#a9802f]/40 text-[#3d2e1e] focus-visible:ring-[#a9802f] rounded-[8px] min-h-[60px]"
                dir="auto"
              />
            </div>

            <DialogFooter className="pt-2 flex flex-col gap-2.5">
              <button
                type="submit"
                disabled={loading}
                className="btn-2 w-full disabled:opacity-50"
              >
                {loading ? (isAr ? 'جاري الإرسال...' : 'Submitting...') : (isAr ? 'إرسال التأكيد' : 'Submit RSVP')}
              </button>

              <button
                type="button"
                onClick={handleWhatsAppRSVP}
                className="w-full py-2.5 px-4 rounded-[20px] border border-green-600/40 text-green-800 bg-green-50/80 hover:bg-green-100/90 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <span>💬 {isAr ? 'تأكيد الحضور مباشرة عبر واتساب' : 'Confirm via WhatsApp'}</span>
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
