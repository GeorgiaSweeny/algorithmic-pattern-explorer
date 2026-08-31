/*
========================================
MARKDOWN RENDERER
========================================
* Minimal Markdown -> JSX renderer, purpose-built for docs/nodes/*.md's
* subset of Markdown (headings, `---` rules, bullet lists, fenced code,
* inline code/bold/italic). Not a general-purpose parser.
*/

function renderInline(text, keyPrefix) {
   const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
   return parts.map((part, i) => {
      const key = `${keyPrefix}-${i}`;
      if (part.startsWith("`") && part.endsWith("`")) {
         return <code key={key}>{part.slice(1, -1)}</code>;
      }
      if (part.startsWith("**") && part.endsWith("**")) {
         return <strong key={key}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("*") && part.endsWith("*") && part.length > 1) {
         return <em key={key}>{part.slice(1, -1)}</em>;
      }
      return part;
   });
}

export function renderMarkdown(source) {
   const lines = source.replace(/\r\n/g, "\n").split("\n");
   const blocks = [];
   let i = 0;
   let listItems = null;

   function flushList() {
      if (listItems) {
         blocks.push(
            <ul key={`list-${blocks.length}`}>
               {listItems.map((item, idx) => (
                  <li key={idx}>{renderInline(item, `li-${blocks.length}-${idx}`)}</li>
               ))}
            </ul>
         );
         listItems = null;
      }
   }

   while (i < lines.length) {
      const line = lines[i];

      if (/^\s*$/.test(line)) {
         flushList();
         i += 1;
         continue;
      }

      if (/^---+\s*$/.test(line)) {
         flushList();
         blocks.push(<hr key={`hr-${blocks.length}`} />);
         i += 1;
         continue;
      }

      if (line.startsWith("```")) {
         flushList();
         const codeLines = [];
         i += 1;
         while (i < lines.length && !lines[i].startsWith("```")) {
            codeLines.push(lines[i]);
            i += 1;
         }
         i += 1; // skip closing fence
         blocks.push(
            <pre key={`code-${blocks.length}`}>
               <code>{codeLines.join("\n")}</code>
            </pre>
         );
         continue;
      }

      const heading = line.match(/^(#{1,4})\s+(.*)$/);
      if (heading) {
         flushList();
         const level = heading[1].length;
         const Tag = `h${Math.min(level + 1, 6)}`; // h1 reserved for the panel's own page title
         blocks.push(<Tag key={`h-${blocks.length}`}>{renderInline(heading[2], `h-${blocks.length}`)}</Tag>);
         i += 1;
         continue;
      }

      const bullet = line.match(/^\s*[*-]\s+(.*)$/);
      if (bullet) {
         if (!listItems) listItems = [];
         listItems.push(bullet[1]);
         i += 1;
         continue;
      }

      flushList();
      const paraLines = [line];
      i += 1;
      while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^---+\s*$/.test(lines[i]) && !/^#{1,4}\s/.test(lines[i]) && !/^\s*[*-]\s+/.test(lines[i]) && !lines[i].startsWith("```")) {
         paraLines.push(lines[i]);
         i += 1;
      }
      blocks.push(<p key={`p-${blocks.length}`}>{renderInline(paraLines.join(" "), `p-${blocks.length}`)}</p>);
   }

   flushList();
   return blocks;
}
