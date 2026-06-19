/*
========================================
PATTERN LIST
========================================
* Builds the pattern selector (radio buttons grouped by category).
* Pure DOM construction — no state, no generators.
-----------------------------------------
*/

export function buildPatternList(container, registry, onSelect) {
   const byCategory = {};
   for (const pattern of registry) {
      (byCategory[pattern.category] ??= []).push(pattern);
   }

   for (const [category, patterns] of Object.entries(byCategory)) {
      const catLabel = document.createElement("div");
      catLabel.className   = "pattern-category-label";
      catLabel.textContent = category;
      container.appendChild(catLabel);

      for (const pattern of patterns) {
         const div = document.createElement("div");
         div.className = "form-check";

         const input = document.createElement("input");
         input.type      = "radio";
         input.className = "form-check-input";
         input.name      = "pattern";
         input.id        = `pat-${pattern.id}`;
         input.value     = pattern.id;
         if (pattern === registry[0]) input.checked = true;

         const label = document.createElement("label");
         label.className   = "form-check-label";
         label.htmlFor     = `pat-${pattern.id}`;
         label.textContent = pattern.name;

         input.addEventListener("change", () => onSelect(pattern));

         div.append(input, label);
         container.appendChild(div);
      }
   }
}
