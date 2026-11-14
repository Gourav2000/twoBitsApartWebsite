import { Fragment } from "react";

/**
 * Tiny Python highlighter: good enough for slides, no dependency.
 * Tokens: comments, strings, decorators, keywords, builtins, numbers.
 */
const KEYWORDS = new Set(
  "from import as def return if not else elif for in while async await raise class with try except None True False lambda and or is pass".split(
    " ",
  ),
);
const BUILTINS = new Set("int float str len range print bytes self".split(" "));

const TOKEN =
  /(#[^\n]*)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(@[\w.]+)|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_]\w*\b)/g;

function highlight(line: string) {
  const out: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  TOKEN.lastIndex = 0;
  let k = 0;
  while ((m = TOKEN.exec(line))) {
    if (m.index > last) out.push(line.slice(last, m.index));
    const [tok, comment, str, deco, num, word] = m;
    let cls = "";
    if (comment) cls = "text-faint italic";
    else if (str) cls = "text-[#c9a7ff]";
    else if (deco) cls = "text-amber";
    else if (num) cls = "text-[#7fd1ff]";
    else if (word && KEYWORDS.has(word)) cls = "text-blue font-semibold";
    else if (word && BUILTINS.has(word)) cls = "text-green";
    out.push(
      cls ? (
        <span key={k++} className={cls}>
          {tok}
        </span>
      ) : (
        tok
      ),
    );
    last = m.index + tok.length;
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
}

export function Code({
  code,
  className = "",
  filename,
  highlightLines = [],
}: {
  code: string;
  className?: string;
  filename?: string;
  highlightLines?: number[];
}) {
  const lines = code.replace(/^\n/, "").replace(/\s+$/, "").split("\n");
  return (
    <div className={`overflow-hidden rounded-2xl border border-border-strong bg-[#080b12] ${className}`}>
      {filename && (
        <div className="flex items-center gap-2 border-b border-border px-5 py-3">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          <span className="ml-3 font-mono text-[0.8em] text-muted">{filename}</span>
        </div>
      )}
      <pre className="overflow-x-auto px-5 py-4 font-mono leading-[1.55]">
        {lines.map((l, i) => (
          <Fragment key={i}>
            <span
              className={`block ${highlightLines.includes(i + 1) ? "-mx-5 border-l-4 border-purple bg-purple/10 px-4" : ""}`}
            >
              {highlight(l)}
              {l === "" ? " " : ""}
            </span>
          </Fragment>
        ))}
      </pre>
    </div>
  );
}
