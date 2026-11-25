import { Fragment } from "react";
import { CopyCodeButton } from "./CopyCodeButton";

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

/** JSON can't have # comments, so annotated JSON uses "  // ..." at the end of a line. */
function highlightJson(line: string) {
  const at = line.search(/\s\/\/ /);
  if (at === -1) return highlight(line);
  return [
    ...highlight(line.slice(0, at + 1)),
    <span key="c" className="text-faint italic">
      {line.slice(at + 1)}
    </span>,
  ];
}

/** HTML with inline CSS and JavaScript: comment lines, tags, strings and a few JS keywords. */
const HTML_TOKEN = /("(?:[^"\\]|\\.)*")|(<\/?[A-Za-z!][\w-]*|\/?>)|(\b(?:const|let|async|await|return|if|new)\b)/g;

function highlightHtml(line: string) {
  const t = line.trim();
  if (t.startsWith("<!--") || t.startsWith("//") || t.startsWith("/*")) {
    return [
      <span key="c" className="text-faint italic">
        {line}
      </span>,
    ];
  }
  const out: React.ReactNode[] = [];
  let last = 0;
  let k = 0;
  let m: RegExpExecArray | null;
  HTML_TOKEN.lastIndex = 0;
  while ((m = HTML_TOKEN.exec(line))) {
    if (m.index > last) out.push(line.slice(last, m.index));
    const [tok, str, tag] = m;
    const cls = str ? "text-[#c9a7ff]" : tag ? "text-blue" : "text-blue font-semibold";
    out.push(
      <span key={k++} className={cls}>
        {tok}
      </span>,
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
  lang = "python",
  copy = true,
}: {
  code: string;
  className?: string;
  filename?: string;
  highlightLines?: number[];
  /** python (default) and shell use "#" comments; json and html use "//", "<!--" and CSS-style comments; text has no colours */
  lang?: "python" | "shell" | "json" | "html" | "text";
  /** show a Copy button (default on) */
  copy?: boolean;
}) {
  const text = code.replace(/^\n/, "").replace(/\s+$/, "");
  const lines = text.split("\n");
  // what the Copy button copies: the code exactly as shown, minus any "$ " shell prompt
  const copyText = text.replace(/^\$ /gm, "");
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-border-strong bg-[#080b12] ${className}`}>
      {filename && (
        <div className="flex items-center gap-2 border-b border-border px-5 py-3">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          <span className="ml-3 font-mono text-[0.8em] text-muted">{filename}</span>
          {copy && <CopyCodeButton text={copyText} className="ml-auto" />}
        </div>
      )}
      {copy && !filename && <CopyCodeButton text={copyText} className="absolute top-2.5 right-2.5 z-10" />}
      <pre className={`overflow-x-auto px-5 py-4 font-mono leading-[1.55] ${copy && !filename ? "pr-12" : ""}`}>
        {lines.map((l, i) => (
          <Fragment key={i}>
            <span
              className={`block ${highlightLines.includes(i + 1) ? "-mx-5 border-l-4 border-purple bg-purple/10 px-4" : ""}`}
            >
              {lang === "json" ? highlightJson(l) : lang === "html" ? highlightHtml(l) : lang === "text" ? l : highlight(l)}
              {l === "" ? " " : ""}
            </span>
          </Fragment>
        ))}
      </pre>
    </div>
  );
}
