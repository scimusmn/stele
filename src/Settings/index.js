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
  Row,
} from 'reactstrap';
import { Formik } from 'formik';
import { ipcRenderer } from 'electron';
import * as Yup from 'yup';

class Settings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      displayHome: '',
      cursorVisibility: 'show',
    };
  }

  componentWillMount() {
    const kioskSettings = ipcRenderer.sendSync('settingsGet', 'kiosk');
    let { displayHome, cursorVisibility } = kioskSettings;
    if (displayHome === undefined) displayHome = '';
    if (cursorVisibility === undefined) cursorVisibility = 'show';
    this.setState({ displayHome, cursorVisibility });
  }

  render() {
    const { displayHome, cursorVisibility } = this.state;
    return (
      <Formik
        initialValues={{ url: displayHome, cursorVis: cursorVisibility }}
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
        {(props) => {
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
                <Col xs={8}>
                  <Form onSubmit={handleSubmit}>
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
                    <FormGroup>
                      <Label for="cursorVis">Cursor Visibility</Label>
                      <select
                        name="cursorVis"
                        id="cursorVis"
                        value={values.cursorVis}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        style={{ display: 'block' }}
                      >
                        <option value="show" label="Show" />
                        <option value="hide" label="Hide" />
                        <option value="hide_after_5" label="Hide after 5 seconds inactivity" />
                        <option value="hide_after_60" label="Hide after 60 seconds inactivity" />

                      </select>
                      <FormText>
                      Select mouse cursor visibility. Does not work with iFrames.
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
