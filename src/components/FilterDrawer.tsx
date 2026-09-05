import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, ChevronLeft, X } from "lucide-react";
import { categoryOf, CONDITIONS, MOVEMENT_TYPES, movementType, type Condition } from "@/lib/marketplace";
import type { CompetitionListing } from "@/lib/store";
import { activeFilterCount, EMPTY_FILTERS, facetCounts, toggleValue, type WatchFilters } from "@/lib/filters";

export const CATEGORY_LABELS: Record<string, string> = {
  watch: "Watches",
  car: "Cars",
  handbag: "Handbags",
  cash: "Cash prizes",
  clothing: "Clothing",
  electronics: "Electronics",
  jewellery: "Jewellery",
};

const DEFAULT_OPEN = new Set(["brand", "price"]);

function Section({
  id,
  title,
  count,
  open,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  count?: number;
  open: boolean;
  onToggle: (id: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="border-b border-white/[0.08] py-4">
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="press flex w-full items-center justify-between text-left"
      >
        <span className="flex items-center gap-1.5 text-[0.85rem] font-medium tracking-tight">
          {title}
          {count ? <span className="tabular text-[0.72rem] font-normal text-brand">{count}</span> : null}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          strokeWidth={2}
        />
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

function CheckRow({
  label,
  hint,
  checked,
  onClick,
}: {
  label: string;
  hint?: number;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="press flex w-full items-center justify-between gap-2 py-1.5 text-left"
    >
      <span className="flex items-center gap-2.5">
        <span
          className={`flex h-[1.05rem] w-[1.05rem] shrink-0 items-center justify-center rounded-none border transition-colors ${
            checked ? "border-brand bg-brand" : "border-white/15 bg-transparent"
          }`}
        >
          {checked && (
            <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 fill-none stroke-white" strokeWidth={2.4}>
              <path d="M2 6l2.5 2.5L10 3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        <span className="text-[0.82rem] tracking-tight text-foreground">{label}</span>
      </span>
      {hint !== undefined && <span className="tabular text-[0.72rem] text-muted">{hint}</span>}
    </button>
  );
}

/** An image tile for picking a category — a real product photo from a live listing, not a text row, so the choice reads visually rather than as a plain list. */
function CategoryTile({
  label,
  count,
  photo,
  onClick,
}: {
  label: string;
  count: number;
  photo?: string | undefined;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="press group relative aspect-[4/3] overflow-hidden rounded-none border border-white/[0.08] bg-white/[0.05] text-left"
    >
      {photo && (
        <img
          src={photo}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-active:scale-105"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
        <span className="text-[0.85rem] font-semibold leading-tight tracking-tight text-white">{label}</span>
        <span className="tabular shrink-0 text-[0.68rem] text-white/70">{count}</span>
      </div>
    </button>
  );
}

function RangeRow({
  unit,
  min,
  max,
  onMin,
  onMax,
  placeholderMin,
  placeholderMax,
}: {
  unit?: string;
  min: string;
  max: string;
  onMin: (v: string) => void;
  onMax: (v: string) => void;
  placeholderMin: string;
  placeholderMax: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        {unit && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[0.78rem] text-muted">
            {unit}
          </span>
        )}
        <input
          type="number"
          inputMode="numeric"
          value={min}
          onChange={(e) => onMin(e.target.value)}
          placeholder={placeholderMin}
          className={`w-full rounded-none bg-white/[0.05] py-2 text-[0.8rem] outline-none placeholder:text-muted/70 focus:bg-white/[0.09] ${unit ? "pl-7 pr-2" : "px-3"}`}
        />
      </div>
      <span className="text-[0.72rem] text-muted">to</span>
      <div className="relative flex-1">
        {unit && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[0.78rem] text-muted">
            {unit}
          </span>
        )}
        <input
          type="number"
          inputMode="numeric"
          value={max}
          onChange={(e) => onMax(e.target.value)}
          placeholder={placeholderMax}
          className={`w-full rounded-none bg-white/[0.05] py-2 text-[0.8rem] outline-none placeholder:text-muted/70 focus:bg-white/[0.09] ${unit ? "pl-7 pr-2" : "px-3"}`}
        />
      </div>
    </div>
  );
}

/**
 * Staged filtering: with no category chosen, the drawer shows nothing but
 * the category picker (a full-width row per category, with a live count).
 * Picking one narrows to that category (single-select — picking a
 * different one replaces it) and reveals the filters relevant to it: the
 * shared set (brand, ticket price, value, condition, year, delivery &
 * timing) plus watch-only technical fields (movement, case material,
 * diameter, bracelet, dial) when the category is "watch".
 */
export function FilterDrawer({
  open,
  onClose,
  filters,
  onChange,
  listings,
  resultCount,
}: {
  open: boolean;
  onClose: () => void;
  filters: WatchFilters;
  onChange: (next: WatchFilters) => void;
  listings: CompetitionListing[];
  resultCount: number;
}) {
  const [openSections, setOpenSections] = useState(DEFAULT_OPEN);
  const toggleSection = (id: string) =>
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

  const patch = (p: Partial<WatchFilters>) => onChange({ ...filters, ...p });

  const selectedCategory = filters.categories[0];
  const categoryFacets = facetCounts(listings, (c) => categoryOf(c.item));

  // Brand/movement/case/etc. facets are scoped to the chosen category once
  // picked, so e.g. car brands never show up in a watch brand list.
  const categoryListings = selectedCategory
    ? listings.filter((c) => categoryOf(c.item) === selectedCategory)
    : listings;
  const brandFacets = facetCounts(categoryListings, (c) => c.item.brand);
  const caseMaterialFacets = facetCounts(categoryListings, (c) => c.item.caseMaterial);
  const braceletFacets = facetCounts(categoryListings, (c) => c.item.braceletMaterial);
  const dialFacets = facetCounts(categoryListings, (c) => c.item.dialColor);
  const movementFacets = MOVEMENT_TYPES.map((m) => ({
    value: m,
    count: categoryListings.filter((c) => movementType(c.item.movement) === m).length,
  })).filter((f) => f.count > 0);

  const colorFacets = facetCounts(categoryListings, (c) => c.item.color);
  const materialFacets = facetCounts(categoryListings, (c) => c.item.material);
  const sizeFacets = facetCounts(categoryListings, (c) => c.item.size);
  const hardwareFacets = facetCounts(categoryListings, (c) => c.item.hardware);
  const gemstoneFacets = facetCounts(categoryListings, (c) => c.item.gemstone);
  const fuelTypeFacets = facetCounts(categoryListings, (c) => c.item.fuelType);
  const transmissionFacets = facetCounts(categoryListings, (c) => c.item.transmission);
  const bodyTypeFacets = facetCounts(categoryListings, (c) => c.item.bodyType);
  const storageFacets = facetCounts(categoryListings, (c) => c.item.storageCapacity);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 right-0 z-50 flex w-[88vw] max-w-sm flex-col bg-background shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
              <h2 className="text-[1rem] font-semibold tracking-tight">
                {selectedCategory ? CATEGORY_LABELS[selectedCategory] ?? "Filters" : "Filters"}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close filters"
                className="press flex h-8 w-8 items-center justify-center rounded-none bg-white/[0.06]"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5">
              {!selectedCategory ? (
                <div className="pt-2">
                  <p className="pb-3 text-[0.72rem] uppercase tracking-[0.16em] text-muted">Choose a category</p>
                  <div className="grid grid-cols-2 gap-3">
                    {categoryFacets.map((f) => (
                      <CategoryTile
                        key={f.value}
                        label={CATEGORY_LABELS[f.value] ?? f.value}
                        count={f.count}
                        photo={listings.find((c) => categoryOf(c.item) === f.value && c.item.photos?.[0])?.item.photos?.[0]}
                        onClick={() => patch({ categories: [f.value] })}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => onChange(EMPTY_FILTERS)}
                    className="press mb-1 mt-3 flex items-center gap-1 py-1 text-[0.78rem] font-medium text-brand"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2.4} />
                    Change category
                  </button>

                  <Section
                    id="brand"
                    title="Brand"
                    count={filters.brands.length}
                    open={openSections.has("brand")}
                    onToggle={toggleSection}
                  >
                    {brandFacets.map((f) => (
                      <CheckRow
                        key={f.value}
                        label={f.value}
                        hint={f.count}
                        checked={filters.brands.includes(f.value)}
                        onClick={() => patch({ brands: toggleValue(filters.brands, f.value) })}
                      />
                    ))}
                  </Section>

                  <Section
                    id="price"
                    title="Ticket price"
                    count={(filters.priceMin ? 1 : 0) + (filters.priceMax ? 1 : 0)}
                    open={openSections.has("price")}
                    onToggle={toggleSection}
                  >
                    <RangeRow
                      unit="£"
                      min={filters.priceMin}
                      max={filters.priceMax}
                      onMin={(v) => patch({ priceMin: v })}
                      onMax={(v) => patch({ priceMax: v })}
                      placeholderMin="Min"
                      placeholderMax="Max"
                    />
                  </Section>

                  <Section
                    id="value"
                    title="Value"
                    count={(filters.valueMin ? 1 : 0) + (filters.valueMax ? 1 : 0)}
                    open={openSections.has("value")}
                    onToggle={toggleSection}
                  >
                    <RangeRow
                      unit="£"
                      min={filters.valueMin}
                      max={filters.valueMax}
                      onMin={(v) => patch({ valueMin: v })}
                      onMax={(v) => patch({ valueMax: v })}
                      placeholderMin="Min"
                      placeholderMax="Max"
                    />
                  </Section>

                  <Section
                    id="condition"
                    title="Condition"
                    count={filters.conditions.length}
                    open={openSections.has("condition")}
                    onToggle={toggleSection}
                  >
                    {CONDITIONS.map((c) => (
                      <CheckRow
                        key={c.id}
                        label={c.label}
                        checked={filters.conditions.includes(c.id)}
                        onClick={() => patch({ conditions: toggleValue<Condition>(filters.conditions, c.id) })}
                      />
                    ))}
                  </Section>

                  <Section
                    id="year"
                    title="Year of production"
                    count={(filters.yearMin ? 1 : 0) + (filters.yearMax ? 1 : 0)}
                    open={openSections.has("year")}
                    onToggle={toggleSection}
                  >
                    <RangeRow
                      min={filters.yearMin}
                      max={filters.yearMax}
                      onMin={(v) => patch({ yearMin: v })}
                      onMax={(v) => patch({ yearMax: v })}
                      placeholderMin="From"
                      placeholderMax="To"
                    />
                  </Section>

                  {selectedCategory === "watch" && (
                    <>
                      <Section
                        id="movement"
                        title="Movement"
                        count={filters.movements.length}
                        open={openSections.has("movement")}
                        onToggle={toggleSection}
                      >
                        {movementFacets.map((f) => (
                          <CheckRow
                            key={f.value}
                            label={f.value}
                            hint={f.count}
                            checked={filters.movements.includes(f.value)}
                            onClick={() => patch({ movements: toggleValue(filters.movements, f.value) })}
                          />
                        ))}
                      </Section>

                      <Section
                        id="case-material"
                        title="Case material"
                        count={filters.caseMaterials.length}
                        open={openSections.has("case-material")}
                        onToggle={toggleSection}
                      >
                        {caseMaterialFacets.map((f) => (
                          <CheckRow
                            key={f.value}
                            label={f.value}
                            hint={f.count}
                            checked={filters.caseMaterials.includes(f.value)}
                            onClick={() => patch({ caseMaterials: toggleValue(filters.caseMaterials, f.value) })}
                          />
                        ))}
                      </Section>

                      <Section
                        id="diameter"
                        title="Case diameter"
                        count={(filters.diameterMin ? 1 : 0) + (filters.diameterMax ? 1 : 0)}
                        open={openSections.has("diameter")}
                        onToggle={toggleSection}
                      >
                        <RangeRow
                          unit="mm"
                          min={filters.diameterMin}
                          max={filters.diameterMax}
                          onMin={(v) => patch({ diameterMin: v })}
                          onMax={(v) => patch({ diameterMax: v })}
                          placeholderMin="Min"
                          placeholderMax="Max"
                        />
                      </Section>

                      <Section
                        id="bracelet"
                        title="Bracelet / strap"
                        count={filters.braceletMaterials.length}
                        open={openSections.has("bracelet")}
                        onToggle={toggleSection}
                      >
                        {braceletFacets.map((f) => (
                          <CheckRow
                            key={f.value}
                            label={f.value}
                            hint={f.count}
                            checked={filters.braceletMaterials.includes(f.value)}
                            onClick={() => patch({ braceletMaterials: toggleValue(filters.braceletMaterials, f.value) })}
                          />
                        ))}
                      </Section>

                      <Section
                        id="dial"
                        title="Dial colour"
                        count={filters.dialColors.length}
                        open={openSections.has("dial")}
                        onToggle={toggleSection}
                      >
                        {dialFacets.map((f) => (
                          <CheckRow
                            key={f.value}
                            label={f.value}
                            hint={f.count}
                            checked={filters.dialColors.includes(f.value)}
                            onClick={() => patch({ dialColors: toggleValue(filters.dialColors, f.value) })}
                          />
                        ))}
                      </Section>
                    </>
                  )}

                  {selectedCategory === "car" && (
                    <>
                      <Section
                        id="fuel"
                        title="Fuel type"
                        count={filters.fuelTypes.length}
                        open={openSections.has("fuel")}
                        onToggle={toggleSection}
                      >
                        {fuelTypeFacets.map((f) => (
                          <CheckRow
                            key={f.value}
                            label={f.value}
                            hint={f.count}
                            checked={filters.fuelTypes.includes(f.value)}
                            onClick={() => patch({ fuelTypes: toggleValue(filters.fuelTypes, f.value) })}
                          />
                        ))}
                      </Section>

                      <Section
                        id="transmission"
                        title="Transmission"
                        count={filters.transmissions.length}
                        open={openSections.has("transmission")}
                        onToggle={toggleSection}
                      >
                        {transmissionFacets.map((f) => (
                          <CheckRow
                            key={f.value}
                            label={f.value}
                            hint={f.count}
                            checked={filters.transmissions.includes(f.value)}
                            onClick={() => patch({ transmissions: toggleValue(filters.transmissions, f.value) })}
                          />
                        ))}
                      </Section>

                      <Section
                        id="body-type"
                        title="Body type"
                        count={filters.bodyTypes.length}
                        open={openSections.has("body-type")}
                        onToggle={toggleSection}
                      >
                        {bodyTypeFacets.map((f) => (
                          <CheckRow
                            key={f.value}
                            label={f.value}
                            hint={f.count}
                            checked={filters.bodyTypes.includes(f.value)}
                            onClick={() => patch({ bodyTypes: toggleValue(filters.bodyTypes, f.value) })}
                          />
                        ))}
                      </Section>

                      <Section
                        id="mileage"
                        title="Mileage"
                        count={(filters.mileageMin ? 1 : 0) + (filters.mileageMax ? 1 : 0)}
                        open={openSections.has("mileage")}
                        onToggle={toggleSection}
                      >
                        <RangeRow
                          min={filters.mileageMin}
                          max={filters.mileageMax}
                          onMin={(v) => patch({ mileageMin: v })}
                          onMax={(v) => patch({ mileageMax: v })}
                          placeholderMin="Min miles"
                          placeholderMax="Max miles"
                        />
                      </Section>
                    </>
                  )}

                  {(selectedCategory === "handbag" ||
                    selectedCategory === "clothing" ||
                    selectedCategory === "electronics") && (
                    <Section
                      id="colour"
                      title="Colour"
                      count={filters.colors.length}
                      open={openSections.has("colour")}
                      onToggle={toggleSection}
                    >
                      {colorFacets.map((f) => (
                        <CheckRow
                          key={f.value}
                          label={f.value}
                          hint={f.count}
                          checked={filters.colors.includes(f.value)}
                          onClick={() => patch({ colors: toggleValue(filters.colors, f.value) })}
                        />
                      ))}
                    </Section>
                  )}

                  {(selectedCategory === "handbag" ||
                    selectedCategory === "clothing" ||
                    selectedCategory === "jewellery") && (
                    <>
                      <Section
                        id="material"
                        title="Material"
                        count={filters.materials.length}
                        open={openSections.has("material")}
                        onToggle={toggleSection}
                      >
                        {materialFacets.map((f) => (
                          <CheckRow
                            key={f.value}
                            label={f.value}
                            hint={f.count}
                            checked={filters.materials.includes(f.value)}
                            onClick={() => patch({ materials: toggleValue(filters.materials, f.value) })}
                          />
                        ))}
                      </Section>

                      <Section
                        id="size"
                        title="Size"
                        count={filters.sizes.length}
                        open={openSections.has("size")}
                        onToggle={toggleSection}
                      >
                        {sizeFacets.map((f) => (
                          <CheckRow
                            key={f.value}
                            label={f.value}
                            hint={f.count}
                            checked={filters.sizes.includes(f.value)}
                            onClick={() => patch({ sizes: toggleValue(filters.sizes, f.value) })}
                          />
                        ))}
                      </Section>
                    </>
                  )}

                  {selectedCategory === "handbag" && (
                    <Section
                      id="hardware"
                      title="Hardware"
                      count={filters.hardware.length}
                      open={openSections.has("hardware")}
                      onToggle={toggleSection}
                    >
                      {hardwareFacets.map((f) => (
                        <CheckRow
                          key={f.value}
                          label={f.value}
                          hint={f.count}
                          checked={filters.hardware.includes(f.value)}
                          onClick={() => patch({ hardware: toggleValue(filters.hardware, f.value) })}
                        />
                      ))}
                    </Section>
                  )}

                  {selectedCategory === "jewellery" && (
                    <Section
                      id="gemstone"
                      title="Gemstone"
                      count={filters.gemstones.length}
                      open={openSections.has("gemstone")}
                      onToggle={toggleSection}
                    >
                      {gemstoneFacets.map((f) => (
                        <CheckRow
                          key={f.value}
                          label={f.value}
                          hint={f.count}
                          checked={filters.gemstones.includes(f.value)}
                          onClick={() => patch({ gemstones: toggleValue(filters.gemstones, f.value) })}
                        />
                      ))}
                    </Section>
                  )}

                  {selectedCategory === "electronics" && (
                    <Section
                      id="storage"
                      title="Storage capacity"
                      count={filters.storageCapacities.length}
                      open={openSections.has("storage")}
                      onToggle={toggleSection}
                    >
                      {storageFacets.map((f) => (
                        <CheckRow
                          key={f.value}
                          label={f.value}
                          hint={f.count}
                          checked={filters.storageCapacities.includes(f.value)}
                          onClick={() => patch({ storageCapacities: toggleValue(filters.storageCapacities, f.value) })}
                        />
                      ))}
                    </Section>
                  )}

                  <Section
                    id="more"
                    title="Scope of delivery & timing"
                    open={openSections.has("more")}
                    onToggle={toggleSection}
                  >
                    <CheckRow
                      label="Original box & papers only"
                      checked={filters.fullSetOnly}
                      onClick={() => patch({ fullSetOnly: !filters.fullSetOnly })}
                    />
                    <CheckRow
                      label="Ending within 48 hours"
                      checked={filters.endingSoon}
                      onClick={() => patch({ endingSoon: !filters.endingSoon })}
                    />
                  </Section>
                </>
              )}

              <div className="h-4" />
            </div>

            <div className="flex items-center gap-2 border-t border-white/[0.08] px-5 py-4">
              <button
                type="button"
                onClick={() => onChange(EMPTY_FILTERS)}
                disabled={activeFilterCount(filters) === 0}
                className="press flex-1 rounded-none bg-white/[0.07] py-3 text-center text-[0.82rem] font-medium tracking-tight text-foreground disabled:opacity-40"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={onClose}
                className="press flex-[1.4] rounded-none bg-brand py-3 text-center text-[0.82rem] font-medium tracking-tight text-background"
              >
                Show {resultCount} competition{resultCount === 1 ? "" : "s"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
