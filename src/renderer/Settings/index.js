import React, { Component, Fragment } from 'react';
import validUrl from 'valid-url';
import classNames from 'classnames';
import _ from 'lodash';
import {
  Alert,
  Button,
  Col,
  Container,
  Form,
  FormFeedback,
  FormGroup,
  FormText,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  Table,
  Tooltip,
} from 'reactstrap';
import { Field, FieldArray, Formik } from 'formik';
import { FaExclamationTriangle } from 'react-icons/fa';
import { ipcRenderer } from 'electron';
import { array, object, string } from 'yup';
import CookieForm from './cookieForm';

class Settings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      disconnectedDisplayTooltipOpen: false,
      deleteConfigModalOpen: false,
      cursorVisibility: 'show',
      cookieName: 'n',
      cookieValue: 'v',
      cookieURL: 'u',
      autoLaunch: false,
      devToolsShortcut: false,
      displays: [],
      displayPrimaryID: [],
      steleVersion: '',
      electronVersion: '',
      chromeVersion: '',
    };

    this.toggleDisconnectedDisplayTooltip = this.toggleDisconnectedDisplayTooltip.bind(this);
    this.toggleDeleteConfigModal = this.toggleDeleteConfigModal.bind(this);
    this.handleDeleteConfig = this.handleDeleteConfig.bind(this);
  }

  // TODO: Cleanup these default checks. Mutating these values isn't the right way here
  componentWillMount() {
    const kioskSettings = ipcRenderer.sendSync('settingsGet', 'kiosk');
    const {
      stele: steleVersion,
      electron: electronVersion,
      chrome: chromeVersion,
    } = ipcRenderer.sendSync('appVersions');
    let {
      cursorVisibility,
      displayPrimaryID,
      displays,
      autoLaunch,
      devToolsShortcut,
      cookieName,
      cookieValue,
      cookieURL,
    } = kioskSettings;
    if (cursorVisibility === undefined) cursorVisibility = 'show';
    if (cookieName === undefined) cookieName = '';
    if (cookieValue === undefined) cookieValue = '';
    if (cookieURL === undefined) cookieURL = '';
    if (autoLaunch === undefined) autoLaunch = false;
    if (devToolsShortcut === undefined) devToolsShortcut = false;
    if (displayPrimaryID === undefined) displayPrimaryID = '';
    if (displays === undefined) displays = [];
    this.setState({
      cursorVisibility,
      displayPrimaryID,
      displays,
      autoLaunch,
      devToolsShortcut,
      cookieName,
      cookieValue,
      cookieURL,
      steleVersion,
      electronVersion,
      chromeVersion,
    });
  }

  toggleDisconnectedDisplayTooltip() {
    this.setState(prevState => ({
      disconnectedDisplayTooltipOpen: !prevState.disconnectedDisplayTooltipOpen,
    }));
  }

  toggleDeleteConfigModal() {
    this.setState(prevState => ({
      deleteConfigModalOpen: !prevState.deleteConfigModalOpen,
    }));
  }

  handleDeleteConfig() {
    this.setState({ deleteConfigModalOpen: false });
    ipcRenderer.send('deleteConfig');
  }

  render() {
    const {
      cursorVisibility,
      displayPrimaryID,
      displays,
      autoLaunch,
      devToolsShortcut,
      cookieName,
      cookieValue,
      cookieURL,
      steleVersion,
      electronVersion,
      chromeVersion,
    } = this.state;
    const isValid = (errors, name) => !!_.get(errors, name);

    //
    // Forget disconnected displays if requested
    //
    // Handler for the forget button.
    // This updates the state, so that we can toggle the row style (ready to forget).
    // We also use Formik's setFieldValue to update the form values. These get sent to the
    // main process where it will delete this display from the settings store.
    // process to delete the display from the settings store. We use
    const forgetDisplay = (index, display, values, setFieldValue) => {
      const newDisplays = _.map(displays, (d) => {
        if (d.id === display.id) {
          return _.extend({}, d, {
            forgetting: !_.get(d, 'forgetting', false),
          });
        }
        return d;
      });
      setFieldValue(`displays[${index}].forgetting`, true);
      this.setState({ displays: newDisplays });
    };

    const generateDisplayRowClass = (display) => {
      const forgettingValue = _.get(_.find(displays, { id: display.id }), 'forgetting');
      return classNames(
        display.connected
          ? ''
          : 'text-muted',
        forgettingValue
          ? 'table-danger'
          : '',
      );
    };

    return (
      <Formik
        initialValues={{
          displays,
          cursorVis: cursorVisibility,
          autoLaunch,
          devToolsShortcut,
          cookieName,
          cookieValue,
          cookieURL,
        }}
        onSubmit={(values, { setSubmitting }) => {
          setTimeout(() => {
            ipcRenderer.send('updateSettings', values);
            setSubmitting(false);
          }, 500);
        }}
        validationSchema={
        object()
          .shape({
            displays: array()
              .of(
                object()
                  .shape({
                    url: string()
                      .when('enabled', {
                        is: true,
                        then: string()
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
            errors,
            isSubmitting,
            handleChange,
            handleBlur,
            handleSubmit,
            setFieldValue,
          } = props;
          const { disconnectedDisplayTooltipOpen, deleteConfigModalOpen } = this.state;
          return (
            <Container>
              <Row className="mt-3 justify-content-center">
                <Col xs={10}>
                  <Form
                    className="border p-3 bg-light"
                    onSubmit={handleSubmit}
                  >
                    <h1 className="text-center">Kiosk settings</h1>
                    <p className="text-center text-muted">
                      Stele
                      {' '}
                      {steleVersion}
                      {' · '}
                      Electron
                      {' '}
                      {electronVersion}
                      {' · '}
                      Chromium
                      {' '}
                      {chromeVersion}
                    </p>
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
                              <th>Keep Focus</th>
                            </tr>
                          </thead>
                          <tbody>
                            {
                            values.displays.map((display, index) => (
                              <tr
                                key={display.id}
                                className={generateDisplayRowClass(display)}
                              >
                                <td>
                                  <Row>
                                    <Col xs={5}>
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
                                    </Col>
                                    <Col xs={7}>
                                      {display.enabled && !display.connected
                                        ? (
                                          <React.Fragment>
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
                                          </React.Fragment>
                                        ) : ''}
                                    </Col>
                                  </Row>
                                  {!display.connected
                                    ? (
                                      <Row>
                                        <Col className="mt-3 text-center">
                                          <Button
                                            onClick={() => {
                                              forgetDisplay(index, display, values, setFieldValue);
                                            }}
                                            color="danger"
                                          >
                                            Forget
                                          </Button>
                                          <Input
                                            type="hidden"
                                            id={`displays[${index}].forgetting`}
                                          />
                                        </Col>
                                      </Row>
                                    )
                                    : ''
                                  }
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
                                        invalid={isValid(errors, `displays[${index}].url`)}
                                        value={values.displays[index].url}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                      />
                                    )}
                                  />
                                  <FormFeedback invalid={errors.url}>
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
                                <td>
                                  <Col xs={5}>
                                    <FormGroup row>
                                      <Col sm={{ size: 12 }}>
                                        <FormGroup check>
                                          <Input
                                            onChange={handleChange}
                                            type="checkbox"
                                            id={`displays[${index}].forceFocus`}
                                            checked={display.forceFocus}
                                          />
                                        </FormGroup>
                                      </Col>
                                    </FormGroup>
                                  </Col>
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

                    <CookieForm
                      values={values}
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                    />

                    <Button
                      color="primary"
                      type="submit"
                      disabled={isSubmitting}
                    >
                      Save
                    </Button>
                    {' '}
                    <Button
                      color="danger"
                      type="button"
                      onClick={this.toggleDeleteConfigModal}
                    >
                      Delete config
                    </Button>

                    <Modal
                      isOpen={deleteConfigModalOpen}
                      toggle={this.toggleDeleteConfigModal}
                    >
                      <ModalHeader toggle={this.toggleDeleteConfigModal}>
                        Delete config file?
                      </ModalHeader>
                      <ModalBody>
                        Are you sure you want to delete the config file?
                        This will reset all kiosk settings to their defaults
                        and cannot be undone.
                      </ModalBody>
                      <ModalFooter>
                        <Button
                          color="danger"
                          onClick={this.handleDeleteConfig}
                        >
                          Delete config
                        </Button>
                        {' '}
                        <Button
                          color="secondary"
                          onClick={this.toggleDeleteConfigModal}
                        >
                          Cancel
                        </Button>
                      </ModalFooter>
                    </Modal>
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
