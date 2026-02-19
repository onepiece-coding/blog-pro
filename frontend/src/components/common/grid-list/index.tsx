/**
 * @file src/components/common/grid-list/index.tsx
 */

import { LottieHandler } from "@/components/feedback";
import { Col, Row } from "react-bootstrap";

type HasID = { _id?: string };

interface GridListProps<T extends HasID> {
  records: T[];
  renderItem: (record: T) => React.ReactNode;
}

const GridList = <T extends HasID>({
  records,
  renderItem,
}: GridListProps<T>) => {
  return (
    <>
      {records.length > 0 ? (
        <Row className="row-gap-4">
          {records.map((record) => (
            <Col key={record._id} md={6} lg={4}>
              {renderItem(record)}
            </Col>
          ))}
        </Row>
      ) : (
        <LottieHandler
          className="text-danger mt-3 mb-0"
          message={"No posts to show!"}
          type="lottie-error"
          title="Empty"
        />
      )}
    </>
  );
};

export default GridList;
