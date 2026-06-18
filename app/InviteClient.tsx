"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import {
  normalizeWishRows,
} from "../lib/invite-utils";

export default function InviteClient() {
  const sp = useSearchParams();
  const code = (sp.get("code") ?? "").trim();
  const showPrivateStats = sp.get("admin") === "1";
  const formatDisplayName = (value: string) =>
    value
      .toLowerCase()
      .split(" ")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  const opened = true;
  const [showCallPrompt, setShowCallPrompt] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [showCalendarPrompt, setShowCalendarPrompt] = useState(false);
  const [showThanksPrompt, setShowThanksPrompt] = useState(false);
  const [showWishPrompt, setShowWishPrompt] = useState(false);
  const [wishName, setWishName] = useState("");
  const [wishText, setWishText] = useState("");
  const [revealKey, setRevealKey] = useState(0);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (!opened) return;
    const elements = Array.from(document.querySelectorAll(".reveal"));
    if (elements.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    elements.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [opened, revealKey]);

  useEffect(() => {
    if (!opened) return;
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = muted;
    const play = () => audio.play().catch(() => {});
    // Ensure play happens after the audio element is mounted
    const id = setTimeout(play, 0);
    return () => clearTimeout(id);
  }, [opened, muted]);

  // ==============================
  // YOUR INFO (maintained)
  // ==============================
  const wedding = useMemo(
    () => ({
      groom: "SYAHMI",
      bride: "HANIS",
      dateText: "JUMAAT • 24.07.26",
      hijriText: "9 Safar 1448H",
      venue:
        "Grand Ballroom Bora Ombak\nJalan P5/5, Presint 5\n62200 Putrajaya\nWilayah Persekutuan Putrajaya",
      time: "8:00 PM – 11:00 PM",
      phone1: "+60123456789",
      wazeUrl:
        "https://www.waze.com/live-map/directions/my/wilayah-persekutuan-putrajaya/putrajaya/boraombak-@-marina-putrajaya-or-wedding-and-event-venue?to=place.ChIJFbvEIAC3zTER3kbhFGin_dg",
      googleMapUrl:
        "https://www.google.com/maps/dir/BoraOmbak+@+Marina+Putrajaya+%7C+Wedding+%26+Event+Venue,+1,+Jalan+P5%2F5,+Presint+5,+62200+Putrajaya/DoubleTree+by+Hilton+Putrajaya+Lakeside,+2,+Jalan+P5%2F5,+Presint+5,+62200+Putrajaya/@2.9007971,101.6678383,17z/data=!3m1!4b1!4m14!4m13!1m5!1m1!1s0x31cdb70020c4bb15:0xd8fda76814e146de!2m2!1d101.6703671!2d2.9012895!1m5!1m1!1s0x31cdb73cc743b8c9:0xac4d51cd6418d93f!2m2!1d101.6697543!2d2.9003165!3e0?entry=ttu&g_ep=EgoyMDI2MDYxNi4wIKXMDSoASAFQAw%3D%3D",
      videoUrl: "https://example.com/video",

      parentsTitle: "Walimatul Urus",
      parentsLine: "Mat Rani bin Abd Latif\n&\nFadzilah bt Teh",
      childLine:
        "Muhammad Syahmi Firdaus bin Mat Rani\n&\nNurhanis Suraya binti Kamarudin",
      introText:
        "Dengan penuh kesyukuran, kami mempersilakan\nDato' | Datin | Tuan | Puan | Encik | Cik\nseisi keluarga hadir ke majlis perkahwinan\nanakanda kami",

      venueTitle: "TEMPAT",
      dateTitle: "TARIKH",
      timeTitle: "WAKTU",
      dateISO: "2026-07-24",
      startTime: "20:00",
      endTime: "23:00",
      timezone: "Asia/Kuala_Lumpur",

      // file must be: public/theme/blue .jpg
      floralFrame: "/theme/blue%20.jpg",

      // gallery photos (extracted from your video)
      gallery: ["/gallery/kad-photo-2.png", "/gallery/kad-photo-1.png", "/gallery/kad-photo-3.png"],

      // countdown date: 24/7/2026
      countdownISO: "2026-07-24T00:00:00+08:00",

      // text blocks
      doaText:
        "Ya Allah Ya Rahman Ya Rahim, berkatilah majlis perkahwinan ini.\nLimpahkanlah barakah dan rahmatMu kepada\nkedua mempelai ini. Kurniakanlah mereka kekal\nzuriat yang soleh dan solehah. Kekalkanlah\njodoh mereka hingga ke jannah.",

      // song (public file)
      songUrl: "/audio/song.mp3",
    }),
    []
  );

  // ==============================
  // STATE
  // ==============================
  const [guest, setGuest] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // RSVP fields
  const [fullName, setFullName] = useState("");
  const [paxInput, setPaxInput] = useState("1");
  const [attending, setAttending] = useState("yes");

  // Stats + wishes (no GIFT page)
  const [hadirCount, setHadirCount] = useState(0);
  const [takHadirCount, setTakHadirCount] = useState(0);
  const [wishes, setWishes] = useState<Array<{ name: string; text: string }>>([]);

  // ==============================
  // LOAD GUEST NAME
  // ==============================
  useEffect(() => {
    if (!code) return;

    (async () => {
      try {
        const { data, error } = await supabase
          .from("invite")
          .select("guest_name")
          .eq("code", code)
          .limit(1)
          .single();

        if (!error && data?.guest_name) {
          setGuest(data.guest_name);
          setFullName(data.guest_name);
        }
      } catch {}
    })();
  }, [code]);

  // ==============================
  // LOAD COUNTS (HADIR / TIDAK HADIR)
  // ==============================
  async function loadCounts() {
    try {
      const { data: hadirRows } = await supabase.from("rsvp").select("pax").eq("attending", "yes");
      const { count: takCount } = await supabase
        .from("rsvp")
        .select("name", { count: "exact", head: true })
        .eq("attending", "no");

      const hadirSum = (hadirRows || []).reduce((sum, row) => sum + Number(row.pax || 0), 0);
      setHadirCount(hadirSum);
      setTakHadirCount(takCount || 0);
    } catch {}
  }

  useEffect(() => {
    loadCounts();
  }, []);

  // ==============================
  // REALTIME COUNTS
  // ==============================
  useEffect(() => {
    const channel = supabase
      .channel("rsvp-counts")
      .on("postgres_changes", { event: "*", schema: "public", table: "rsvp" }, () => {
        loadCounts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ==============================
  // LOAD WISHES
  // ==============================
  async function loadWishes() {
    try {
      // Try ordered fetch first. Fallback handles tables without created_at.
      const ordered = await supabase
        .from("wishes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(12);

      let rows: Array<Record<string, unknown>> = [];
      if (!ordered.error) {
        rows = (ordered.data || []) as Array<Record<string, unknown>>;
      } else {
        const fallback = await supabase.from("wishes").select("*").limit(12);
        if (!fallback.error) rows = (fallback.data || []) as Array<Record<string, unknown>>;
      }

      setWishes(normalizeWishRows(rows));
    } catch {
      setWishes([]);
    }
  }

  useEffect(() => {
    loadWishes();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("wishes-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "wishes" }, () => {
        loadWishes();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ==============================
  // SUBMIT RSVP
  // ==============================
  async function submitRSVP() {
    if (isSubmitting) return;
    if (!fullName.trim()) return setStatus("Sila isi nama.");
    const pax = Number.parseInt(paxInput.trim(), 10);
    if (!Number.isFinite(pax) || pax < 1) return setStatus("Sila isi jumlah pax yang sah.");
    setStatus("Saving...");
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("rsvp").insert({
        name: fullName,
        pax,
        attending,
      });

      if (!error) {
        setStatus("Terima Kasih!");
        setShowThanksPrompt(true);
        loadCounts();
      } else {
        setStatus(`Failed: ${error.message}`);
      }
    } catch {
      setStatus("Network error");
    } finally {
      setIsSubmitting(false);
    }
  }

  function addWish(name: string, text: string) {
    const t = text.trim();
    if (!t) return;

    (async () => {
      try {
        const wishName = name.trim() || "Tetamu";
        // Support multiple table schemas that may exist in Supabase.
        const attempts = [
          () => supabase.from("wishes").insert({ name: wishName, text: t }),
          () => supabase.from("wishes").insert({ name: wishName, ucapan: t }),
          () => supabase.from("wishes").insert({ name: wishName, message: t }),
        ];

        let saved = false;
        for (const run of attempts) {
          const { error } = await run();
          if (!error) {
            saved = true;
            break;
          }
        }

        if (saved) {
          await loadWishes();
        } else {
          setStatus("Ucapan belum disimpan ke server. Semak polisi atau kolum wishes.");
        }
      } catch {
        setStatus("Ucapan belum disimpan ke server.");
      }
    })();
  }

  return (
    <div
      className="min-h-screen text-[#10354d] font-playfair-regular"
      style={{
        backgroundImage: `url("${wedding.floralFrame}")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <FloatingDots />

      {opened ? (
        <>
          <audio ref={audioRef} src={wedding.songUrl} loop playsInline />
          <button
          onClick={() => {
            const next = !muted;
            setMuted(next);
            const audio = audioRef.current;
            if (audio) {
              audio.muted = next;
              if (!next) audio.play().catch(() => {});
            }
          }}
            aria-label={muted ? "Unmute" : "Mute"}
            className="fixed right-4 top-4 z-[70] rounded-full bg-white/85 p-2 text-[#10354d] shadow-md"
          >
            {muted ? <IconMute /> : <IconVolume />}
          </button>

          {/* HERO */}
          <section className="relative min-h-screen">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("${wedding.floralFrame}")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundSize: "cover",
                opacity: 0.95,
              }}
            />
            <div className="relative z-10 mx-auto flex min-h-screen max-w-[420px] flex-col items-center justify-center px-6 text-center font-playfair-bold">
              <div className="fade-in delay-1 text-[12px] tracking-[0.2em] text-[#1f1f1f]">
                {wedding.parentsTitle}
              </div>
              <div className="fade-in delay-2 mt-8 font-priestacy font-normal text-[56px] leading-[0.98] text-[#2c2a2a] sm:text-[70px]">
                {formatDisplayName(wedding.groom)}
                <br />
                <span className="inline-block py-2 font-normal text-[48px] leading-none opacity-95 sm:text-[58px]">
                  &amp;
                </span>
                <br />
                {formatDisplayName(wedding.bride)}
              </div>
              <div className="fade-in delay-3 mt-8 font-playfair-regular text-[14px] tracking-[0.12em] text-[#143a55] sm:text-[14px]">
                {wedding.dateText}
              </div>
              <div className="fade-in delay-3 mt-2 font-playfair-regular text-[14px] tracking-[0.04em] text-[#143a55]/85 sm:text-[14px]">
                {wedding.hijriText}
              </div>
            </div>
          </section>

          {/* INVITATION */}
          <Section key={`inv-${revealKey}`} delay={200}>
            <div className="relative overflow-hidden rounded-[28px] bg-white/86 shadow-xl">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url("${wedding.floralFrame}")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                  opacity: 0.18,
                }}
              />
              <div className="relative z-10 px-6 py-10 text-center text-[#1f1f1f]">
                <div className="fade-in delay-1 text-[13px] font-medium tracking-[0.2em] text-[#1f1f1f]">
                  {wedding.parentsTitle}
                </div>
                <div className="fade-in delay-2 mt-5 font-playfair-regular text-[22px] leading-[1.42] text-[#1f1f1f] whitespace-pre-line sm:text-[24px]">
                  {wedding.parentsLine}
                </div>
                <div className="fade-in delay-3 mt-5 text-[14px] font-medium leading-[1.8] whitespace-pre-line text-[#1f1f1f]">
                  {wedding.introText}
                </div>
                <div className="fade-in delay-5 mt-7 font-playfair-regular text-[22px] leading-[1.42] text-[#1f1f1f] whitespace-pre-line sm:text-[24px]">
                  {wedding.childLine}
                </div>
                <div className="fade-in delay-6 mt-9 space-y-7">
                  <InfoBlock title={wedding.venueTitle} body={wedding.venue} />
                  <InfoBlock title={wedding.dateTitle} body={`${wedding.dateText}\n${wedding.hijriText}`} />
                  <InfoBlock title={wedding.timeTitle} body={wedding.time} />
                </div>
                <button
                  className="fade-in delay-7 mt-9 rounded-full border border-[#1f1f1f] px-6 py-2 text-[13px] font-medium text-[#1f1f1f]"
                  onClick={() => setShowCalendarPrompt(true)}
                >
                  Simpan Tarikh
                </button>
              </div>
            </div>
          </Section>

          {/* DOA + COUNTDOWN */}
          <Section key={`doa-${revealKey}`} delay={600}>
        <div className="text-center text-[12px] leading-relaxed whitespace-pre-line text-[#1f1f1f]">
          {wedding.doaText}
        </div>
        <div className="mt-6 text-center text-[12px] tracking-[0.2em] text-[#1f1f1f]">MENGHITUNG HARI</div>
        <div className="mt-4 flex justify-center gap-6 text-center">
          <CountdownBox targetISO={wedding.countdownISO} />
        </div>
      </Section>

          {/* KEHADIRAN + UCAPAN */}
          <Section key={`kehadiran-${revealKey}`} delay={800}>
        <div className="text-center">
          {showPrivateStats ? (
            <>
              <div className="text-[12px] tracking-[0.2em] text-[#1f1f1f]">KEHADIRAN</div>
              <div className="mt-5 flex justify-center gap-10">
                <SmallCount num={hadirCount} label="Hadir" />
                <SmallCount num={takHadirCount} label="Tidak Hadir" />
              </div>
            </>
          ) : null}

          <div className={`${showPrivateStats ? "mt-8" : "mt-0"} text-[12px] tracking-[0.2em] text-[#1f1f1f]`}>
            UCAPAN
          </div>
          <div className="mt-4 space-y-3 text-[12px] text-[#1f1f1f]">
            {wishes.slice(0, 8).map((w, i) => (
              <div key={i}>
                <div className="italic">“{w.text}”</div>
                <div className="font-semibold">{w.name}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-center gap-3">
            <button
              className="rounded-full border border-[#1f1f1f] px-4 py-2 text-[12px] text-[#1f1f1f]"
              onClick={() => {
                setWishName(guest || fullName || "");
                setWishText("");
                setShowWishPrompt(true);
              }}
            >
              Tulis Ucapan
            </button>
          </div>

        </div>
      </Section>

          {/* RSVP */}
          <Section key={`rsvp-${revealKey}`} delay={1000}>
        <div
          id="rsvpBox"
          className="rounded-2xl border border-[#10354d]/25 bg-white/76 p-5 text-left"
        >
          <div className="text-center text-[12px] tracking-[0.2em] text-[#1f1f1f]">RSVP</div>

          <div className="mt-4 grid gap-3">
            <input
              className="input"
              placeholder="Nama"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <ThemedSelect
              value={attending}
              options={[
                { value: "yes", label: "Hadir" },
                { value: "no", label: "Tidak Hadir" },
              ]}
              onChange={setAttending}
            />
            <ThemedSelect
              value={paxInput}
              options={[
                { value: "1", label: "1 pax" },
                { value: "2", label: "2 pax" },
              ]}
              onChange={setPaxInput}
            />

            <button
              disabled={isSubmitting}
              className="w-full rounded-xl bg-[#10354d] py-3 text-sm text-white"
              onClick={submitRSVP}
            >
              {isSubmitting ? "Menyimpan..." : "Hantar"}
            </button>

            {status ? <div className="text-sm text-center text-black/60">{status}</div> : null}
          </div>
        </div>
      </Section>

      {/* bottom bar (NO GIFT icon) */}
          <BottomBar
            phone={wedding.phone1}
            videoUrl={wedding.videoUrl}
            onCall={() => setShowCallPrompt(true)}
            onLocation={() => setShowLocationPrompt(true)}
          />

          <style jsx global>{`
            .input {
              width: 100%;
              border-radius: 12px;
              border: 1px solid rgba(16, 53, 77, 0.25);
              background: rgba(255, 255, 255, 0.75);
              padding: 12px 14px;
              font-size: 16px; /* prevent iPhone zoom */
              color: #1f1f1f;
              appearance: none;
              -webkit-appearance: none;
            }
            .input::placeholder {
              color: rgba(31, 31, 31, 0.42);
            }
            .select-wrap {
              position: relative;
            }
            .select-wrap::after {
              content: "";
              position: absolute;
              right: 16px;
              top: 50%;
              width: 10px;
              height: 10px;
              margin-top: -7px;
              border-right: 2px solid rgba(16, 53, 77, 0.85);
              border-bottom: 2px solid rgba(16, 53, 77, 0.85);
              transform: rotate(45deg);
              pointer-events: none;
            }
            .input-select {
              padding-right: 42px;
            }
            .themed-select {
              position: relative;
              z-index: 1;
            }
            .themed-select.is-open {
              z-index: 30;
            }
            .themed-select-trigger {
              cursor: pointer;
              text-align: left;
            }
            .themed-select-menu {
              position: absolute;
              left: 0;
              right: 0;
              top: calc(100% + 8px);
              overflow: hidden;
              border-radius: 14px;
              border: 1px solid rgba(16, 53, 77, 0.22);
              background: rgba(247, 251, 253, 0.96);
              box-shadow: 0 18px 38px rgba(9, 40, 61, 0.2);
              backdrop-filter: blur(10px);
            }
            .themed-select-option {
              display: flex;
              width: 100%;
              align-items: center;
              gap: 10px;
              border: 0;
              background: transparent;
              padding: 12px 14px;
              color: #10354d;
              font: inherit;
              text-align: left;
              font-size: 16px;
            }
            .themed-select-option + .themed-select-option {
              border-top: 1px solid rgba(16, 53, 77, 0.1);
            }
            .themed-select-option:hover,
            .themed-select-option:focus-visible {
              background: rgba(16, 53, 77, 0.08);
              outline: none;
            }
            .themed-select-check {
              width: 18px;
              color: #10354d;
              font-weight: 700;
            }
            .fade-in {
              opacity: 0;
              transform: translateY(8px);
              animation: fadeInUp 900ms ease forwards;
              will-change: opacity, transform;
            }
            .reveal {
              opacity: 0;
              transform: translateY(10px);
              transition: opacity 900ms ease, transform 900ms ease;
              will-change: opacity, transform;
            }
            .reveal.is-visible {
              opacity: 1;
              transform: translateY(0);
            }
            .delay-1 {
              animation-delay: 150ms;
            }
            .delay-2 {
              animation-delay: 320ms;
            }
            .delay-3 {
              animation-delay: 480ms;
            }
            .delay-4 {
              animation-delay: 640ms;
            }
            .delay-5 {
              animation-delay: 800ms;
            }
            .delay-6 {
              animation-delay: 980ms;
            }
            .delay-7 {
              animation-delay: 1160ms;
            }
            @keyframes fadeInUp {
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
        </>
      ) : null}

      {showCallPrompt ? (
        <CallPrompt
          onClose={() => setShowCallPrompt(false)}
          options={[
            { name: "Mat Rani", phone: "0182492311" },
            { name: "Fadzilah", phone: "0183846277" },
          ]}
        />
      ) : null}

      {showLocationPrompt ? (
        <LocationPrompt
          onClose={() => setShowLocationPrompt(false)}
          wazeUrl={wedding.wazeUrl}
          googleMapUrl={wedding.googleMapUrl}
        />
      ) : null}

      {showCalendarPrompt ? (
        <CalendarPrompt
          onClose={() => setShowCalendarPrompt(false)}
          wedding={wedding}
        />
      ) : null}

      {showThanksPrompt ? (
        <ThanksPrompt onClose={() => setShowThanksPrompt(false)} />
      ) : null}

      {showWishPrompt ? (
        <WishPrompt
          name={wishName}
          text={wishText}
          onChangeName={setWishName}
          onChangeText={setWishText}
          onClose={() => setShowWishPrompt(false)}
          onSubmit={() => {
            addWish(wishName || guest || fullName || "Tetamu", wishText);
            setShowWishPrompt(false);
          }}
        />
      ) : null}
    </div>
  );
}

function Section({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <section
      className="reveal mx-auto max-w-[420px] px-6 py-10"
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </section>
  );
}

function ThemedSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const selected = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;

    const closeOnOutside = (event: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", closeOnOutside);
    document.addEventListener("touchstart", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutside);
      document.removeEventListener("touchstart", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`select-wrap themed-select ${open ? "is-open" : ""}`}>
      <button
        type="button"
        className="input input-select themed-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {selected.label}
      </button>

      {open ? (
        <div className="themed-select-menu" role="listbox">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className="themed-select-option"
              role="option"
              aria-selected={option.value === value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              <span className="themed-select-check">{option.value === value ? "✓" : ""}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function InfoBlock({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <div className="text-[14px] font-semibold tracking-[0.24em] text-[#1f1f1f]">{title}</div>
      <div className="mt-3 whitespace-pre-line text-[15px] font-medium leading-[1.7] text-[#1f1f1f] sm:text-[15px]">
        {body}
      </div>
    </div>
  );
}

function LineItem({ left, right }: { left: string; right: string }) {
  return (
    <div className="flex items-center justify-between text-[13px]">
      <div className="font-semibold text-[#10354d]">{left}</div>
      <div className="opacity-90">{right}</div>
    </div>
  );
}

function SmallCount({ num, label }: { num: number; label: string }) {
  return (
    <div className="text-center">
      <div className="text-[30px] font-serif text-[#1f1f1f]">{num}</div>
      <div className="text-[11px] text-[#1f1f1f]">{label}</div>
    </div>
  );
}

function CountdownBox({ targetISO }: { targetISO: string }) {
  const [time, setTime] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const target = new Date(targetISO).getTime();

    const tick = () => {
      const now = Date.now();
      let diff = Math.max(0, target - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      diff -= days * 1000 * 60 * 60 * 24;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      diff -= hours * 1000 * 60 * 60;
      const mins = Math.floor(diff / (1000 * 60));
      diff -= mins * 1000 * 60;
      const secs = Math.floor(diff / 1000);

      setTime({ days, hours, mins, secs });
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetISO]);

  return (
    <div className="grid grid-cols-4 gap-6 text-center">
      <div>
        <div className="text-[16px] text-[#1f1f1f]">{time.days}</div>
        <div className="text-[10px] text-[#1f1f1f]">Hari</div>
      </div>
      <div>
        <div className="text-[16px] text-[#1f1f1f]">{time.hours}</div>
        <div className="text-[10px] text-[#1f1f1f]">Jam</div>
      </div>
      <div>
        <div className="text-[16px] text-[#1f1f1f]">{time.mins}</div>
        <div className="text-[10px] text-[#1f1f1f]">Minit</div>
      </div>
      <div>
        <div className="text-[16px] text-[#1f1f1f]">{time.secs}</div>
        <div className="text-[10px] text-[#1f1f1f]">Saat</div>
      </div>
    </div>
  );
}

function BottomBar({
  phone,
  videoUrl,
  onCall,
  onLocation,
}: {
  phone: string;
  videoUrl: string;
  onCall?: () => void;
  onLocation?: () => void;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#10354d]/10 bg-[#eef5f8]/92 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto flex max-w-[420px] items-center justify-around px-8 py-2 text-[#10354d]">
        <button onClick={onCall} aria-label="Call" className="flex flex-col items-center gap-1 opacity-90">
          <IconPhone />
          <span className="text-[10px] tracking-[0.08em]">Hubungi</span>
        </button>
        <button onClick={onLocation} aria-label="Location" className="flex flex-col items-center gap-1 opacity-90">
          <IconPin />
          <span className="text-[10px] tracking-[0.08em]">Lokasi</span>
        </button>
        <a
          href="#rsvpBox"
          aria-label="RSVP"
          className="flex flex-col items-center gap-1 opacity-90"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById("rsvpBox")?.scrollIntoView({ behavior: "smooth", block: "center" });
          }}
        >
          <IconRSVP />
          <span className="text-[10px] tracking-[0.08em]">Ucapan</span>
        </a>
      </div>
    </div>
  );
}

function LocationPrompt({
  wazeUrl,
  googleMapUrl,
  onClose,
}: {
  wazeUrl: string;
  googleMapUrl: string;
  onClose: () => void;
}) {
  const openWaze = () => {
    window.open(wazeUrl, "_blank", "noopener,noreferrer");
    onClose();
  };

  const openGoogleMap = () => {
    window.open(googleMapUrl, "_blank", "noopener,noreferrer");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-6">
      <div className="w-full max-w-[360px] rounded-2xl bg-white p-5 text-center shadow-xl">
        <div className="text-sm text-black/60">Pilih aplikasi lokasi</div>
        <div className="mt-4 grid gap-3">
          <button
            onClick={openWaze}
            className="w-full rounded-xl border border-[#10354d]/40 px-4 py-3 text-sm text-[#10354d]"
          >
            Buka Waze
          </button>
          <button
            onClick={openGoogleMap}
            className="w-full rounded-xl border border-[#10354d]/40 px-4 py-3 text-sm text-[#10354d]"
          >
            Buka Google Maps
          </button>
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full rounded-xl bg-[#dbe8ee] py-2 text-sm text-[#10354d]"
        >
          Batal
        </button>
      </div>
    </div>
  );
}

function CallPrompt({
  options,
  onClose,
}: {
  options: Array<{ name: string; phone: string }>;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-6">
      <div className="w-full max-w-[360px] rounded-2xl bg-white p-5 text-center shadow-xl">
        <div className="text-sm text-black/60">Pilih untuk hubungi</div>
        <div className="mt-4 grid gap-3">
          {options.map((opt) => (
            <div
              key={opt.phone}
              className="flex items-center justify-between rounded-xl border border-[#10354d]/40 px-4 py-3 text-sm text-[#10354d]"
            >
              <div className="text-left font-medium">{opt.name}</div>
              <div className="flex items-center gap-3">
                <a
                  href={`tel:${opt.phone}`}
                  aria-label={`Call ${opt.name}`}
                  className="rounded-full border border-[#10354d]/40 p-2 text-[#10354d]"
                >
                  <IconPhone />
                </a>
                <a
                  href={`https://wa.me/6${opt.phone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`WhatsApp ${opt.name}`}
                  className="rounded-full border border-[#10354d]/40 p-2 text-[#10354d]"
                >
                  <IconWhatsApp />
                </a>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full rounded-xl bg-[#dbe8ee] py-2 text-sm text-[#10354d]"
        >
          Batal
        </button>
      </div>
    </div>
  );
}

function CalendarPrompt({
  wedding,
  onClose,
}: {
  wedding: {
    groom: string;
    bride: string;
    venue: string;
    dateText: string;
    time: string;
    dateISO: string;
    startTime: string;
    endTime: string;
    timezone: string;
  };
  onClose: () => void;
}) {
  const title = `${wedding.bride} & ${wedding.groom} Wedding`;
  const details = `Majlis perkahwinan ${wedding.bride} & ${wedding.groom}`;

  const toDateTime = (dateISO: string, time: string) => {
    const dt = new Date(`${dateISO}T${time}:00+08:00`);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${dt.getUTCFullYear()}${pad(dt.getUTCMonth() + 1)}${pad(dt.getUTCDate())}T${pad(
      dt.getUTCHours()
    )}${pad(dt.getUTCMinutes())}00Z`;
  };

  const start = toDateTime(wedding.dateISO, wedding.startTime);
  const end = toDateTime(wedding.dateISO, wedding.endTime);

  const googleUrl =
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    `&text=${encodeURIComponent(title)}` +
    `&dates=${start}/${end}` +
    `&details=${encodeURIComponent(details)}` +
    `&location=${encodeURIComponent(wedding.venue)}` +
    `&ctz=${encodeURIComponent(wedding.timezone)}`;

  const downloadIcs = () => {
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//kad-kahwin//invite//EN",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${details}`,
      `LOCATION:${wedding.venue}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wedding.ics";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/30 p-4">
      <div className="w-full max-w-[420px] rounded-2xl bg-white p-5 text-center shadow-xl">
        <div className="text-sm text-black/60">Simpan Tarikh</div>
        <div className="mt-2 text-[13px] text-black/70">
          {wedding.dateText}
          <br />
          {wedding.time}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            onClick={downloadIcs}
            className="rounded-xl border border-[#10354d]/40 px-4 py-3 text-sm text-[#10354d]"
          >
            Apple Calendar
          </button>
          <a
            href={googleUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-[#10354d]/40 px-4 py-3 text-sm text-[#10354d]"
          >
            Google Calendar
          </a>
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full rounded-xl bg-[#dbe8ee] py-2 text-sm text-[#10354d]"
        >
          Batal
        </button>
      </div>
    </div>
  );
}

function ThanksPrompt({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-6">
      <div className="w-full max-w-[340px] rounded-2xl bg-white p-6 text-center shadow-xl">
        <div className="text-[16px] font-semibold text-[#10354d]">Terima Kasih!</div>
        <div className="mt-2 text-sm text-black/60">RSVP anda telah diterima.</div>
        <button
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-[#dbe8ee] py-2 text-sm text-[#10354d]"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}

function WishPrompt({
  name,
  text,
  onChangeName,
  onChangeText,
  onClose,
  onSubmit,
}: {
  name: string;
  text: string;
  onChangeName: (v: string) => void;
  onChangeText: (v: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-6">
      <div className="w-full max-w-[380px] rounded-2xl bg-white p-6 text-left shadow-xl">
        <div className="text-center text-[14px] font-semibold text-[#10354d]">Tulis Ucapan</div>
        <div className="mt-4 grid gap-3">
          <input
            className="input"
            placeholder="Nama"
            value={name}
            onChange={(e) => onChangeName(e.target.value)}
          />
          <textarea
            className="input min-h-[90px] resize-none"
            placeholder="Ucapan"
            value={text}
            onChange={(e) => onChangeText(e.target.value)}
          />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-[#10354d]/40 px-4 py-2 text-sm text-[#10354d]"
          >
            Batal
          </button>
          <button
            onClick={onSubmit}
            className="rounded-xl bg-[#10354d] px-4 py-2 text-sm text-white"
          >
            Hantar
          </button>
        </div>
      </div>
    </div>
  );
}

function FloatingDots() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {Array.from({ length: 18 }).map((_, i) => (
        <span
          key={i}
          className="dot"
          style={{
            left: `${(i * 37) % 100}%`,
            animationDelay: `${i * 0.6}s`,
            animationDuration: `${10 + (i % 7)}s`,
            opacity: 0.08 + (i % 5) * 0.03,
          }}
        />
      ))}

      <style jsx>{`
        .dot {
          position: absolute;
          bottom: -20px;
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: #9ab3c0;
          animation: floatUp linear infinite;
          filter: blur(0.2px);
        }
        @keyframes floatUp {
          from {
            transform: translateY(0) translateX(0);
          }
          to {
            transform: translateY(-120vh) translateX(20px);
          }
        }
      `}</style>
    </div>
  );
}

/* ============================= OPENING ============================= */

function OpeningEnvelope({
  groom,
  bride,
  dateText,
  floralFrame,
  onOpen,
}: {
  groom: string;
  bride: string;
  dateText: string;
  floralFrame: string;
  onOpen: () => void;
}) {
  const [anim, setAnim] = useState(false);
  const formatScriptName = (value: string) =>
    value
      .toLowerCase()
      .split(" ")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

  const open = () => {
    if (anim) return;
    setAnim(true);
    setTimeout(() => onOpen(), 520);
  };

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden transition-opacity duration-500 ${anim ? "opacity-0" : "opacity-100"}`}
      style={{
        backgroundImage: `url("${floralFrame}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-[rgba(251,251,248,0.82)]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[420px] flex-col items-center justify-center px-8 text-center">
        <div className="text-[11px] font-semibold tracking-[0.08em] text-[#4f5f5a]/92 sm:text-[13px]">WALIMATULURUS</div>
        <div className="relative mt-8 flex h-[290px] w-[290px] items-center justify-center sm:h-[360px] sm:w-[360px]">
          <img
            src="/theme/toppng.com-white-flower-frame-1844x1865.png"
            alt="Floral ring"
            className="pointer-events-none absolute inset-0 h-full w-full object-contain"
          />
          <div className="relative z-10 flex flex-col items-center justify-center text-[#4f5f5a]">
            <div className="font-parisienne text-[30px] leading-[1.02] text-[#2f2a28] sm:text-[46px]">
              {formatScriptName(groom)}
            </div>
            <div className="mt-2 font-parisienne text-[34px] leading-none text-[#2f2a28] sm:text-[50px]">&amp;</div>
            <div className="mt-2 font-parisienne text-[30px] leading-[1.02] text-[#2f2a28] sm:text-[46px]">
              {formatScriptName(bride)}
            </div>
          </div>
        </div>
        <div className="mt-1 text-[11px] tracking-[0.22em] text-[#52615d]/72 sm:text-[13px] sm:tracking-[0.26em]">{dateText}</div>

        <button onClick={open} className="open-pill mt-10">
          BUKA
        </button>
      </div>

      <style jsx>{`
        .open-pill {
          border-radius: 999px;
          background: linear-gradient(135deg, #174965, #09283d);
          color: white;
          border: none;
          padding: 10px 24px;
          min-width: 128px;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.04em;
          box-shadow: 0 12px 24px rgba(9, 40, 61, 0.28);
        }
        @media (min-width: 640px) {
          .open-pill {
            padding: 12px 34px;
            min-width: 150px;
            font-size: 18px;
          }
        }
        .open-pill:active {
          transform: translateY(1px) scale(0.99);
        }
      `}</style>
    </div>
  );
}

/* ============================= ICONS ============================= */

function IconPhone() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path
        d="M6.5 3.5l3 1.5-1 3c1 2 3 4 5 5l3-1 1.5 3c.5 1-1 2.5-2 3-1 .5-5-.5-8.5-4S3 7.5 3.5 6.5c.5-1 2-2.5 3-3z"
        stroke="rgba(199,119,122,0.9)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconPlay() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="rgba(199,119,122,0.9)" strokeWidth="1.5" />
      <path d="M11 9l5 3-5 3V9z" fill="rgba(199,119,122,0.9)" />
    </svg>
  );
}
function IconPin() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 21s6-5 6-10a6 6 0 10-12 0c0 5 6 10 6 10z"
        stroke="rgba(199,119,122,0.9)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="11" r="2" stroke="rgba(199,119,122,0.9)" strokeWidth="1.5" />
    </svg>
  );
}
function IconWhatsApp() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M9.2 9.3c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.7 1.7c.1.2 0 .4-.1.6l-.3.4c-.1.1-.1.3 0 .5.3.5.8 1 1.3 1.4.2.1.4.2.5 0l.4-.3c.2-.1.4-.2.6-.1l1.7.7c.3.1.4.3.4.5v.5c0 .3 0 .5-.4.7-.4.2-1.2.5-2 .3-1-.2-2-.8-3-1.8s-1.6-2-1.8-3c-.2-.8.1-1.6.3-2z"
        stroke="rgba(199,119,122,0.9)"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="7.8" stroke="rgba(199,119,122,0.9)" strokeWidth="1.5" />
    </svg>
  );
}
function IconRSVP() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path d="M4 7h16v14H4V7z" stroke="rgba(199,119,122,0.9)" strokeWidth="1.5" />
      <path d="M8 3h8v4H8V3z" stroke="rgba(199,119,122,0.9)" strokeWidth="1.5" />
      <path d="M7 12h10" stroke="rgba(199,119,122,0.9)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7 16h6" stroke="rgba(199,119,122,0.9)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconVolume() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M4 10v4h4l5 4V6l-5 4H4z" fill="currentColor" />
      <path d="M16 8c1.5 1.5 1.5 6 0 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M18.5 6c2.5 2.5 2.5 9.5 0 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconMute() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M4 10v4h4l5 4V6l-5 4H4z" fill="currentColor" />
      <path d="M17 9l4 4m0-4l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
