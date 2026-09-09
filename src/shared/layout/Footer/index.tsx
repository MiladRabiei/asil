import { cn } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

export interface IFooterLink {
  title: string;
  url: string;
}

export interface IFooterGroup {
  title: string;
  links: Array<IFooterLink>;
}

export interface IFooterCallSection {
  title?: string;
  phone: string;
  extensions?: string[];
  description?: string;
  workingHours?: string;
}

export interface IFooterLogo {
  src: string;
  alt: string;
  href: string;
  width?: number;
  height?: number;
}

export interface FooterProps {
  logo?: IFooterLogo;
  description?: string;
  /** Grouped links rendered as titled columns (original layout). */
  linkGroups?: Array<IFooterGroup>;
  /** Ungrouped links: chevron rows on mobile, inline row on desktop. */
  flatLinks?: Array<IFooterLink>;
  socialLinks?: Array<{ icon: React.ReactNode; url: string; label: string }>;
  badgeImages?: Array<{ src: string; alt: string; url: string }>;
  callSection?: IFooterCallSection;
  copyrightText?: string;
  /** Theme overrides — default to the original dark footer. */
  bgClassName?: string;
  textClassName?: string;
}

const DEFAULT_LOGO: IFooterLogo = {
  src: '/img/logo/service-logo.png',
  alt: 'لوگوی جی‌اس‌ام',
  href: '/b2b',
  width: 80,
  height: 47,
};

const Footer: React.FC<FooterProps> = ({
  logo = DEFAULT_LOGO,
  description,
  linkGroups,
  flatLinks,
  socialLinks,
  badgeImages,
  callSection,
  copyrightText,
  bgClassName = 'bg-gray-800',
  textClassName = 'text-secondary-content',
}) => {
  return (
    <footer
      dir="rtl"
      className={cn(
        bgClassName,
        textClassName,
        ' flex flex-col gap-8  lg:max-h-130 md:border border-t-iceberg-500'
      )}
      aria-label="footer"
    >
      <div className="flex flex-col gap-8 lg:flex-row justify-between px-md lg:px-16 pt-lg lg:pt-8 ">
        <div className=" lg:w-136 flex flex-col gap-8">
          {/* Top: Logo + description */}
          <div className="relative flex flex-col items-start lg:justify-center gap-md md:flex-row ">
            <Link href={logo.href} aria-label={logo.alt} className="shrink-0 bg-white z-10 pl-md">
              <Image
                src={logo.src}
                width={logo.width ?? 150}
                height={logo.height ?? 20}
                alt={logo.alt}
              />
            </Link>
            <div className="w-full border-t border-red-400 md:hidden absolute top-5 pl-md"></div>
            {description && <p className="max-w-2xl text-sm text-iceberg-500">{description}</p>}
          </div>

          {/* Grouped columns — original layout, unchanged */}
          {linkGroups && linkGroups.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg w-full py-md">
              {linkGroups.map((group, i) => (
                <nav key={i} aria-label={group.title} className="flex flex-col gap-sm">
                  <h2 className="font-bold text-lg">{group.title}</h2>
                  <ul className="flex flex-col gap-sm">
                    {group.links.map((link, idx) => (
                      <li key={idx}>
                        <Link href={link.url} className="link link-hover text-base">
                          {link.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>
          )}
          {/* Flat links — mobile: chevron rows, desktop: inline row */}
          {flatLinks && flatLinks.length > 0 && (
            <nav aria-label="لینک‌های فوتر" className="lg:w-86 py-md">
              <ul className="flex flex-col gap-6  md:hidden ">
                {flatLinks.map((link, idx) => (
                  <li key={idx}>
                    <Link
                      href={link.url}
                      className="flex items-center justify-between  text-base font-semibold text-gray-800"
                    >
                      <span>{link.title}</span>
                      <ChevronLeft className="size-6 " />
                    </Link>
                  </li>
                ))}
              </ul>

              <ul className="hidden md:flex md:flex-wrap md:items-center md:gap-lg text-gray-800">
                {flatLinks.map((link, idx) => (
                  <li key={idx}>
                    <Link href={link.url} className="text-base hover:underline">
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
        <div className="flex flex-col   gap-8 items-end">
          <div className="w-full border-b border-iceberg-400 md:hidden"></div>
          {/* Call + Social + Badges */}
          {(callSection || socialLinks || badgeImages) && (
            <div className=" w-full lg:w-80 flex flex-col gap-6 lg:gap-8 md:flex-row md:items-center md:justify-between lg:flex-col">
              {callSection && (
                <section className="flex flex-col items-center gap-sm">
                  {callSection.title && <h2 className="font-bold text-lg">{callSection.title}</h2>}

                  {callSection.description && (
                    <p className="text-sm opacity-80">{callSection.description}</p>
                  )}
                  <div className="flex gap-sm">
                    <span>تلفن پشتیبانی:</span>
                    <Link
                      href={`tel:${callSection.phone.replace(/\D/g, '')}`}
                      className="text-xl font-bold hover:underline w-fit"
                    >
                      {callSection.phone}
                    </Link>
                  </div>

                  {callSection.extensions?.length ? (
                    <p className="text-sm">داخلی {callSection.extensions.join('، ')}</p>
                  ) : null}

                  {callSection.workingHours && (
                    <p className="text-sm opacity-70">{callSection.workingHours}</p>
                  )}
                </section>
              )}

              {socialLinks && (
                <div>
                  <ul className="flex gap-md justify-center">
                    {socialLinks.map((social, i) => (
                      <li key={i}>
                        <Link
                          href={social.url}
                          aria-label={social.label}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {social.icon}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {badgeImages && (
                <ul className="flex justify-center gap-sm flex-wrap">
                  {badgeImages.map((badge, i) => (
                    <li key={i}>
                      <Link href={badge.url} target="_blank" rel="noopener noreferrer">
                        <Image src={badge.src} alt={badge.alt} width={88} height={91} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Copyright bar */}
      {copyrightText && (
        <div className="flex items-center justify-center bg-surface-neutral text-[10px] lg:text-sm py-sm text-center h-12 lg:h-13 text-iceberg-700 ">
          {copyrightText}
        </div>
      )}
    </footer>
  );
};

export default Footer;
