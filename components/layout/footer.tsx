import { Globe } from "lucide-react";
import { useTranslations } from "next-intl";

import { InstagramIcon, TelegramIcon } from "@/components/shared/brand-icons";
import { Container } from "@/components/shared/container";
import { Logo } from "@/components/shared/logo";
import {
  companyLinks,
  contactInfo,
  directionLinks,
  socialLinks,
} from "@/lib/data/content";
import { Link } from "@/lib/i18n/navigation";

const socialIcons = {
  telegram: TelegramIcon,
  web: Globe,
  instagram: InstagramIcon,
} as const;

const linkClass =
  "text-[0.9375rem] text-white/85 transition-colors duration-200 hover:text-white";

export function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="bg-brand text-white">
      <Container className="grid gap-10 py-12 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr] lg:gap-0 lg:py-16">
        <div className="flex flex-col gap-6 lg:pr-10">
          <Logo variant="light" />
          <p className="max-w-xs text-[0.9375rem] leading-relaxed text-white/85">
            {t("about")}
          </p>
          <div className="flex flex-col gap-3">
            <p className="text-sm font-bold">{t("socials")}</p>
            <ul className="flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = socialIcons[social.icon];
                return (
                  <li key={social.key}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t(`socialNames.${social.key}`)}
                      className="grid size-11 place-items-center rounded-full bg-white text-brand transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      <Icon className="size-5" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <nav aria-labelledby="footer-directions" className="flex flex-col gap-4 lg:border-l lg:border-white/25 lg:px-8">
          <h2 id="footer-directions" className="text-sm font-extrabold tracking-wide uppercase">
            {t("directions")}
          </h2>
          <ul className="flex flex-col gap-3">
            {directionLinks.map((item) => (
              <li key={item.key}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  {t(`directionLinks.${item.key}`)}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="footer-company" className="flex flex-col gap-4 lg:border-l lg:border-white/25 lg:px-8">
          <h2 id="footer-company" className="text-sm font-extrabold tracking-wide uppercase">
            {t("company")}
          </h2>
          <ul className="flex flex-col gap-3">
            {companyLinks.map((item) => (
              <li key={item.key}>
                <Link href={item.href} className={linkClass}>
                  {t(`companyLinks.${item.key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col gap-4 lg:border-l lg:border-white/25 lg:px-8">
          <h2 className="text-sm font-extrabold tracking-wide uppercase">{t("contacts")}</h2>
          <ul className="flex flex-col gap-3">
            <li className="text-[0.9375rem] text-white/85">Tashkent, Uzbekistan</li>
            <li>
              <a href={contactInfo.phoneHref} className={linkClass}>
                {contactInfo.phone}
              </a>
            </li>
            <li>
              <a href={contactInfo.emailHref} className={linkClass}>
                {contactInfo.email}
              </a>
            </li>
            <li>
              <a
                href={contactInfo.siteHref}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                {contactInfo.site}
              </a>
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-white/25">
        <Container className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-snug text-white/85">
            {t("rights", { year: 2026 })}
            <br />
            {t("rightsSecond")}
          </p>
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-white/85">
            <Link href="/privacy" className="transition-colors hover:text-white">
              {t("privacy")}
            </Link>
            <Link href="/terms" className="transition-colors hover:text-white">
              {t("terms")}
            </Link>
          </div>
        </Container>
      </div>
    </footer>
  );
}
