import { useState } from "react";
import { GALLERY_PATTERNS } from "./galleryPatterns.js";
import { getMyGalleryItems, removeMyGalleryItem } from "./myGalleryStorage.js";
import "./GalleryOverlay.css";

/*
========================================
GALLERY OVERLAY
========================================
* Two tabs: Featured (hand-curated favourites, galleryPatterns.js) and My
* Gallery (session-only, saved via the Render node's "Add to Gallery"
* action — see myGalleryStorage.js). Purely presentational: titles and
* thumbnails are already resolved at data-creation time for both tiers, so
* this component never needs REGISTRY. onLoad receives the raw item -
* App.jsx normalises {overrides} (Featured) vs {params} (My Gallery) into
* the same load path.
*/

const TABS = [
   { id: "featured", label: "Featured" },
   { id: "mine", label: "My Gallery" },
];

export default function GalleryOverlay({ onClose, onLoad }) {
   const [tab, setTab] = useState("featured");
   const [myItems, setMyItems] = useState(() => getMyGalleryItems());

   function handleRemove(id) {
      removeMyGalleryItem(id);
      setMyItems(getMyGalleryItems());
   }

   return (
      <div className="gallery-overlay" role="dialog" aria-modal="true" onClick={onClose}>
         <div className="gallery-panel" onClick={(e) => e.stopPropagation()}>
            <button className="gallery-close" onClick={onClose} aria-label="Close Gallery">
               ×
            </button>
            <h2 className="gallery-title">Gallery</h2>

            <div className="gallery-tabs">
               {TABS.map((t) => (
                  <button
                     key={t.id}
                     className={`gallery-tab${tab === t.id ? " selected" : ""}`}
                     onClick={() => setTab(t.id)}
                  >
                     {t.label}
                  </button>
               ))}
            </div>

            <div className="gallery-body">
               {tab === "featured" &&
                  (GALLERY_PATTERNS.length === 0 ? (
                     <p className="gallery-empty">No featured patterns yet — check back soon.</p>
                  ) : (
                     <div className="gallery-grid">
                        {GALLERY_PATTERNS.map((item) => (
                           <div className="gallery-card" key={item.id}>
                              <img
                                 className="gallery-thumb"
                                 src={`${import.meta.env.BASE_URL}${item.thumbnail.replace(/^\//, "")}`}
                                 alt={item.title}
                              />
                              <div className="gallery-card-title">{item.title}</div>
                              {item.description && <div className="gallery-card-desc">{item.description}</div>}
                              <button className="btn gallery-load" onClick={() => onLoad(item)}>
                                 Load This Pattern
                              </button>
                           </div>
                        ))}
                     </div>
                  ))}

               {tab === "mine" &&
                  (myItems.length === 0 ? (
                     <p className="gallery-empty">
                        Nothing saved here yet this session. Select the Render node in the workflow and click{" "}
                        <strong>Add to Gallery</strong> to save your pattern here. Use Export SVG/PNG to download it.
                     </p>
                  ) : (
                     <div className="gallery-grid">
                        {myItems.map((item) => (
                           <div className="gallery-card" key={item.id}>
                              <button
                                 className="gallery-card-remove"
                                 onClick={() => handleRemove(item.id)}
                                 aria-label={`Remove ${item.title}`}
                                 title="Remove from My Gallery"
                              >
                                 ×
                              </button>
                              <img className="gallery-thumb" src={item.thumbnailDataUrl} alt={item.title} />
                              <div className="gallery-card-title">{item.title}</div>
                              <button className="btn gallery-load" onClick={() => onLoad(item)}>
                                 Load This Pattern
                              </button>
                           </div>
                        ))}
                     </div>
                  ))}
            </div>
         </div>
      </div>
   );
}
