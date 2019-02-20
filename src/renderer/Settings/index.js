import React, { Component, Fragment } from 'react';
import validUrl from 'valid-url';
import _ from 'lodash';
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
  Alert,
} from 'reactstrap';
import { Formik, FieldArray, Field } from 'formik';
import { ipcRenderer } from 'electron';
import * as Yup from 'yup';

class Settings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      cursorVisibility: 'show',
      autoLaunch: false,
      displays: [],
      displayPrimaryID: [],
    };
  }

  // TODO: Cleanup these default checks. Mutating these values isn't the right way here
  componentWillMount() {
    const kioskSettings = ipcRenderer.sendSync('settingsGet', 'kiosk');
    let {
      displayHome, cursorVisibility, displayCount, displayPrimaryID, displays, autoLaunch,
    } = kioskSettings;
    if (displayHome === undefined) displayHome = '';
    if (cursorVisibility === undefined) cursorVisibility = 'show';
    if (autoLaunch === undefined) autoLaunch = false;
    if (displayCount === undefined) displayCount = 1;
    if (displayPrimaryID === undefined) displayPrimaryID = '';
    if (displays === undefined) displays = [];
    this.setState({
      cursorVisibility, displayPrimaryID, displays, autoLaunch,
    });
  }

  render() {
    const {
      cursorVisibility, displayPrimaryID, displays, autoLaunch,
    } = this.state;
    const isValid = (errors, touched, name) => !!(_.get(errors, name) && _.get(touched, name));
    return (
      <Formik
        initialValues={{ displays, cursorVis: cursorVisibility, autoLaunch }}
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
              displays: Yup.array()
                .of(
                  Yup.object().shape({
                    url: Yup
                      .string()
                      .test(
                        'is-url',
                        value => (!!((validUrl.isHttpUri(value) || validUrl.isHttpsUri(value)))),
                      )
                      .required('Required'),
                  }),
                ),
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
              <Row className="mt-3 justify-content-center">
                <Col xs={10}>
                  <Form
                    className="border p-3 bg-light"
                    onSubmit={handleSubmit}
                  >
                    <h1 className="text-center">Kiosk settings</h1>
                    <hr />
                    <h2>Display configuration</h2>

                    <FieldArray
                      name="urls"
                      render={() => (
                        <Fragment>
                          {
                          values.displays.map((display, index) => (
                            <FormGroup row key={display.id}>
                              <Label
                                className="text-right"
                                sm={3}
                                for={`displays[${index}].url`}
                              >
                                {display.id === displayPrimaryID
                                  ? <strong>Primary display</strong>
                                  : 'Display'}
                                <br />
                                id:
                                {' '}
                                {display.id}
                              </Label>
                              <Col sm={9}>
                                <Field
                                  name={`displays[${index}].url`}
                                  render={({ field }) => (
                                    <Input
                                      {...field}
                                      className="form-control"
                                      type="text"
                                      invalid={isValid(errors, touched, `displays[${index}].url`)}
                                      value={values.displays[index].url}
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                    />
                                  )}
                                />
                                <FormFeedback invalid={errors.url && touched.url}>
                                  A valid URL is required.
                                  <br />
                                  The URL should start with http:// or https://
                                </FormFeedback>
                                <FormText>
                                  Enter a URL for
                                  {' '}
                                  {display.id === displayPrimaryID ? 'the primary' : 'this'}
                                  {' '}
                                  display
                                </FormText>
                              </Col>
                            </FormGroup>
                          ))
                        }
                          <Alert color="warning">
                            Stele is primarily designed for local content that you trust.
                            Don&squot;t configure it to browse to web content you don&squot;t trust.
                          </Alert>
                        </Fragment>
                      )}
                    />

                    <Row>
                      <Col>
                        <Label for="autoLaunch">
                          <h2>Auto Launch</h2>
                        </Label>
                        <FormGroup check>
                          <Label check>
                            <Input
                              onChange={handleChange}
                              type="checkbox"
                              id="autoLaunch"
                              checked={values.autoLaunch}
                            />
                            {' '}
                            Auto launch application on startup
                          </Label>
                          <FormText>
                            Auto launch application on startup.
                          </FormText>
                        </FormGroup>
                      </Col>

                      <Col>
                        <FormGroup>
                          <Label for="cursorVis">
                            <h2>Cursor visibility</h2>
                          </Label>
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
                            <option
                              value="hide_after_60"
                              label="Hide after 60 seconds inactivity"
                            />
                          </select>

                          <FormText>
                            Select mouse cursor visibility. Does not work with iFrames.
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
