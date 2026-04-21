import { supabase } from "@/integrations/supabase/client";

export type DocumentItem = {
  id: string;
  department_code: string;
  title: string;
  url: string;
  description: string;
  category: string;
  sort_order: number;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export const DOCUMENT_CATEGORIES = [
  "マニュアル",
  "規程",
  "テンプレート",
  "議事録",
  "外部リンク",
  "その他",
] as const;

export async function getDocumentsForDepartment(
  departmentCode: string,
): Promise<DocumentItem[]> {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("department_code", departmentCode)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DocumentItem[];
}

export async function addDocument(input: {
  department_code: string;
  title: string;
  url: string;
  description?: string;
  category?: string;
}): Promise<DocumentItem> {
  const { data, error } = await supabase
    .from("documents")
    .insert({
      department_code: input.department_code,
      title: input.title,
      url: input.url,
      description: input.description ?? "",
      category: input.category ?? "マニュアル",
    })
    .select()
    .single();
  if (error) throw error;
  return data as DocumentItem;
}

export async function updateDocument(
  id: string,
  patch: Partial<Pick<DocumentItem, "title" | "url" | "description" | "category">>,
): Promise<void> {
  const { error } = await supabase.from("documents").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteDocument(id: string): Promise<void> {
  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) throw error;
}
