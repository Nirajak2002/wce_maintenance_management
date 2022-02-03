import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Grid, Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';
import {
  Button,
} from '@material-ui/core';
import MaterialForm from '../components/MaterialForm';
import MaterialTable from '../components/MaterialTable';
import axiosInstance from '../../helpers/axiosInstance';
import Notification from '../../helpers/components/Notification';

export default function Store() {
  const history = useHistory();

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [availableMaterial, setAvailableMaterial] = useState([]);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const result = await axiosInstance.get('/api/store');
        if (result.data.success) {
          const data = result.data.data.map((item) => ({
            _id: item._id,
            material: item.material,
            materialSpec: item.materialSpec,
            unitMeasure: item.unitMeasure,
            cost: item.cost,
            units: item.quantity,
          }));

          setAvailableMaterial(data);
        } else throw new Error();
      } catch (error) {
        try {
          if (error.response.status === 403) history.push('/ui/login');
          setMessage(error.response.data.error);
          setMessageType('error');
          setOpen(true);
        } catch (error) {
          setMessage('Unable to fetch data');
          setMessageType('error');
          setOpen(true);
        }
      }
    })();
  }, [history]);

  function isMaterialExists(array, value) {
    const count = array.reduce(
      (acc, item) => (item.material === value ? ++acc : acc),
      0
    );
    return count > 0;
  }

  const submitHandler = async (material, materialSpec, unitMeasure, cost, units) => {
    try {
      if (!isMaterialExists(availableMaterial, material.trim())) {
        const result = await axiosInstance.post('/api/store', {
          material,
          materialSpec,
          unitMeasure,
          cost,
          quantity: units,
        });
        if (result.data.success)
          setAvailableMaterial([
            ...availableMaterial,
            {
              material: material.trim(),
              materialSpec: materialSpec.trim(),
              unitMeasure: unitMeasure.trim(),
              cost,
              units,
              _id: result.data._id,
            },
          ]);
        else throw new Error('Unable to add material to store');

        setErrors({});
        return Promise.resolve({
          status: true,
          errors: errors,
        });
      }
    } catch (error) {
      setErrors({
        material: ['Material already Exists'],
      });
      return Promise.reject({
        status: false,
        errors: errors,
      });
    }
  };

  return (
    <Grid container>
      <Notification open={open} setOpen={setOpen} message={message} type={messageType} />
      <Grid item lg={12} md={12}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="h4">Manage Store</Typography>
          </Grid>
          <Grid item xs={12}>
            <MaterialForm submitHandler={submitHandler} />
          </Grid>
          <Grid item xs={12}>
            <MaterialTable
              data={availableMaterial}
              setData={setAvailableMaterial}
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
