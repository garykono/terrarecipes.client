type FacetOption = { id: string; label: string; isActive?: boolean; sort?: number };
type Facet = { id: string; label: string; multi: boolean; options: FacetOption[] };
type TagsConfig = { facets: Record<string, Facet> };

/** Get a flat list of all option IDs from your tags config */
export function flattenAllOptionIds(
    config: TagsConfig,
    opts: { activeOnly?: boolean } = { activeOnly: true }
): string[] {
    const { activeOnly = true } = opts;
    return Object.values(config.facets).flatMap(facet =>
        facet.options
            .filter(opt => !activeOnly || opt.isActive)
            .map(opt => opt.id)
    );
}