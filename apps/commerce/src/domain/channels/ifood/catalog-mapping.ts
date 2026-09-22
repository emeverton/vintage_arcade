import { CatalogMapEntry, ComboV2MapEntry, IfoodAdapterError, MappedOrderLine } from "./types"

export function indexCatalogMap(entries: CatalogMapEntry[]): Map<string, CatalogMapEntry> {
  const map = new Map<string, CatalogMapEntry>()
  for (const entry of entries) {
    if (!entry.ifood_item_id || !entry.internal_variant_id || !entry.sku) {
      throw new IfoodAdapterError("INVALID_MAP", "Catalog map entry incomplete")
    }
    if (map.has(entry.ifood_item_id)) throw new IfoodAdapterError("INVALID_MAP", "Duplicate ifood_item_id in catalog map")
    map.set(entry.ifood_item_id, entry)
  }
  return map
}

export function mapIfoodItem(
  ifoodItemId: string,
  quantity: number,
  catalog: Map<string, CatalogMapEntry>
): MappedOrderLine {
  if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 99) {
    throw new IfoodAdapterError("INVALID_QUANTITY", "Quantity out of range")
  }
  const entry = catalog.get(ifoodItemId)
  if (!entry) throw new IfoodAdapterError("UNMAPPED_PRODUCT", `No mapping for iFood item ${ifoodItemId}`)
  if (entry.combo_v2) {
    throw new IfoodAdapterError("COMBO_REQUIRES_V2", "COMBO_V2 items must use combo mapper")
  }
  return {
    internal_variant_id: entry.internal_variant_id,
    quantity,
    ifood_item_id: ifoodItemId,
  }
}

export function mapComboV2(
  ifoodItemId: string,
  selectedOptions: Record<string, string>,
  comboMaps: ComboV2MapEntry[],
  catalog: Map<string, CatalogMapEntry>
): { combo_id: string; lines: MappedOrderLine[] } {
  const combo = comboMaps.find((c) => c.ifood_item_id === ifoodItemId)
  if (!combo) throw new IfoodAdapterError("UNMAPPED_COMBO", `No COMBO_V2 mapping for ${ifoodItemId}`)

  const lines: MappedOrderLine[] = []
  for (const [internalSlot, optionGroupId] of Object.entries(combo.slot_map)) {
    const selectedItemId = selectedOptions[optionGroupId]
    if (!selectedItemId) {
      throw new IfoodAdapterError("COMBO_INCOMPATIBLE", `Missing selection for slot ${internalSlot}`)
    }
    const entry = catalog.get(selectedItemId)
    if (!entry) throw new IfoodAdapterError("UNMAPPED_PRODUCT", `Combo option ${selectedItemId} unmapped`)
    if (entry.combo_v2) throw new IfoodAdapterError("COMBO_INCOMPATIBLE", "Nested COMBO_V2 not supported")
    lines.push({
      internal_variant_id: entry.internal_variant_id,
      quantity: 1,
      ifood_item_id: selectedItemId,
    })
  }
  if (!lines.length) throw new IfoodAdapterError("COMBO_INCOMPATIBLE", "Combo produced no lines")
  return { combo_id: combo.internal_combo_id, lines }
}
