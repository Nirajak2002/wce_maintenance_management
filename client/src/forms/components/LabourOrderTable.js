import React, { useState, useEffect } from 'react';
import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  FormControl,
  TextField,
} from '@material-ui/core';
import { DeleteOutline, DoneOutline, Edit } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';

import axiosInstance from '../../helpers/axiosInstance';
import Confirmation from '../../helpers/components/Confirmation';
import PopOver from '../../helpers/components/PopOver';
import LabourOrderValidator from '../utils/LabourOrderValidator';
import Notification from '../../helpers/components/Notification';

const useStyles = makeStyles(() => ({
  numberInput: {
    '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
      '-webkit-appearance': 'none',
      margin: 0,
    },
  },
}));

export default function LabourOrderTable({
  orderedLabours,
  availableLabours,
  setLabours,
  type,
  complaintId,
  setOrderedLabours,
  // currentUserId,
}) {
  const classes = useStyles();

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [lType, setlType] = useState('');
  const [lCharges, setlCharges] = useState(0);
  const [lCount, setlCount] = useState(0);
  const [lAmount, setlAmount] = useState(0);
  const [delIndex, setDelIndex] = useState(-1);
  const [inEditMode, setInEditMode] = useState({
    state: false,
    row: null,
  });
  const [popoverEvent, setPopoverEvent] = useState(null);
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [errors, setErrors] = useState({});

  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const user = JSON.parse(
      window.localStorage.getItem('WCEMaintananceManagementSystemUser')
    );

    console.log(user.currentUser._id);
    setCurrentUserId(user.currentUser._id);
    console.log(orderedLabours);
  }, []);

  const resetPopoverStates = () => {
    setPopoverEvent(null);
    setPopoverVisible(false);
    setDelIndex(-1);
  };

  const showPopover = (event, index) => {
    setDelIndex(index);
    setPopoverEvent(event.target);
    setPopoverVisible(true);
  };

  const editHandler = (index, item) => {
    setlType(item.lType);
    setlCharges(item.lCharges);
    setlCount(item.lCount);
    setlAmount(item.lCharges);
    setInEditMode({
      state: true,
      row: index,
    });
  };

  const deleteHandler = async () => {
    try {
      const queryData = {
        complaintId,
        // type: 'ordered',
      };
      const result = await axiosInstance.delete(
        `/api/labour/${orderedLabours[delIndex]._id}`,
        { data: queryData }
      );
      if (!result.data.success) throw new Error();

      setOrderedLabours(
        orderedLabours.filter((item, i) => {
          return i !== delIndex;
        })
      );
      setMessage(' Data removed from List');
      setMessageType('success');
      setOpen(true);
    } catch (error) {
      try {
        setMessage(error.response.data.error);
        setMessageType('error');
        setOpen(true);
      } catch (error) {
        setMessage('Error while deleting');
        setMessageType('error');
        setOpen(true);
      }
    } finally {
      resetPopoverStates();
    }
  };

  function isLabourExists(array, value) {
    const items = array.reduce(
      (acc, item, index) => (item.lType === value ? [...acc, index] : acc),
      []
    );
    return items;
  }

  const checkDuplicate = (lType, index) => {
    const duplicates = isLabourExists(orderedLabours, lType.trim());
    if (
      duplicates.length === 0 ||
      (duplicates.length === 1 && duplicates.includes(index))
    ) {
      setErrors({});
      return Promise.resolve({
        status: true,
        errors: errors,
      });
    } else {
      const error = {
        material: ['Labour Type Exists'],
      };
      setErrors(error);
      return Promise.reject({
        status: false,
        errors: error,
      });
    }
  };

  const saveHandler = (index) => {
    LabourOrderValidator()
      .validate({
        lType,
        lCharges,
        lCount,
        lAmount
      })
      .then(
        () => {
          checkDuplicate(lType, index).then(
            async () => {
              try {
                const isInStore =
                  isLabourExists(availableLabours, lType.trim()).length >
                  0;
                if (isInStore) {
                  setErrors({
                    lType: ['labour'],
                  });
                  return;
                }

                setInEditMode({
                  state: false,
                  row: null,
                });

                const queryData = {
                  complaintId,
                  // type: 'labour',

                  lType: lType.trim(),
                  lCharges,
                  lCount,
                  lAmount,
                };
                console.log(orderedLabours[index]._id)
                await axiosInstance.put(
                  `/api/labour/${orderedLabours[index]._id}`,
                  queryData
                );

                const editedData = [...orderedLabours];
                editedData[index] = {
                  _id: orderedLabours[index]._id,
                  lType: lType.trim(),
                  lCharges,
                  lCount,
                  lAmount
                };
                setOrderedLabours(editedData);
                setMessage('Labours Details Updated');
                setMessageType('success');
                setOpen(true);

                setErrors({});
              } catch (error) {
                try {
                  setMessage(error.response.data.error);
                  setMessageType('error');
                  setOpen(true);
                } catch (error) {
                  setMessage('Unable to update Labour Details');
                  setMessageType('error');
                  setOpen(true);
                }
              }
            },
            (error) => {
              setErrors(error.errors);
            }
          );
        },
        (error) => {
          setErrors(error.errors);
        }
      );
  };

  const popoverContent = (
    <Confirmation
      confirmText={'Are you sure?'}
      onResolve={deleteHandler}
      onReject={resetPopoverStates}
    />
  );

  const editModeForm = (index) => {
    return (
      <TableRow key={index}>
        <TableCell component="th" scope="row" width="30%">
          <FormControl>
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
        </TableCell>
        <TableCell component="th" scope="row" align="right" width="25%">
          <FormControl>
            <TextField
              className={classes.numberInput}
              inputProps={{
                'data-testid': 'lCharges',
                style: { textAlign: 'right' },
              }}
              InputLabelProps={{ shrink: true }}
              type="number"
              fullWidth
              required
              autoFocus
              min={1}
              label="Labour Charges Per Job"
              size="small"
              value={lCharges}
              onChange={(event) => setlCharges(event.target.value)}
              error={!!errors.lCharges}
              helperText={errors.lCharges ? errors.lCharges[0] : ' '}
            />
          </FormControl>
        </TableCell>
        <TableCell component="th" scope="row" align="right" width="20%">
          <FormControl>
            <TextField
              className={classes.numberInput}
              inputProps={{
                'data-testid': 'lCount',
                style: { textAlign: 'right' },
              }}
              InputLabelProps={{ shrink: true }}
              type="number"
              fullWidth
              required
              autoFocus
              label="Count"
              size="small"
              value={lCount}
              onChange={(event) => setlCount(event.target.value)}
              error={!!errors.lCount}
              helperText={errors.lCount ? errors.lCount[0] : ' '}
            />
          </FormControl>
        </TableCell>

        <TableCell component="th" scope="row" align="right" width="20%">
          <FormControl>
            <TextField
              className={classes.numberInput}
              inputProps={{
                'data-testid': 'lAmount',
                style: { textAlign: 'right' },
              }}
              InputLabelProps={{ shrink: true }}
              type="number"
              fullWidth
              required
              autoFocus
              label="Estimated Amount"
              size="small"
              value={lAmount}
              onChange={(event) => setlAmount(event.target.value)}
              error={!!errors.lCount}
              helperText={errors.lAmount ? errors.lAmount[0] : ' '}
            />
          </FormControl>
        </TableCell>

        <TableCell component="th" scope="row" align="center" width="25%">
          <IconButton onClick={() => saveHandler(index)}>
            <DoneOutline style={{ color: 'black' }} fontSize="small" />
          </IconButton>
        </TableCell>
      </TableRow>
    );
  };

  function displayInfo(index, item) {
    
    return (
      <TableRow key={index}>
        <TableCell component="th" scope="row" width="25%">
          {item.lType}
        </TableCell>
        <TableCell component="th" scope="row" align="right" width="25%">
          {type === 'availabe' ? item.lCharges : item.lCharges}
        </TableCell>
        <TableCell component="th" scope="row" align="right" width="25%">
          {item.lCount}
        </TableCell>
        <TableCell component="th" scope="row" align="right" width="25%">
          {item.lAmount}
        </TableCell>

        {item.addedBy === currentUserId && (
          <TableCell component="th" scope="row" width="25%" align="center">
            <IconButton
              style={{ padding: '5px' }}
              size="small"
              disabled={inEditMode.state}
              onClick={() => editHandler(index, item)}
            >
              <Edit style={{ color: 'black' }} fontSize="small" />
            </IconButton>
            <IconButton
              style={{ padding: '5px' }}
              size="small"
              onClick={(event) => showPopover(event, index)}
            >
              <DeleteOutline style={{ color: 'red' }} fontSize="small" />
            </IconButton>
          </TableCell>
        )}
      </TableRow>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Notification
        open={open}
        setOpen={setOpen}
        message={message}
        type={messageType}
      />
      {popoverVisible ? (
        <PopOver event={popoverEvent} content={popoverContent} />
      ) : null}
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell width="20%">Labour Type</TableCell>
            <TableCell width="20%" align={inEditMode.state ? 'left' : 'right'}>
              {  'Labour Charges Per Job'}
            </TableCell>
            <TableCell
              component="th"
              scope="row"
              align={inEditMode.state ? 'left' : 'right'}
              width="20%"
            >
              Labour Count
            </TableCell>
            <TableCell
              component="th"
              scope="row"
              align={inEditMode.state ? 'left' : 'right'}
              width="20%"
            >
              Estimated Amount
            </TableCell>
            <TableCell width="20%" align="center">
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orderedLabours.map((item, index) => (
            <React.Fragment key={index}>
             {inEditMode.state && inEditMode.row === index
                ? editModeForm(index)
                : displayInfo(index, item)}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}