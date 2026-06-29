import { CheckCircle2, Download, CalendarPlus, Ticket, ArrowRight, Mail, Sparkles } from 'lucide-react';
import { useApp } from '../../state/AppStore';
import { PriceBreakdownView } from '../../components/ui/PriceBreakdownView';
import { voucherText, icsText } from '../../domain/booking';
import { download } from '../../utils/download';

export function ConfirmationPage() {
  const { t, bookings, navigate, route } = useApp();
  const booking = bookings.find((b) => b.id === route.params.id);

  if (!booking) {
    return (
      <div className="container-page py-24 text-center text-ink-500">
        {t('trips.empty')}{' '}
        <button onClick={() => navigate('trips')} className="font-semibold text-brand-600">{t('nav.trips')}</button>
      </div>
    );
  }

  // sibling bookings created in the same checkout (same createdIso)
  const group = bookings.filter((b) => b.createdIso === booking.createdIso);

  return (
    <div className="container-page max-w-3xl py-10">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 animate-fade-up">
          <CheckCircle2 size={36} />
        </div>
        <h1 className="text-3xl font-extrabold text-ink-900">{t('confirm.title')}</h1>
        <p className="mt-2 flex items-center justify-center gap-1.5 text-ink-500">
          <Mail size={15} /> {t('confirm.subtitle', { email: booking.guestEmail })}
        </p>
      </div>

      <div className="mt-8 space-y-4">
        {group.map((b) => (
          <div key={b.id} className="card overflow-hidden">
            <div className="flex flex-col gap-4 p-5 sm:flex-row">
              <img src={b.image} alt="" className="h-36 w-full rounded-xl object-cover sm:h-28 sm:w-44" />
              <div className="flex-1">
                <span className="chip mb-1">{b.vertical === 'hotels' ? t('nav.hotels') : t('nav.flights')}</span>
                <h3 className="text-lg font-bold text-ink-900">{b.title}</h3>
                <p className="text-sm text-ink-500">{b.subtitle}</p>
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                  <span><span className="text-ink-400">{t('confirm.reference')}: </span><span className="font-bold text-ink-900">{b.reference}</span></span>
                  <span><span className="text-ink-400">{t('confirm.voucher')}: </span><span className="font-mono font-semibold text-ink-900">{b.voucherCode}</span></span>
                </div>
              </div>
            </div>
            <div className="border-t border-ink-100 bg-ink-50/50 p-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <PriceBreakdownView pricing={b.pricing} compact />
                <div className="flex flex-col justify-center gap-2">
                  <button onClick={() => download(`voucher-${b.reference}.txt`, voucherText(b), 'text/plain')} className="btn-secondary justify-start">
                    <Download size={16} /> {t('confirm.downloadVoucher')}
                  </button>
                  <button onClick={() => download(`voya-${b.reference}.ics`, icsText(b), 'text/calendar')} className="btn-secondary justify-start">
                    <CalendarPlus size={16} /> {t('confirm.addCalendar')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <div className="flex items-center gap-1.5 rounded-xl bg-brand-50 px-4 py-2 text-sm font-bold text-brand-700">
          <Sparkles size={15} /> + {group.reduce((a, b) => a + b.pricing.pointsEarned, 0).toLocaleString()} {t('price.points')}
        </div>
        <button onClick={() => navigate('trips')} className="btn-primary">
          <Ticket size={16} /> {t('confirm.viewTrips')} <ArrowRight size={16} className="rtl-flip" />
        </button>
      </div>
    </div>
  );
}
