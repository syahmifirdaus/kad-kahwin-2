"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type RsvpRow = {
  id?: number;
  name: string | null;
  pax: number | null;
  attending: string | null;
  note: string | null;
  created_at?: string | null;
};

export default function RsvpListPage() {
  const [rows, setRows] = useState<RsvpRow[]>([]);
  const [status, setStatus] = useState("Loading...");

  async function loadRows() {
    try {
      const { data, error } = await supabase
        .from("rsvp")
        .select("id,name,pax,attending,note,created_at")
        .order("created_at", { ascending: false });

      if (error) {
        setStatus(`Error: ${error.message}`);
        return;
      }

      setRows(data || []);
      setStatus("");
    } catch {
      setStatus("Network error");
    }
  }

  useEffect(() => {
    loadRows();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("rsvp-list")
      .on("postgres_changes", { event: "*", schema: "public", table: "rsvp" }, () => {
        loadRows();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#f4efe8] px-6 py-10 text-[#4a3e3a]">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold">RSVP List</h1>
        <p className="mt-2 text-sm text-black/60">Auto refresh on new submissions.</p>

        {status ? <div className="mt-4 text-sm">{status}</div> : null}

        <div className="mt-6 overflow-x-auto rounded-xl border border-black/10 bg-white/80">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/5 text-xs uppercase tracking-wider text-black/60">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Pax</th>
                <th className="px-4 py-3">Attending</th>
                <th className="px-4 py-3">Note</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id ?? `${r.name}-${r.created_at}`} className="border-t border-black/5">
                  <td className="px-4 py-3">{r.name || "-"}</td>
                  <td className="px-4 py-3">{r.pax ?? "-"}</td>
                  <td className="px-4 py-3">{r.attending || "-"}</td>
                  <td className="px-4 py-3">{r.note || "-"}</td>
                  <td className="px-4 py-3">{r.created_at ? new Date(r.created_at).toLocaleString() : "-"}</td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-black/50" colSpan={5}>
                    No RSVPs yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
