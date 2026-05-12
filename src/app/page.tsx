"use client";

import Link from "next/link";
import Container from "@/components/Container";
import { useT } from "@/lib/lang";

export default function HomePage() {
  const t = useT();
  return (
    <Container>
      <div className="animate-fade-in">
        <p className="mb-4 text-sm uppercase tracking-[0.2em] text-brand-400">
          {t("home_eyebrow")}
        </p>
        <h1 className="mb-6 font-serif text-4xl leading-tight text-ink sm:text-5xl">
          {t("home_title")}
        </h1>
        <p className="mb-10 max-w-prose text-lg leading-relaxed text-brand-700">
          {t("home_intro")}
        </p>

        <div className="card mb-8">
          <h2 className="mb-4 font-serif text-xl text-ink">
            {t("home_includes_title")}
          </h2>
          <p className="mb-4 text-sm leading-relaxed text-brand-700">
            <span className="font-medium text-ink">{t("home_core_label")}</span>
            {t("home_core_desc")}
          </p>
          <p className="mb-2 text-sm leading-relaxed text-brand-700">
            <span className="font-medium text-ink">
              {t("home_optional_label")}
            </span>
            {t("home_optional_desc")}
          </p>
          <ul className="ml-4 space-y-1 text-sm text-brand-600">
            <li>· {t("home_optional_list_a")}</li>
            <li>· {t("home_optional_list_b")}</li>
          </ul>
          <p className="mt-5 text-sm text-brand-500">
            {t("home_library_hint")}{" "}
            <Link href="/library/" className="text-sage-700 underline">
              {t("home_library_link")}
            </Link>
            。
          </p>
        </div>

        <div className="card mb-10 border-sage-200 bg-sage-50">
          <h2 className="mb-3 font-serif text-lg text-ink">
            {t("home_before_title")}
          </h2>
          <ul className="space-y-2 text-sm leading-relaxed text-brand-800">
            <li>· {t("home_before_li1")}</li>
            <li>· {t("home_before_li2")}</li>
            <li>· {t("home_before_li3")}</li>
            <li>· {t("home_before_li4")}</li>
          </ul>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/intake/" className="btn-primary">
            {t("home_start")}
          </Link>
          <Link href="/library/" className="btn-ghost">
            {t("home_library_btn")}
          </Link>
        </div>
      </div>

      <footer className="mt-20 border-t border-brand-200 pt-6 text-xs text-brand-400">
        {t("home_footer")}
      </footer>
    </Container>
  );
}
