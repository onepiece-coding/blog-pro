/**
 * @file src/components/common/footer/index.tsx
 */

import styles from "./styles.module.css";

const { footerContainer } = styles;

interface FooterProps {
  copyrightYear?: number;
  companyName?: string;
}

const Footer = ({
  copyrightYear = new Date().getFullYear(),
  companyName = "OP-Blog",
}: FooterProps) => {
  return (
    <footer className={footerContainer} role="contentinfo">
      <p className="mb-0">
        © {copyrightYear} {companyName}. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
