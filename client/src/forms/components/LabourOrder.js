import React, { useEffect, useState } from 'react';
import {
  Button,
  FormControl,
  Grid,
  makeStyles,
  TextField,
  Typography,
} from '@material-ui/core';

import OrderedLabourTable from './LabourOrderTable';
import axiosInstance from '../../helpers/axiosInstance';
import Notification from '../../helpers/components/Notification';
import LabourOrderValidator from '../utils/LabourOrderValidator';

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

export default function OrderedLabours({
  complaintId,
  orderedLabours,
  setOrderedLabours,
}) {
  const classes = useStyles();

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  // const [orderedMaterials, setOrderedMaterials] = useState([]);
  const [availableLabours, setAvailableLabours] = useState([]);
  const [lType, setlType] = useState('');
  const [lCharges, setlCharges] = useState(0);
  const [lCount, setlCount] = useState(0);
  const [lAmount, setlAmount] = useState(0);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const getData = async () => {
      axiosInstance.get('/api/labour').then((data) => {
        setAvailableLabours(data.data.data);
      });

      setOrderedLabours([]);
      setlType('');
      setlCharges(0);
      setlCount(0);
      setlAmount(0);
      setErrors([]);
    };
    getData();
  }, []);

  const resetForm = () => {
    setlType('');
    setlCharges(0);
    setlCount(0);
    setlAmount(0);
    setErrors({});
  };

  const isLabourExists = (array, value) => {
    const count = array.reduce(
      (acc, item) => (item.lType === value ? ++acc : acc),
      0
    );
    return count > 0;
  };

  const addHandler = () => {
    LabourOrderValidator()
      .validate({
        lType,
        lCharges,
        lCount,
        lAmount
      })
      .then(
        async () => {
          try {
            console.log("92 try");
            const isAdded = isLabourExists(orderedLabours, lType.trim());
            // const isInStore = isLabourExists(
            //   availableLabours,
            //   lType.trim()
            // );
            console.log(isAdded);
            if (isAdded) {
              setErrors({
                lType: ['Labour type already Added'],
              });
              return;
            }
            /*
            if (isInStore) {
              setErrors({
                material: ['Available in Store'],
              });
              return;
            }
            */
            const queryData = {
              complaintId,
              // type: 'labour',
              sign: 'AO SIGNATURE',

              lType: lType.trim(),
              lCharges,
              lCount,
              lAmount
            };

            const result = await axiosInstance.post('/api/labour', queryData);
            console.log(result);
            if (!result.data.success) throw new Error();
console.log("127 try");
            const doc = result.data.data.labourOrder.filter(
              (d) => d.lType === lType.trim()
            );
console.log(doc);
            const _id = doc[0]._id;
console.log(_id);
            if (!result.data.success) throw new Error();
            setOrderedLabours([
              ...orderedLabours,
              {
                _id,
                lType: lType.trim(),
                lCharges,
                lCount,
                lAmount,
                addedBy: result.data._id,
              },
            ]);
console.log(orderedLabours)
            setMessage('Labour Details Added to the List');
            setMessageType('success');
            setOpen(true);

            setErrors({});
            resetForm();
          } catch (error) {
            try {
              setMessage(error.response.data.error);
              setMessageType('error');
              setOpen(true);
            } catch (error) {
              
              setMessageType('error');
              setOpen(true);
            }
          }
        },
        (error) => {
          setErrors(error.errors);
        }
      );
  };

  return (
    <Grid container spacing={2}>
      <Notification
        open={open}
        setOpen={setOpen}
        message={message}
        type={messageType}
      />
      <Grid item xs={12}>
        <Grid container justify="center" alignItems="center">
          <Typography variant="h5">Labour Requirement</Typography>
        </Grid>
      </Grid>
      <Grid item md={4} xs={12}>
        <FormControl className={classes.formControl}>
          <TextField
            fullWidth
            required
            autoFocus
            inputProps={{ 'data-testid': 'lType' }}
            label="Labour Type"
            size="small"
            value={lType}
            onChange={(event) => setlType(event.target.value)}
            error={!!errors.lType}
            helperText={errors.lType ? errors.lType[0] : ' '}
          />
        </FormControl>
      </Grid>
      <Grid item md={3} xs={12}>
        <FormControl className={classes.formControl}>
          <TextField
            className={classes.numberInput}
            type="number"
            fullWidth
            required
            autoFocus
            InputLabelProps={{ shrink: true }}
            inputProps={{ 'data-testid': 'lCharges' }}
            label="Labour Charges"
            size="small"
            value={lCharges}
            onChange={(event) => setlCharges(event.target.value)}
            error={!!errors.lCharges}
            helperText={errors.lCharges ? errors.lCharges[0] : ' '}
          />
        </FormControl>
      </Grid>
      <Grid item md={3} xs={12}>
        <FormControl className={classes.formControl}>
          <TextField
            className={classes.numberInput}
            type="number"
            fullWidth
            required
            autoFocus
            InputLabelProps={{ shrink: true }}
            inputProps={{ 'data-testid': 'lCount' }}
            label="Labour count"
            size="small"
            value={lCount}
            onChange={(event) => setlCount(event.target.value)}
            error={!!errors.lCount}
            helperText={errors.lCount ? errors.lCount[0] : ' '}
          />
        </FormControl>
      </Grid>

      <Grid item md={3} xs={12}>
        <FormControl className={classes.formControl}>
          <TextField
            className={classes.numberInput}
            type="number"
            fullWidth
            required
            autoFocus
            InputLabelProps={{ shrink: true }}
            inputProps={{ 'data-testid': 'lAmount' }}
            label="Estimated Amount"
            size="small"
            value={lAmount}
            onChange={(event) => setlAmount(event.target.value)}
            error={!!errors.lAmount}
            helperText={errors.lAmount ? errors.lAmount[0] : ' '}
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
      <Grid item xs={12} style={{ marginTop: '2px' }}>
        <OrderedLabourTable
          orderedLabours={orderedLabours}
          availableLabours={availableLabours}
          setOrderedLabours={setOrderedLabours}
          type="labour"
          complaintId={complaintId}
        />
      </Grid>
    </Grid>
  );
}