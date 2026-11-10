import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { connectDB } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/data";
import { Course, Enrollment, Order, User } from "@/models";
import { plain, formatPrice, finalPrice, discount, fmtDate } from "@/lib/utils";
import { Thumb, Kicker, Mark } from "@/components/site/ui";
import { CheckoutForm, FreeEnrollButton } from "@/components/site/client";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage({ params }) {
  const { slug } = await params;
  const session = await getSession();
  if (!session) redirect(`/login?next=/checkout/${slug}`);
  await connectDB();

  const c = plain(await Course.findOne({ slug, published: true }).select("title slug thumbnail price salePrice duration mode").lean());
  if (!c) notFound();
  if (await Enrollment.exists({ user: session.id, course: c._id })) redirect(`/learn/${slug}`);

  const [s, pending, user] = await Promise.all([
    getSettings(),
    Order.findOne({ user: session.id, course: c._id, status: "pending" }).lean().then(plain),
    User.findById(session.id).select("phone").lean(),
  ]);
  const price = finalPrice(c);
  const off = discount(c);
  const pay = {
    bankName: s.bankName, accountTitle: s.accountTitle, accountNumber: s.accountNumber, iban: s.iban,
    jazzcash: s.jazzcash, easypaisa: s.easypaisa, paymentNote: s.paymentNote, phone: s.phone,
  };

  return (
    <div className="pb-24">
      <section className="border-b border-line">
        <div className="container-x pt-14 pb-10 sm:pt-20">
          <Kicker>Checkout</Kicker>
          <h1 className="display-page mt-5">Almost <Mark>there.</Mark></h1>
          <p className="mt-5 max-w-xl text-xl text-muted">Two quick steps to enroll.</p>
        </div>
      </section>

      <div className="container-x mt-12 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          {pending ? (
            <div className="rounded-[24px] border border-line bg-white p-8 sm:p-10">
              <span className="tag bg-accent-500 text-ink">In review</span>
              <h2 className="mt-5 text-3xl font-extrabold tracking-tight">We&apos;re checking your payment</h2>
              <p className="mt-3 text-lg text-muted">
                Submitted on {fmtDate(pending.createdAt)} · Txn {pending.transactionId}. Your course unlocks as soon as it&apos;s verified.
              </p>
              <Link href="/dashboard" className="btn btn-dark mt-8">Go to dashboard</Link>
            </div>
          ) : price === 0 ? (
            <div className="rounded-[24px] border border-line bg-white p-8 sm:p-10">
              <h2 className="text-3xl font-extrabold tracking-tight">This one&apos;s free.</h2>
              <p className="mt-3 text-lg text-muted">Enroll and start the first lesson right away.</p>
              <div className="mt-8 max-w-xs"><FreeEnrollButton courseId={c._id} slug={c.slug} className="btn btn-primary btn-lg w-full" /></div>
            </div>
          ) : (
            <CheckoutForm courseId={c._id} amount={price} pay={pay} defaultPhone={user?.phone || ""} />
          )}
        </div>

        <aside className="lg:col-span-5">
          <div className="rounded-[24px] border border-line bg-white p-5 lg:sticky lg:top-28">
            <Thumb src={c.thumbnail} alt={c.title} className="aspect-video w-full rounded-[18px]" />
            <div className="p-2 pt-6">
              {c.mode && <p className="text-[15px] font-semibold text-brand-700">{c.mode}</p>}
              <h2 className="mt-1 text-2xl leading-tight font-extrabold tracking-tight">{c.title}</h2>
              <dl className="mt-6 space-y-3 border-t border-line pt-5 text-[16px]">
                <div className="flex justify-between"><dt className="text-muted">Program fee</dt><dd>{formatPrice(c.price)}</dd></div>
                {off > 0 && <div className="flex justify-between text-brand-700"><dt>Discount ({off}%)</dt><dd>− {formatPrice(c.price - price)}</dd></div>}
                <div className="flex items-end justify-between border-t border-ink pt-4">
                  <dt className="text-lg font-bold">You pay</dt>
                  <dd className="text-3xl font-extrabold tracking-tight">{formatPrice(price)}</dd>
                </div>
              </dl>
              <p className="mt-6 flex gap-2 rounded-xl bg-paper px-4 py-3 text-[14px] text-muted">
                <ShieldCheck size={18} className="shrink-0 text-forest" />Our team checks every payment by hand. Keep your receipt until your course unlocks.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
