import { Globe } from "lucide-react";
import { useTranslations } from "next-intl";

import { InstagramIcon, TelegramIcon } from "@/components/shared/brand-icons";
import { contactInfo } from "@/lib/data/content";

export function ShareLinks({ url, title }: { url: string; title: string }) {
  const t = useTranslations("Common");

  const targets = [
    {
      key: "telegram",
      href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      Icon: TelegramIcon,
    },
    {
      key: "web",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      Icon: Globe,
    },
    { key: "instagram", href: contactInfo.instagramHref, Icon: InstagramIcon },
  ];

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-bold text-brand">{t("share")}</span>
      <ul className="flex items-center gap-2">
        {targets.map(({ key, href, Icon }) => (
          <li key={key}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={key}
              className="grid size-10 place-items-center rounded-full bg-brand text-white transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <Icon className="size-[1.15rem]" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
