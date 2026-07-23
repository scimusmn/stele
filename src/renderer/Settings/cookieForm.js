import React from 'react';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  FormText,
  Input,
  Table,
  UncontrolledCollapse,
} from 'reactstrap';
import PropTypes from 'prop-types';
import { Field } from 'formik';
import { FaChevronDown } from 'react-icons/fa';

const CookieForm = (props) => {
  const { values, handleChange, handleBlur } = props;
  return (
    <Card className="settings-accordion mt-4">
      <CardHeader className="settings-accordion__header">
        <Button
          id="cookie-accordion-toggler"
          color="link"
          className="settings-accordion__toggle"
        >
          <span>Auth cookie</span>
          <FaChevronDown className="settings-accordion__chevron" aria-hidden="true" />
        </Button>
      </CardHeader>
      <UncontrolledCollapse toggler="#cookie-accordion-toggler">
        <CardBody>
          <Table className="settings-cookie-table mb-0">
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
        </CardBody>
      </UncontrolledCollapse>
    </Card>
  );
};

CookieForm.propTypes = {
  values: PropTypes.instanceOf(Object).isRequired,
  handleChange: PropTypes.func.isRequired,
  handleBlur: PropTypes.func.isRequired,
};

export default CookieForm;
