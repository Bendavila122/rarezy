import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FAQS } from "@/lib/faqs";
import { Reveal } from "@/components/Reveal";

/** Reveals `text` one character at a time while `enabled`, resetting whenever `text` itself changes. */
function useTypewriter(text: string, enabled: boolean, speed: number) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(0);
  }, [text]);

  useEffect(() => {
    if (!enabled || count >= text.length) return;
    const id = setTimeout(() => setCount((c) => c + 1), speed);
    return () => clearTimeout(id);
  }, [enabled, count, text, speed]);

  return { display: text.slice(0, count), done: count >= text.length };
}

/**
 * No section title, no visible slideshow chrome — just a question typing
 * itself out as an iMessage-style outgoing bubble, then the answer typing
 * out as a reply underneath it. It still advances through every FAQ via the
 * prev/next arrows (it "is" a slide-through, it just doesn't announce
 * itself as one with a heading or a progress bar).
 */
export function FaqSection() {
  const [index, setIndex] = useState(0);
  const faq = FAQS[index]!;

  const q = useTypewriter(faq.q, true, 52);
  const a = useTypewriter(faq.a, q.done, 11);

  const go = (next: number) => setIndex((next + FAQS.length) % FAQS.length);

  // Once the answer finishes typing, move on to the next question by itself
  // after a beat — the arrows are just there for whoever doesn't want to wait.
  useEffect(() => {
    if (!a.done) return;
    const id = setTimeout(() => go(index + 1), 5200);
    return () => clearTimeout(id);
  }, [a.done, index]);

  return (
    <div className="relative z-10 mx-auto max-w-2xl px-6 py-16">
      <Reveal>
        <div className="min-h-[15rem]">
          <div
            className="ml-auto max-w-[80%] rounded-[1.1rem] rounded-br-md px-4 py-2.5"
            style={{ background: "#0B84FF" }}
          >
            <p className="text-[0.95rem] font-medium leading-snug text-white">
              {q.display}
              {!q.done && <span className="animate-pulse">▌</span>}
            </p>
          </div>

          {q.done && (
            <div
              className="mr-auto mt-2.5 max-w-[85%] rounded-[1.1rem] rounded-bl-md px-4 py-2.5"
              style={{ background: "#3B3B3D" }}
            >
              <p className="text-[0.88rem] leading-relaxed text-white">
                {a.display}
                {!a.done && <span className="animate-pulse">▌</span>}
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous question"
            className="press flex h-9 w-9 items-center justify-center bg-white/10 text-white"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2.2} />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next question"
            className="press flex h-9 w-9 items-center justify-center bg-white/10 text-white"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={2.2} />
          </button>
        </div>

        <p className="mt-4 text-center text-[0.78rem]">
          <Link to="/help" className="text-brand underline underline-offset-4">
            Visit the help centre
          </Link>
        </p>
      </Reveal>
    </div>
  );
}
