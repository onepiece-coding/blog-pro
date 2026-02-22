/**
 * @file src/pages/posts/posts-list/index.tsx
 */

import { GridList, Heading, Pagination, Search } from "@/components/common";
import { getPosts, postsCleanUp } from "@/store/posts/posts-slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Card, Col, Container, Row } from "react-bootstrap";
import { Filtration, PostItem } from "@/components/blog";
import { Loading } from "@/components/feedback";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import type { IPost } from "@/lib/types";
import { Link } from "react-router-dom";
import {
  selectGetPostsError,
  selectGetPostsRecords,
  selectGetPostsStatus,
  selectGetPostsTotalPages,
} from "@/store/posts/posts-selectors";

const PostsList = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const [category, setCategory] = useState("");
  const [text, setText] = useState("");

  const dispatch = useAppDispatch();
  const location = useLocation();

  const getPostsTotalPages = useAppSelector(selectGetPostsTotalPages);
  const getPostsRecords = useAppSelector(selectGetPostsRecords);
  const getPostsStatus = useAppSelector(selectGetPostsStatus);
  const getPostsError = useAppSelector(selectGetPostsError);

  const locationState =
    (location.state as {
      username: string;
      userPosts: IPost[];
    }) ?? null;

  const handlePageChange = (newPage: number) => {
    setPageNumber(newPage);
  };

  const handleTextChange = (newText: string) => {
    setPageNumber(1);
    setText(newText);
  };

  const handleCategoryChange = (newCategory: string) => {
    setPageNumber(1);
    setCategory(newCategory);
  };

  useEffect(() => {
    if (locationState) return;
    const promise = dispatch(getPosts({ pageNumber, text, category }));
    return () => {
      promise.abort();
      dispatch(postsCleanUp());
    };
  }, [locationState, dispatch, pageNumber, text, category]);

  return (
    <>
      <title>Blog Pro - Posts List</title>

      <section
        className="my-3"
        aria-labelledby="posts-list-heading"
        role="region"
      >
        <Container>
          <Heading id="posts-list-heading" title="Posts List" srOnly={true} />
          <Card className="viewport-card">
            <Card.Header>
              {locationState ? (
                `This is the ${locationState.username} Posts`
              ) : (
                <Row className="row-gap-2">
                  <Col md="6">
                    <Search
                      handleSearchChange={handleTextChange}
                      label="Search Term"
                    />
                  </Col>
                  <Col md="6">
                    <Filtration handleCategoryChange={handleCategoryChange} />
                  </Col>
                </Row>
              )}
            </Card.Header>
            <Card.Body>
              <Loading
                status={locationState ? "succeeded" : getPostsStatus}
                error={getPostsError}
              >
                <GridList<IPost>
                  renderItem={(record) => <PostItem {...record} />}
                  records={
                    locationState ? locationState.userPosts : getPostsRecords
                  }
                />
              </Loading>
            </Card.Body>
            {(locationState || getPostsRecords.length > 0) && (
              <Card.Footer>
                {locationState ? (
                  <Link
                    className="text-decoration-none"
                    aria-label="Get All Posts"
                    to="/posts/posts-list"
                  >
                    Go back to all posts
                  </Link>
                ) : (
                  <Pagination
                    handlePageChange={handlePageChange}
                    totalPages={getPostsTotalPages}
                    pageNumber={pageNumber}
                  />
                )}
              </Card.Footer>
            )}
          </Card>
        </Container>
      </section>
    </>
  );
};

export default PostsList;
