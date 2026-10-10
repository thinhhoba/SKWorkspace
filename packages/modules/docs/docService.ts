import { MOCK_DOCS } from "./mockData";
import type { DocCategory, DocRecord, DocStats } from "./types";

let docStore: DocRecord[] = MOCK_DOCS.map((d) => ({ ...d }));

export function getDocs(filters?: { category?: DocCategory | "ALL"; search?: string }): DocRecord[] {
  let list = [...docStore];
  if (filters?.category && filters.category !== "ALL") {
    list = list.filter((d) => d.category === filters.category);
  }
  if (filters?.search && filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    list = list.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        d.file_name.toLowerCase().includes(q) ||
        d.issuer.toLowerCase().includes(q) ||
        (d.tags ?? []).some((t) => t.toLowerCase().includes(q)),
    );
  }
  return list;
}

export function getDocById(id: string): DocRecord | undefined {
  return docStore.find((d) => d.id === id);
}

export function getDocStats(): DocStats {
  const byCategory: Record<DocCategory, number> = { legal: 0, cert: 0, contract_template: 0 };
  for (const d of docStore) byCategory[d.category] = (byCategory[d.category] ?? 0) + 1;
  const totalCount = docStore.length;
  const totalSizeKb = docStore.reduce((acc, d) => acc + d.file_size_kb, 0);
  return {
    legalCount: byCategory.legal,
    certCount: byCategory.cert,
    contractCount: byCategory.contract_template,
    totalCount,
    totalSizeKb,
    byCategory,
  };
}

export function __resetDocStore(): void {
  docStore = MOCK_DOCS.map((d) => ({ ...d }));
}
