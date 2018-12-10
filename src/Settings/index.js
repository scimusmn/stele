import React, { Component } from 'react';
import {
  Button,
  Col,
  Container,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  Label,
  Row
} from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { ipcRenderer } from 'electron';

class Settings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      displayHome: '',
    };
  }

  componentWillMount() {
    const displayHome = ipcRenderer.sendSync('settingsGet', 'kiosk.displayHome');
    this.setState({ displayHome });
  }

  render() {
    const { displayHome } = this.state;
    return (
      <Formik
        initialValues={{ url: displayHome }}
        onSubmit={(values, { setSubmitting }) => {
          setTimeout(() => {
            ipcRenderer.send('updateSettings', values);
            setSubmitting(false);
          }, 500);
        }}
        validationSchema={Yup.object()
          .shape({
            url: Yup.string()
              .required('Required'),
          })}
      >
        {props => {
          const {
            values,
            touched,
            errors,
            dirty,
            isSubmitting,
            handleChange,
            handleBlur,
            handleSubmit,
            handleReset,
          } = props;
          return (
            <Container>
              <Row className="mt-3">
                <Col xs={8}><Form onSubmit={handleSubmit}>
                  <h1>Kiosk settings</h1>
                  <FormGroup>
                    <Label
                      htmlFor="url"
                      style={{ display: 'block' }}
                    >
                      Kiosk URL
                      <Input
                        id="url"
                        type="text"
                        value={values.url}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={
                          errors.url && touched.url ? 'text-input error' : 'text-input'
                        }
                      />
                    </Label>
                    <FormFeedback>
                      {errors.url &&
                      touched.url && <div className="input-feedback">{errors.url}</div>}
                    </FormFeedback>
                  </FormGroup>


                  <Button
                    color="secondary"
                    type="button"
                    className="mr-3"
                    onClick={handleReset}
                    disabled={!dirty || isSubmitting}
                  >
                    Reset
                  </Button>
                  <Button
                    color="primary"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    Submit
                  </Button>

                </Form>
                </Col>
              </Row>
            </Container>
          );
        }}
      </Formik>
    );
  }
}

export default Settings;
