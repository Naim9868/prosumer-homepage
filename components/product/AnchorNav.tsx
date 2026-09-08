"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function AnchorNav({ sections }: { sections: Array<{ id: string; label: string }> }) {
  const [navHidden, setNavHidden] = useState(false);
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");
  const lastScrollY = useRef(0);
  const sectionsRef = useRef(sections);
  sectionsRef.current = sections;

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const hidden = y > lastScrollY.current && y > 100;
        setNavHidden((prev) => (prev === hidden ? prev : hidden));
        lastScrollY.current = y;
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sectionsRef.current.forEach((section) => {
      const el = document.getElementById(section.id);
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              setActiveId((prev) => (prev === section.id ? prev : section.id));
              break;
            }
          }
        },
        { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  if (sections.length < 2) return null;

  return (
    <nav
      aria-label="Product page sections"
      className={cn(
        "sticky z-10 flex justify-center align-center gap-6 overflow-x-auto rounded-[50px] border-b border-[color:var(--titanium-900)] bg-white px-1 py-2 backdrop-blur-sm transition-[top] duration-300",
        navHidden ? "top-0" : "top-[72px]"
      )}
    >
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          onClick={(e) => {
            e.preventDefault();
            document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth" });
          }}
          className={cn(
            "whitespace-nowrap rounded-full px-4 py-1.5 text-sm transition-all duration-300",
            activeId === section.id
              ? "bg-[color:var(--brass-500)] text-primary font-semibold"
              : "text-black hover:text-[color:var(--brass-500)]"
          )}
        >
          {section.label}
        </a>
      ))}
    </nav>
  );
}
