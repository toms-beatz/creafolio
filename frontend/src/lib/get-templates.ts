"use server";

import { TEMPLATES, type TemplateInfo } from "./templates";

export async function getTemplatesWithConfig(): Promise<TemplateInfo[]> {
  return TEMPLATES;
}
