import React from 'react';
import { Row, Col } from 'reactstrap';

const NoMatch = () => (
  <Row className="justify-content-md-center">
    <Col className="text-center" xs={4}>
      <h2>Sorry</h2>
      <p>We can&apos;t find anything here.</p>
    </Col>
  </Row>
);

export default NoMatch;
