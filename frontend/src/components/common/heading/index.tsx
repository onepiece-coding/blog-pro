/**
 * @file src/components/common/heading/index.tsx
 */

import styles from "./styles.module.css";

const { heading } = styles;

interface HeadingProps {
  srOnly?: boolean;
  title: string;
  id: string;
}

const Heading = ({ srOnly = false, id, title }: HeadingProps) => {
  return (
    <h1
      id={id}
      className={`${heading} ${srOnly ? "visually-hidden" : ""}`.trim()}
    >
      {title}
    </h1>
  );
};

export default Heading;
