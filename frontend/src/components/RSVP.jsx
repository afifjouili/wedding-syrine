import React, { useState } from 'react';
import { decor, weddingData } from '../mock';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Button } from './ui/button';
import { toast } from '../hooks/use-toast';

export default function RSVP() {
  const { rsvp } = weddingData;
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    attending: 'yes',
    guests: '1',
    song: '',
    children: '',
  });

  const handleChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // Persist locally for the mock
    try {
      const existing = JSON.parse(localStorage.getItem('sg_rsvps') || '[]');
      existing.push({ ...form, at: new Date().toISOString() });
      localStorage.setItem('sg_rsvps', JSON.stringify(existing));
    } catch (_) {}
    setOpen(false);
    toast({
      title: 'Thank you!',
      description:
        form.attending === 'yes'
          ? 'Your RSVP has been received. We can\u2019t wait to celebrate with you.'
          : 'Your response has been noted. You will be dearly missed.',
    });
    setForm({ name: '', attending: 'yes', guests: '1', song: '', children: '' });
  };

  return (
    <section className="relative w-full py-24 md:py-32 overflow-hidden">
      <img
        src={decor.rsvpDecoL}
        alt=""
        className="decor-img absolute top-10 left-4 w-[200px] md:w-[300px] opacity-90"
      />
      <img
        src={decor.rsvpDecoR}
        alt=""
        className="decor-img absolute top-10 right-4 w-[180px] md:w-[260px] opacity-90"
      />

      <div className="mx-auto max-w-3xl px-6 text-center">
        <p className="font-elegant text-[11px] md:text-[13px] tracking-[0.45em] uppercase text-ink-soft mt-16">
          RSVP
        </p>
        <h3 className="mt-4 font-display italic text-4xl md:text-6xl text-ink">{rsvp.heading}</h3>
        <div className="mx-auto my-8 hairline w-40" />
        <p className="font-body text-lg md:text-2xl text-ink-soft max-w-xl mx-auto">
          {rsvp.subheading}
        </p>

        <button
          onClick={() => setOpen(true)}
          className="group mt-14 inline-flex flex-col items-center focus:outline-none"
        >
          <img
            src={decor.waxSeal}
            alt="Open RSVP"
            className="w-[150px] md:w-[190px] transition-transform duration-500 group-hover:scale-105 drop-shadow-[0_15px_25px_rgba(120,90,40,0.25)]"
            style={{ animation: 'floatY 5s ease-in-out infinite' }}
          />
          <span className="mt-5 font-elegant text-[11px] md:text-[12px] tracking-[0.4em] uppercase text-ink-soft">
            Click to open
          </span>
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg bg-[#f7ecd0] border-[#b39a63]/50">
          <DialogHeader>
            <DialogTitle className="font-display italic text-3xl md:text-4xl text-ink text-center">
              {rsvp.heading}
            </DialogTitle>
            <DialogDescription className="text-center font-body text-ink-soft text-base">
              {rsvp.deadline}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 mt-2">
            <div>
              <Label className="font-elegant text-[11px] tracking-[0.3em] uppercase text-ink-soft">Your name</Label>
              <Input
                required
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="mt-2 bg-transparent border-[#b39a63]/60 focus-visible:ring-[#a1874a]"
                placeholder="Full name"
              />
            </div>

            <div>
              <Label className="font-elegant text-[11px] tracking-[0.3em] uppercase text-ink-soft">Will you be attending?</Label>
              <RadioGroup
                value={form.attending}
                onValueChange={(v) => handleChange('attending', v)}
                className="mt-3 flex flex-col gap-2"
              >
                <label className="flex items-center gap-3 font-body text-ink cursor-pointer">
                  <RadioGroupItem value="yes" id="yes" className="border-[#a1874a] text-[#a1874a]" />
                  Accepts with pleasure
                </label>
                <label className="flex items-center gap-3 font-body text-ink cursor-pointer">
                  <RadioGroupItem value="no" id="no" className="border-[#a1874a] text-[#a1874a]" />
                  Declines with regret
                </label>
              </RadioGroup>
            </div>

            <div>
              <Label className="font-elegant text-[11px] tracking-[0.3em] uppercase text-ink-soft">
                Number of Guests Attending
              </Label>
              <Input
                type="number"
                min="0"
                max="10"
                value={form.guests}
                onChange={(e) => handleChange('guests', e.target.value)}
                className="mt-2 bg-transparent border-[#b39a63]/60 focus-visible:ring-[#a1874a]"
              />
            </div>

            <div>
              <Label className="font-elegant text-[11px] tracking-[0.3em] uppercase text-ink-soft">
                A Song That Gets You Dancing
              </Label>
              <Input
                value={form.song}
                onChange={(e) => handleChange('song', e.target.value)}
                className="mt-2 bg-transparent border-[#b39a63]/60 focus-visible:ring-[#a1874a]"
                placeholder="Song title \u2013 artist"
              />
            </div>

            <div>
              <Label className="font-elegant text-[11px] tracking-[0.3em] uppercase text-ink-soft">
                Children Attending
              </Label>
              <Textarea
                value={form.children}
                onChange={(e) => handleChange('children', e.target.value)}
                placeholder="Please include names and ages."
                className="mt-2 bg-transparent border-[#b39a63]/60 focus-visible:ring-[#a1874a] min-h-[70px]"
              />
            </div>

            <DialogFooter>
              <Button
                type="submit"
                className="w-full font-elegant tracking-[0.3em] uppercase text-[12px] bg-[#a1874a] hover:bg-[#8c703a] text-[#f7ecd0] rounded-none"
              >
                Submit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
