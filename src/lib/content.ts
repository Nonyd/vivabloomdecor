import { prisma } from "@/lib/prisma";

export async function getPageContent(
  page: string
): Promise<Record<string, Record<string, string>>> {
  try {
    const items = await prisma.pageContent.findMany({
      where: { page },
    });
    const map: Record<string, Record<string, string>> = {};
    for (const item of items) {
      if (!map[item.section]) map[item.section] = {};
      map[item.section][item.key] = item.value;
    }
    return map;
  } catch {
    return {};
  }
}

export function get(
  content: Record<string, Record<string, string>>,
  section: string,
  key: string,
  fallback = ""
): string {
  return content[section]?.[key] ?? fallback;
}
