import { useState } from 'react';
import {
  Ticket, Plane, BedDouble, Download, CalendarPlus, XCircle, Calendar, MapPin,
  CheckCircle2, AlertTriangle, ScrollText, Luggage,
} from 'lucide-react';
import { useApp } from '../../state/AppStore';
import { Modal } from '../../components/ui/Modal';
import { quoteRefund, voucherText, icsText } from '../../domain/booking';
import { download } from '../../utils/download';
import { sum, negate, Money } from '../../domain/money';
import { Booking } from '../../domain/types';

export function TripsPage() {
  const { t, fmt, locale, bookings, cancelBooking, navigate } = useApp();
  const [tab, setTab] = useState<'upcoming' | 'cancelled'>('upcoming');
  const [voucherFor, setVoucherFor] = useState<Booking | null>(null);
  const [cancelFor, setCancelFor] = useState<Booking | null>(null);

  const upcoming = bookings.filter((b) => b.status === 'confirmed');
  const cancelled = bookings.filter((b) => b.status === 'cancelled');
  const list = tab === 'upcoming' ? upcoming : cancelled;

  const doCancel = () => {
    if (!cancelFor) return;
    const q = quoteRefund(cancelFor, Date.now());
    cancelBooking(cancelFor.id, { amount: q.refund, penalty: q.penalty, processedIso: new Date().toISOString() });
    setCancelFor(null);
  };

  if (bookings.length === 0) {
    return (
      <div className="container-page grid place-items-center py-24 text-center">
        <Ticket size={48} className="mb-4 text-ink-300" />
        <h1 className="text-2xl font-extrabold text-ink-900">{t('trips.empty')}</h1>
        <button onClick={() => navigate('searchHotels')} className="btn-primary mt-5">{t('cart.startSearching')}</button>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <h1 className="mb-5 text-2xl font-extrabold text-ink-900">{t('trips.title')}</h1>

      <div className="mb-6 inline-flex rounded-xl border border-ink-200 bg-white p-1">
        {(['upcoming', 'cancelled'] as const).map((x) => (
          <button
            key={x}
            onClick={() => setTab(x)}
            className={`rounded-lg px-4 py-2 text-sm font-bold ${tab === x ? 'bg-brand-600 text-white' : 'text-ink-500 hover:text-ink-800'}`}
          >
            {t(`trips.${x}`)} {x === 'upcoming' ? `(${upcoming.length})` : `(${cancelled.length})`}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="card grid place-items-center py-16 text-ink-400">{t('trips.empty')}</div>
      ) : (
        <div className="space-y-4">
          {list.map((b) => (
            <TripCard
              key={b.id}
              b={b}
              fmt={fmt}
              locale={locale}
              t={t}
              onVoucher={() => setVoucherFor(b)}
              onCancel={() => setCancelFor(b)}
            />
          ))}
        </div>
      )}

      {/* Voucher modal */}
      <Modal open={!!voucherFor} onClose={() => setVoucherFor(null)} title={t('confirm.voucher')}>
        {voucherFor && (
          <div>
            <div className="rounded-2xl border-2 border-dashed border-ink-200 p-5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-extrabold text-ink-900">
                  {voucherFor.vertical === 'flights' ? <Plane size={18} className="rtl-flip text-brand-600" /> : <BedDouble size={18} className="text-brand-600" />}
                  {voucherFor.title}
                </span>
                <span className="chip">{voucherFor.vertical === 'flights' ? 'E-TICKET' : 'VOUCHER'}</span>
              </div>
              <p className="mt-1 text-sm text-ink-500">{voucherFor.subtitle}</p>
              <div className="my-4 border-t border-dashed border-ink-200" />
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Kv label={t('confirm.reference')} value={voucherFor.reference} mono />
                <Kv label={t('confirm.voucher')} value={voucherFor.voucherCode} mono />
                <Kv label={t('common.guest')} value={voucherFor.guestName} />
                <Kv label={t('common.total')} value={fmt(voucherFor.pricing.total)} />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => download(`voucher-${voucherFor.reference}.txt`, voucherText(voucherFor), 'text/plain')} className="btn-secondary flex-1">
                <Download size={16} /> PDF
              </button>
              <button onClick={() => download(`voya-${voucherFor.reference}.ics`, icsText(voucherFor), 'text/calendar')} className="btn-secondary flex-1">
                <CalendarPlus size={16} /> {t('confirm.addCalendar')}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Cancel modal */}
      <Modal open={!!cancelFor} onClose={() => setCancelFor(null)} title={t('trips.cancelTitle')}>
        {cancelFor && <CancelBody booking={cancelFor} fmt={fmt} t={t} onConfirm={doCancel} onKeep={() => setCancelFor(null)} />}
      </Modal>
    </div>
  );
}

function TripCard({ b, fmt, locale, t, onVoucher, onCancel }: { b: Booking; fmt: (m: Money) => string; locale: string; t: (k: string, v?: Record<string, string>) => string; onVoucher: () => void; onCancel: () => void }) {
  const cancelledState = b.status === 'cancelled';
  return (
    <div className={`card overflow-hidden ${cancelledState ? 'opacity-80' : ''}`}>
      <div className="flex flex-col gap-4 p-4 sm:flex-row">
        <div className="relative h-40 w-full overflow-hidden rounded-xl sm:h-32 sm:w-48 sm:shrink-0">
          <img src={b.image} alt="" className="h-full w-full object-cover" />
          {cancelledState && (
            <div className="absolute inset-0 grid place-items-center bg-ink-950/50">
              <span className="rounded-lg bg-white/95 px-2 py-1 text-xs font-bold text-red-600">{t('trips.cancelledOn')}</span>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="chip mb-1">
                {b.vertical === 'flights' ? <Plane size={11} className="rtl-flip" /> : <BedDouble size={11} />}
                {b.vertical === 'flights' ? t('nav.flights') : t('nav.hotels')}
              </span>
              <h3 className="text-lg font-bold text-ink-900">{b.title}</h3>
              <p className="text-sm text-ink-500">{b.subtitle}</p>
            </div>
            <div className="text-end">
              <div className="text-lg font-extrabold text-ink-900">{fmt(b.pricing.total)}</div>
              <div className="text-xs text-ink-400">{t('trips.ref')} {b.reference}</div>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500">
            <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(b.travelDateIso).toLocaleDateString(locale === 'ar' ? 'ar' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <span className="flex items-center gap-1">{b.cancellation.refundable ? <CheckCircle2 size={12} className="text-emerald-500" /> : <AlertTriangle size={12} className="text-ink-400" />}{b.cancellation.refundable ? t('common.freeCancellation') : t('common.nonRefundable')}</span>
            {b.vertical === 'flights' ? <span className="flex items-center gap-1"><Luggage size={12} /> {t('nav.flights')}</span> : <span className="flex items-center gap-1"><MapPin size={12} /> {b.subtitle.split('·')[0]}</span>}
          </div>

          {cancelledState && b.refund && (
            <div className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              <CheckCircle2 size={13} /> {t('trips.refunded', { amount: fmt(b.refund.amount) })}
            </div>
          )}

          <div className="mt-auto flex flex-wrap gap-2 pt-3">
            <button onClick={onVoucher} className="btn-secondary py-1.5"><Ticket size={15} /> {t('trips.viewVoucher')}</button>
            {!cancelledState && (
              <button onClick={onCancel} className="btn py-1.5 text-red-600 hover:bg-red-50"><XCircle size={15} /> {t('trips.cancelBooking')}</button>
            )}
          </div>
        </div>
      </div>

      {/* Ledger */}
      <LedgerStrip b={b} fmt={fmt} t={t} />
    </div>
  );
}

function LedgerStrip({ b, fmt, t }: { b: Booking; fmt: (m: Money) => string; t: (k: string) => string }) {
  const [open, setOpen] = useState(false);
  const balance = sum(b.ledger.map((e) => e.amount), b.pricing.currency);
  const balanced = balance.amount === 0;
  return (
    <div className="border-t border-ink-100 bg-ink-50/50">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between px-4 py-2.5 text-xs font-semibold text-ink-500 hover:text-ink-800">
        <span className="flex items-center gap-1.5"><ScrollText size={13} /> {t('trips.ledger')}</span>
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${balanced ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
          {balanced ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />} {t('trips.balanced')}
        </span>
      </button>
      {open && (
        <div className="px-4 pb-3">
          <table className="w-full text-xs">
            <tbody>
              {b.ledger.map((e) => (
                <tr key={e.id} className="border-t border-ink-100/70">
                  <td className="py-1.5 font-mono text-ink-400">{e.account}</td>
                  <td className="py-1.5 text-ink-600">{e.memo}</td>
                  <td className={`py-1.5 text-end font-medium tabular-nums ${e.amount.amount < 0 ? 'text-emerald-600' : 'text-ink-800'}`}>{fmt(e.amount)}</td>
                </tr>
              ))}
              {b.refund && (
                <tr className="border-t border-ink-200">
                  <td className="py-1.5 font-mono text-ink-400">refunds</td>
                  <td className="py-1.5 text-ink-600">Refund to customer (penalty {fmt(b.refund.penalty)})</td>
                  <td className="py-1.5 text-end font-medium tabular-nums text-emerald-600">{fmt(negate(b.refund.amount))}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CancelBody({ booking, fmt, t, onConfirm, onKeep }: { booking: Booking; fmt: (m: Money) => string; t: (k: string, v?: Record<string, string>) => string; onConfirm: () => void; onKeep: () => void }) {
  const q = quoteRefund(booking, Date.now());
  return (
    <div>
      <div className={`rounded-xl border p-4 ${q.refundable ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
        <p className={`text-sm font-medium ${q.refundable ? 'text-emerald-800' : 'text-amber-800'}`}>
          {!q.refundable
            ? t('trips.cancelNonRef')
            : q.penalty.amount === 0
            ? t('trips.cancelPolicyFree', { amount: fmt(q.refund) })
            : t('trips.cancelPolicyPenalty', { penalty: fmt(q.penalty), amount: fmt(q.refund) })}
        </p>
      </div>
      <div className="mt-4 space-y-1.5 text-sm">
        <Row label={t('common.total')} value={fmt(booking.pricing.total)} />
        <Row label={t('common.penalty')} value={fmt(q.penalty)} muted />
        <div className="flex items-center justify-between border-t border-ink-100 pt-2 font-bold">
          <span className="text-ink-900">{t('common.refund')}</span>
          <span className="text-emerald-600">{fmt(q.refund)}</span>
        </div>
      </div>
      <div className="mt-5 flex gap-2">
        <button onClick={onKeep} className="btn-secondary flex-1">{t('trips.keepBooking')}</button>
        <button onClick={onConfirm} className="btn flex-1 bg-red-600 text-white hover:bg-red-700">{t('trips.confirmCancel')}</button>
      </div>
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={muted ? 'text-ink-400' : 'text-ink-600'}>{label}</span>
      <span className="font-medium tabular-nums text-ink-800">{value}</span>
    </div>
  );
}

function Kv({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-xs text-ink-400">{label}</div>
      <div className={`font-bold text-ink-900 ${mono ? 'font-mono text-sm' : ''}`}>{value}</div>
    </div>
  );
}
