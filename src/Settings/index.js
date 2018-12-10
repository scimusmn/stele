import React, { Component } from 'react';
import {
  Button,
  Col,
  Container,
  Form,
  FormFeedback,
  FormGroup,
  FormText,
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
            isSubmitting,
            handleChange,
            handleBlur,
            handleSubmit,
          } = props;
          return (
            <Container>
              <Row className="mt-3">
                <Col xs={8}><Form onSubmit={handleSubmit}>
                  <h1>Kiosk settings</h1>
                  <FormGroup>
                    <Label for="url">Kiosk URL</Label>
                    <Input
                      invalid={errors.url && touched.url}
                      id="url"
                      type="text"
                      value={values.url}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <FormFeedback invalid={errors.url && touched.url}>
                      A URL is required
                    </FormFeedback>
                    <FormText>
                      Enter the home URL for the kiosk.
                    </FormText>
                  </FormGroup>

                  <Button
                    color="primary"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    Save
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
