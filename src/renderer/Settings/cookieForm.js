import React from 'react';
import {
  Col, FormText, Input, Row, Table,
} from 'reactstrap';
import PropTypes from 'prop-types';
import { Field } from 'formik';

const CookieForm = (props) => {
  const { values, handleChange, handleBlur } = props;
  return (
    <Row className="mt-3 justify-content-center">
      <Col>
        <hr />
        <h2>Auth cookie</h2>
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Value</th>
              <th>URL</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <Field
                  name="cookieName"
                  render={({ field }) => (
                    <Input
                      {...field}
                      className="form-control"
                      type="text"
                      value={values.cookieName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  )}
                />
                <FormText>
                  e.g.,
                  {' '}
                  <i>access-token</i>
                </FormText>
              </td>
              <td>
                <Field
                  name="cookieValue"
                  render={({ field }) => (
                    <Input
                      {...field}
                      className="form-control"
                      type="text"
                      value={values.cookieValue}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  )}
                />
                <FormText>
                  e.g.,
                  {' '}
                  <i>my-token-ABC123</i>
                </FormText>
              </td>
              <td>
                <Field
                  name="cookieURL"
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      value={values.cookieURL}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  )}
                />
                <FormText>
                  Base URL of associated site.
                  <br />
                  e.g.,
                  {' '}
                  <i>http://localhost</i>
                  {' '}
                  or
                  {' '}
                  <i>http://smm.org</i>
                </FormText>
              </td>
            </tr>

          </tbody>
        </Table>
      </Col>
    </Row>
  );
};

CookieForm.propTypes = {
  values: PropTypes.instanceOf(Object).isRequired,
  handleChange: PropTypes.func.isRequired,
  handleBlur: PropTypes.func.isRequired,
};

export default CookieForm;
