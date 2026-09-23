/**
 * Sits between the hero and the "why us" block.
 *
 * NOTE: these are plain descriptive claims, deliberately NOT trade-body or
 * review-platform logos: those would assert accreditations Lekker may not
 * hold. For the same reason there is no "licensed operator" line: the company
 * profile lists the TRA licence as still to be confirmed. Add it here once the
 * licence number is in hand.
 */
const CREDENTIALS = [
  'Nairobi-based specialists',
  'Personalised planning',
  'One point of contact',
  'Transparent pricing',
  'Responsible travel',
];

export function CredentialsStrip() {
  return (
    <section className="bg-white py-7 md:py-10">
      <div className="container-page">
        <p className="mb-4 text-center text-[0.6rem] uppercase tracking-[0.3em] text-muted md:mb-6 md:tracking-[0.35em]">
          Why travellers choose us
        </p>
        <ul className="mx-auto grid max-w-md grid-cols-2 gap-x-4 gap-y-2.5 sm:max-w-none sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-8 md:gap-x-12 md:gap-y-4">
          {CREDENTIALS.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 text-[0.58rem] uppercase leading-snug tracking-[0.06em] text-forest-700 sm:items-center sm:text-[0.62rem] sm:tracking-[0.12em] md:gap-2.5 md:text-[0.7rem] md:tracking-[0.18em]"
            >
              <span aria-hidden className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500 sm:mt-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
