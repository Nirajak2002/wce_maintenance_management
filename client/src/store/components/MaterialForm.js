import React, { useState } from 'react';
import {
  FormControl,
  Grid,
  TextField,
  Button,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import Notification from '../../helpers/components/Notification';
import MaterialFormValidator from '../utils/MaterialFormValidator';

const useStyles = makeStyles(() => ({
  button: {
    borderRadius: 0,
  },
  formControl: {
    width: '100%',
  },
  numberInput: {
    '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
      '-webkit-appearance': 'none',
      margin: 0,
    },
  },
}));

export default function MaterialForm({ submitHandler }) {
  const classes = useStyles();

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [material, setMaterial] = useState('');
  const [materialSpec, setMaterialSpec] = useState('');
  const [unitMeasure, setUnitMeasure] = useState('');
  const [unitCost, setCost] = useState(0);
  const [units, setUnits] = useState(0);
  const [errors, setErrors] = useState({});

  const resetForm = () => {
    setMaterial('');
    setMaterialSpec('');
    setUnitMeasure('');
    setUnits(0);
    setCost(0);
  };

  const addHandler = (event) => {
    event.preventDefault();
    MaterialFormValidator()
      .validate({
        material,
        materialSpec,
        unitMeasure,
        unitCost,
        units,
      })
      .then(
        () => {
          submitHandler(material, materialSpec, unitMeasure, unitCost, units).then(
            () => {
              setMessage('Material Added to the List');
              setMessageType('success');
              setOpen(true);
              resetForm();
              setErrors({});
            },
            (error) => {
              setErrors(error.errors);
            }
          );
        },
        (error) => {
          console.log(error);
          setErrors(error.errors);
        }
      );
  };

  return (
    <form>
      <Notification open={open} setOpen={setOpen} message={message} type={messageType} />
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h4">Add Material To Store</Typography>
        </Grid>
        {/* Grid Item 1: Material Issued*/}
        <Grid item md={5} xs={12}>
          <FormControl className={classes.formControl}>
            <TextField
              fullWidth
              required
              autoFocus
              inputProps={{ 'data-testid': 'material' }}
              label="Material Name"
              size="small"
              value={material}
              onChange={(event) => setMaterial(event.target.value)}
              error={!!errors.material}
              helperText={errors.material ? errors.material[0] : ' '}
            />
          </FormControl>
        </Grid>

      {/* Grid Item 2: Material Specification*/}
        <Grid item md={5} xs={10}>
          <FormControl className={classes.formControl}>
            <TextField
              fullWidth
              required
              autoFocus
              inputProps={{ 'data-testid': 'materialSpec' }}
              label="Material Specification"
              size="small"
              value={materialSpec}
              onChange={(event) => setMaterialSpec(event.target.value)}
              error={!!errors.materialSpec}
              helperText={errors.materialSpec ? errors.materialSpec[0] : ' '}
            />
          </FormControl>
        </Grid>

      {/* Grid Item 3: Unit of Measurement*/}
        <Grid item md={5} xs={10}>
          <FormControl className={classes.formControl}>
            <TextField
              fullWidth
              required
              autoFocus
              inputProps={{ 'data-testid': 'unitMeasure' }}
              label="Unit of Measurement"
              size="small"
              value={unitMeasure}
              onChange={(event) => setUnitMeasure(event.target.value)}
              error={!!errors.unitMeasure}
              helperText={errors.unitMeasure ? errors.unitMeasure[0] : ' '}
            />
          </FormControl>
        </Grid>

        {/*Grid Item 4: Unit Cost*/}
        <Grid item md={5} xs={10}>
          <FormControl className={classes.formControl}>
            <TextField
              className={classes.numberInput}
              type="number"
              fullWidth
              required
              autoFocus
              InputLabelProps={{ shrink: true }}
              inputProps={{ 'data-testid': 'unitCost' }}
              label="Unit Cost"
              size="small"
              value={unitCost}
              onChange={(event) => setCost(event.target.value)}
              error={!!errors.unitCost}
              helperText={errors.unitCost ? errors.unitCost[0] : ' '}
            />
          </FormControl>
        </Grid>
        
        {/*Grid Item 5: No of Units*/}
        <Grid item md={5} xs={10}>
          <FormControl className={classes.formControl}>
            <TextField
              className={classes.numberInput}
              type="number"
              fullWidth
              required
              autoFocus
              InputLabelProps={{ shrink: true }}
              inputProps={{ 'data-testid': 'units' }}
              label="No of Units"
              size="small"
              value={units}
              onChange={(event) => setUnits(event.target.value)}
              error={!!errors.units}
              helperText={errors.units ? errors.units[0] : ' '}
            />
          </FormControl>
        </Grid>
        <Grid item xs={2}>
          <Button
            className={classes.button}
            type="submit"
            fullWidth
            size="large"
            color="secondary"
            variant="contained"
            onClick={addHandler}
          >
            Add
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
