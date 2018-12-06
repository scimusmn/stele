import React from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { ipcRenderer } from 'electron';

function Settings() {
  return (
    <Formik
      initialValues={{ url: '' }}
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
          <form onSubmit={handleSubmit}>
            <label
              htmlFor="url"
              style={{ display: 'block' }}
            >
              Kiosk URL
              <input
                id="url"
                placeholder="Enter kiosk URL"
                type="text"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={
                  errors.url && touched.url ? 'text-input error' : 'text-input'
                }
              />
            </label>

            {errors.url &&
            touched.url && <div className="input-feedback">{errors.url}</div>}

            <button
              type="button"
              className="outline"
              onClick={handleReset}
              disabled={!dirty || isSubmitting}
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
            >
              Submit
            </button>

          </form>
        );
      }}
    </Formik>
  );
}

export default Settings;
