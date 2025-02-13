import React from "react";

import Link from "next/link";

import { IconBrandX, IconBrandGithubFilled, IconBook, IconMessage } from "@tabler/icons-react";
import { motion } from "framer-motion";

const footerLinks = [
  {
    href: "https://twitter.com/thearenatrade",
    icon: <IconBrandX />,
  },
  {
    href: "https://github.com/mrgnlabs/mrgn-ts/tree/main/apps/marginfi-v2-trading",
    icon: <IconBrandGithubFilled />,
  },
  {
    href: "https://docs.marginfi.com/the-arena/",
    icon: <IconBook />,
  },
];

export const Footer = () => {
  return (
    <motion.footer
      className="bg-background fixed bottom-0 w-full flex items-center justify-between px-4 py-2 z-30"
      style={{
        boxShadow: "0 -4px 30px 0 rgba(0, 0, 0, 0.075)",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 4 }}
    >
      <Link
        href="https://support.marginfi.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-sm font-medium"
      >
        <IconMessage size={18} /> help &amp; support
      </Link>
      <Link
        href="https://github.com/mrgnlabs/marginfi-v2/tree/main/audits"
        target="blank"
        className="text-xs text-primary/80 italic border-b border-transparent transition-colors hover:border-primary"
      >
        Audited by Ottersec and Sec3
      </Link>
      <nav>
        <ul className="flex items-center gap-3.5 justify-end">
          {footerLinks.map((link, index) => (
            <li key={index}>
              <Link
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-primary"
              >
                {React.cloneElement(link.icon, { size: 18 })}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </motion.footer>
  );
};
