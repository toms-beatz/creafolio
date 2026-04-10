/**
 * generateWizardCraftState — génère un craft_state pré-rempli depuis les données du wizard.
 * Pure function, testable. US-1506
 */

import { generateTemplate } from "@/lib/templates";

export interface WizardSocial {
  platform: string;
  url: string;
}

export interface WizardStat {
  label: string;
  value: string;
}

export interface WizardData {
  name: string;
  title: string;
  avatarUrl: string;
  bio: string;
  niches: string[];
  socials: WizardSocial[];
  stats: WizardStat[];
  templateId: string;
}

type CraftState = Record<string, unknown>;

export function generateWizardCraftState(data: WizardData): CraftState {
  const base = generateTemplate(data.templateId) as CraftState;

  // tmpl_hero
  const hero = base["tmpl_hero"] as
    | { props: Record<string, unknown> }
    | undefined;
  if (hero) {
    base["tmpl_hero"] = {
      ...hero,
      props: {
        ...hero.props,
        name: data.name || hero.props.name,
        title: data.title || hero.props.title,
        imageUrl: data.avatarUrl || "",
        ctaHref: "#contact",
        ctaLabel: "Me contacter",
      },
    };
  }

  // tmpl_about
  const about = base["tmpl_about"] as
    | { props: Record<string, unknown> }
    | undefined;
  if (about) {
    base["tmpl_about"] = {
      ...about,
      props: {
        ...about.props,
        bio: data.bio || about.props.bio,
        niches: data.niches.length > 0 ? data.niches : about.props.niches,
      },
    };
  }

  // tmpl_contact
  const contact = base["tmpl_contact"] as
    | { props: Record<string, unknown> }
    | undefined;
  if (contact && data.socials.length > 0) {
    base["tmpl_contact"] = {
      ...contact,
      props: {
        ...contact.props,
        socials: data.socials.map((s) => ({
          platform: s.platform,
          url: s.url,
        })),
      },
    };
  }

  // tmpl_stats (seulement si des stats fournies)
  const stats = base["tmpl_stats"] as
    | { props: Record<string, unknown> }
    | undefined;
  if (stats && data.stats.length > 0) {
    base["tmpl_stats"] = {
      ...stats,
      props: {
        ...stats.props,
        stats: data.stats,
      },
    };
  }

  return base;
}
