/**
 * @file src/pages/home/index.tsx
 */

import { Button, Container } from "react-bootstrap";
import { Link } from "react-router-dom";

import styles from "./styles.module.css";

const { hero, heroContent } = styles;

interface HomePageProps {
  title?: string;
  description?: string;
}

const HomePage = ({
  title = "Take your knowledge to another level",
  description = "Discover insightful articles, tutorials, and stories from industry experts. Join our community of learners and share your expertise.",
}: HomePageProps) => {
  return (
    <>
      <title>Blog Pro - Elevate Your Learning</title>
      <section className={hero} aria-labelledby="hero-heading" role="region">
        <Container>
          <div className={heroContent}>
            <h1 id="hero-heading">{title}</h1>
            <p>{description}</p>
            <Link to={"/posts/posts-list"} aria-label="Read more blog posts">
              <Button>Read More</Button>
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
};

export default HomePage;
