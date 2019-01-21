import React, { Component } from 'react';
import validUrl from 'valid-url';
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
      autoLaunch: true,
    };
  }

  componentWillMount() {
    const kioskSettings = ipcRenderer.sendSync('settingsGet', 'kiosk');
    let { displayHome, cursorVisibility, autoLaunch } = kioskSettings;
    if (displayHome === undefined) displayHome = '';
    if (cursorVisibility === undefined) cursorVisibility = 'show';
    if (autoLaunch === undefined) autoLaunch = true;
    this.setState({ displayHome, cursorVisibility, autoLaunch });
  }

  render() {
    const { displayHome, cursorVisibility, autoLaunch } = this.state;
    return (
      <Formik
        initialValues={{ url: displayHome, cursorVis: cursorVisibility, autoLaunch }}
        onSubmit={(values, { setSubmitting }) => {
          setTimeout(() => {
            ipcRenderer.send('updateSettings', values);
            setSubmitting(false);
          }, 500);
        }}
        validationSchema={
          Yup
            .object()
            .shape({
              url: Yup
                .string()
                .test(
                  'is-url',
                  value => (!!((validUrl.isHttpUri(value) || validUrl.isHttpsUri(value)))),
                )
                .required('Required'),
            })
        }
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
                <Col xs={8} className="mx-auto">
                  <Form
                    className="border p-3 bg-light"
                    onSubmit={handleSubmit}
                  >
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
                        A valid URL is required.
                        <br />
                        The URL should start with http:// or https://
                      </FormFeedback>
                      <FormText>
                        Enter the home URL for the kiosk.
                      </FormText>
                    </FormGroup>
                    <Row form>
                      <Col md={6}>
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
                      </Col>
                      <Col md={6}>
                        <Label for="autoLaunch">Auto Launch</Label>
                        <FormGroup check>
                          <Label check>
                            <Input onChange={handleChange} type="checkbox" id="autoLaunch" checked={values.autoLaunch} />
                            {' '}
                          Auto launch application on startup
                          </Label>
                          <FormText>
                        Auto launch application on startup.
                          </FormText>
                        </FormGroup>
                      </Col>
                    </Row>
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
