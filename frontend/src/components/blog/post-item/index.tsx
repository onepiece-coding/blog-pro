/**
 * @file src/components/blog/post-item/index.tsx
 */

import { Button, Card } from "react-bootstrap";
import type { IPost } from "@/lib/types";
import { Link } from "react-router-dom";

import styles from "./styles.module.css";

const { cardImage, clampText, clampTitle1Line, clampDescription3Lines } =
  styles;

const PostItem = ({ _id, image, title, description }: IPost) => {
  return (
    <Card>
      <Card.Img variant="top" src={image.url} className={cardImage} />
      <Card.Body>
        <Card.Title title={title} className={`${clampText} ${clampTitle1Line}`}>
          {title}
        </Card.Title>
        <Card.Text className={`${clampText} ${clampDescription3Lines}`}>
          {description}
        </Card.Text>
        <Link to={`/posts/${_id}/post-details`}>
          <Button variant="primary">Read More</Button>
        </Link>
      </Card.Body>
    </Card>
  );
};

export default PostItem;
