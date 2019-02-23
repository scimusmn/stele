import React, { Component, Fragment } from 'react';
import validUrl from 'valid-url';
import _ from 'lodash';
import {
  Tooltip,
  Button,
  Col,
  Container,
  Form,
  FormFeedback,
  FormGroup,
  FormText,
  Input,
  Label,
  Table,
  Row,
  Alert,
} from 'reactstrap';
import { Formik, FieldArray, Field } from 'formik';
import { FaExclamationTriangle } from 'react-icons/fa';
import { ipcRenderer } from 'electron';
import * as Yup from 'yup';

class Settings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      disconnectedDisplayTooltipOpen: false,
      cursorVisibility: 'show',
      autoLaunch: false,
      devToolsShortcut: false,
      displays: [],
      displayPrimaryID: [],
    };

    this.toggleDisconnectedDisplayTooltip = this.toggleDisconnectedDisplayTooltip.bind(this);
  }

  // TODO: Cleanup these default checks. Mutating these values isn't the right way here
  componentWillMount() {
    const kioskSettings = ipcRenderer.sendSync('settingsGet', 'kiosk');
    let {
      cursorVisibility, displayPrimaryID, displays, autoLaunch, devToolsShortcut,
    } = kioskSettings;
    if (cursorVisibility === undefined) cursorVisibility = 'show';
    if (autoLaunch === undefined) autoLaunch = false;
    if (devToolsShortcut === undefined) devToolsShortcut = false;
    if (displayPrimaryID === undefined) displayPrimaryID = '';
    if (displays === undefined) displays = [];
    this.setState({
      cursorVisibility, displayPrimaryID, displays, autoLaunch, devToolsShortcut,
    });
  }

  toggleDisconnectedDisplayTooltip() {
    this.setState(prevState => ({
      disconnectedDisplayTooltipOpen: !prevState.disconnectedDisplayTooltipOpen,
    }));
  }

  render() {
    const {
      cursorVisibility, displayPrimaryID, displays, autoLaunch, devToolsShortcut,
    } = this.state;
    const isValid = (errors, touched, name) => !!(_.get(errors, name) && _.get(touched, name));
    return (
      <Formik
        initialValues={{
          displays, cursorVis: cursorVisibility, autoLaunch, devToolsShortcut,
        }}
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
                Yup
                  .object()
                  .shape({
                    url: Yup
                      .string()
                      .when('enabled', {
                        is: true,
                        then: Yup.string()
                          .test(
                            'is-url',
                            value => (
                              !!((validUrl.isHttpUri(value) || validUrl.isHttpsUri(value)))
                            ),
                          )
                          .required('Required'),
                      }),
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
          const { disconnectedDisplayTooltipOpen } = this.state;
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

                    <Alert className="text-center" color="warning">
                      Stele is primarily designed to browser local content that you trust.
                      <br />
                      Don&apos;t configure it to browse to web content you don&apos;t trust.
                    </Alert>

                    <FieldArray
                      name="urls"
                      render={() => (
                        <Table>
                          <thead>
                            <tr>
                              <th>Enabled</th>
                              <th>ID</th>
                              <th>Resolution</th>
                              <th>Orientation</th>
                              <th>URL</th>
                            </tr>
                          </thead>
                          <tbody>
                            {
                            values.displays.map((display, index) => (
                              <tr
                                key={display.id}
                                className={display.connected
                                  ? ''
                                  : 'text-muted'}
                              >
                                <td>
                                  <Row>
                                    <Col xs={5}>
                                      {
                                        display.id === displayPrimaryID
                                          ? ''
                                          : (
                                            <FormGroup row>
                                              <Col sm={{ size: 12 }}>
                                                <FormGroup check>
                                                  <Input
                                                    onChange={handleChange}
                                                    type="checkbox"
                                                    id={`displays[${index}].enabled`}
                                                    checked={display.enabled}
                                                  />
                                                </FormGroup>
                                              </Col>
                                            </FormGroup>
                                          )
                                      }
                                    </Col>
                                    <Col xs={7}>
                                      {display.enabled && !display.connected
                                        ? (
                                          <>
                                            <FaExclamationTriangle
                                              style={{ fontSize: '30px' }}
                                              className="text-warning"
                                              id={`displays-${index}-disconnected-warning`}
                                            />
                                            <Tooltip
                                              isOpen={disconnectedDisplayTooltipOpen}
                                              toggle={this.toggleDisconnectedDisplayTooltip}
                                              placement="top"
                                              target={`displays-${index}-disconnected-warning`}
                                            >
                                              This window won&apos;t be displayed until the
                                              display is reconnected.
                                            </Tooltip>
                                          </>
                                        ) : ''}
                                    </Col>
                                  </Row>
                                </td>

                                <td>{display.id}</td>
                                <td>
                                  {display.size.width}
                                  {' '}
                                  x
                                  {display.size.height}
                                  {display.id === displayPrimaryID
                                    ? (
                                      <Fragment>
                                        <br />
                                        <em>Primary display</em>
                                      </Fragment>
                                    )
                                    : ''}
                                  {display.connected
                                    ? ''
                                    : (
                                      <Fragment>
                                        <br />
                                        <em>Display disconnected</em>
                                      </Fragment>
                                    )

                                  }
                                </td>
                                <td>
                                  {display.rotation === 0 ? 'Horizontal' : 'Vertical'}
                                </td>
                                <td>
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
                                </td>
                              </tr>
                            ))
                          }
                          </tbody>
                        </Table>
                      )}
                    />

                    <Row>
                      <Col>
                        <Label for="autoLaunch">
                          <h2>Auto launch</h2>
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
                            This change will be made the next time your system restarts.
                          </FormText>
                        </FormGroup>
                      </Col>

                      <Col>
                        <Label for="devToolsShortcut">
                          <h2>Dev tools</h2>
                        </Label>
                        <FormGroup check>
                          <Label check>
                            <Input
                              onChange={handleChange}
                              type="checkbox"
                              id="devToolsShortcut"
                              checked={values.devToolsShortcut}
                            />
                            {' '}
                            Enable dev tools shortcut
                          </Label>
                          <FormText>
                            In production, the browser dev tools are generally inaccessible, even
                            when using the default keyboard shortcuts.
                            <br />
                            Check this box to enable the keyboard shortcut.
                            <p>
                              Windows & Linux -
                              {' '}
                              <kbd>Ctrl</kbd>
                              {' '}
                              +
                              {' '}
                              <kbd>Shift</kbd>
                              {' '}
                              +
                              {' '}
                              <kbd>I</kbd>
                            </p>
                            <p>
                              macOs -
                              {' '}
                              <kbd>Cmd</kbd>
                              {' '}
                              +
                              {' '}
                              <kbd>Opt</kbd>
                              {' '}
                              +
                              {' '}
                              <kbd>I</kbd>
                            </p>
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
