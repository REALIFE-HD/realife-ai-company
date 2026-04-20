import { supabase } from "@/integrations/supabase/client";

export type DocSection = {
  id: string;
  slug: string;
  icon: string;
  title: string;
  lead: string;
  body: string[];
  sort_order: number;
};

export type DocFaq = {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
};

export async function loadDocSections(): Promise<DocSection[]> {
  const { data, error } = await supabase
    .from("doc_sections")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as DocSection[];
}

export async function loadDocFaqs(): Promise<DocFaq[]> {
  const { data, error } = await supabase
    .from("doc_faqs")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as DocFaq[];
}

export async function updateDocSection(
  id: string,
  patch: Partial<Pick<DocSection, "title" | "lead" | "body" | "icon">>,
): Promise<void> {
  const { error } = await supabase.from("doc_sections").update(patch).eq("id", id);
  if (error) throw error;
}

export async function updateDocFaq(
  id: string,
  patch: Partial<Pick<DocFaq, "question" | "answer">>,
): Promise<void> {
  const { error } = await supabase.from("doc_faqs").update(patch).eq("id", id);
  if (error) throw error;
}

export async function addDocSection(input: {
  slug: string;
  title: string;
  lead?: string;
  body?: string[];
  icon?: string;
  sort_order?: number;
}): Promise<DocSection> {
  const { data, error } = await supabase
    .from("doc_sections")
    .insert({
      slug: input.slug,
      title: input.title,
      lead: input.lead ?? "",
      body: input.body ?? [],
      icon: input.icon ?? "BookOpen",
      sort_order: input.sort_order ?? 99,
    })
    .select()
    .single();
  if (error) throw error;
  return data as DocSection;
}

export async function addDocFaq(input: {
  question: string;
  answer?: string;
  sort_order?: number;
}): Promise<DocFaq> {
  const { data, error } = await supabase
    .from("doc_faqs")
    .insert({
      question: input.question,
      answer: input.answer ?? "",
      sort_order: input.sort_order ?? 99,
    })
    .select()
    .single();
  if (error) throw error;
  return data as DocFaq;
}

export async function deleteDocSection(id: string): Promise<void> {
  const { error } = await supabase.from("doc_sections").delete().eq("id", id);
  if (error) throw error;
}

export async function deleteDocFaq(id: string): Promise<void> {
  const { error } = await supabase.from("doc_faqs").delete().eq("id", id);
  if (error) throw error;
}
