import React, { useState, useEffect } from 'react';
import { useHistory, useParams, Link } from 'react-router-dom';
import { makeStyles, Typography, Grid,  Button,
  FormControl,
  TextField, } from '@material-ui/core';
import BackArrow from '@material-ui/icons/KeyboardBackspace';

import ComplaintDetails from './components/ComplaintDetails';
import Loader from '../helpers/components/Loader';
import axiosInstance from '../helpers/axiosInstance';
import Notification from '../helpers/components/Notification';
import GetWindowWidth from '../helpers/GetWindowWidth';

const useStyles = makeStyles((theme) => ({
  div: {
    marginTop: '20px',
    padding: '10px',
  },
  button: {
    borderRadius: 0,
  },
  formControl: {
    width: '100%',
  },
  acceptBtn: {
    backgroundColor: 'green',
    color: 'white',
    '&:hover': {
      backgroundColor: '#006400',
    },
  },
  marginTop: {
    margin: theme.spacing(1.5, 0.98),
  },
}));

const StudentView = () => {
  const classes = useStyles();
  const { width } = GetWindowWidth();
  const history = useHistory();
  const { complaintId } = useParams();

  const [complaint, setComplaint] = useState(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [editComplaint, setEditComplaint] = useState(false);
  const [comment, setComment] = useState('');
  useEffect(() => {
    (async () => {
      try {
        if (!complaintId) {
          history.push('/ui/dashboard/student');
          return;
        }
        const result = await axiosInstance.get(
          `/api/complaint/details/${complaintId}`
        );
        setComplaint(result.data.complaint);
        //change the stage here
       if(result.data.complaint.stage==8)
       {
         setEditComplaint(true);
       }
      } catch (error) {
        try {
          if (error.response.status === 403) history.push('/ui/login');
          setMessage(error.response.data.error);
          setMessageType('error');
          setOpen(true);
        } catch (error) {
          history.push('/ui/dashboard/student');
        }
      }
    })();
  }, []);
  const ackHandler=async()=>{
    // setButtonVisibility(false);
    try {
      await axiosInstance.post(`/api/complaint/accept/${complaintId}`);
      history.push("/ui/dashboard/student");
    } catch (error) {
      try {
        if (error.response.status === 403) history.push("/ui/login");
        setMessage(error.response.data.error);
        setMessageType("error");
        setOpen(true);
      } catch (error) {
        setMessage("Database Error");
        setMessageType("error");
        setOpen(true);
        history.push("/ui/dashboard/student");
      }
    }
  }

  if (!complaint) return <Loader />;

  return (
    <>
      <Notification
        open={open}
        setOpen={setOpen}
        message={message}
        type={messageType}
      />
      <Grid container spacing={2}>
        <Grid item xs={12} md={9}>
          <Typography variant="h4">Request Details</Typography>
        </Grid>
        <Grid
          item
          xs={5}
          md={3}
          align={width > 960 ? 'right' : 'left'}
          className={classes.backButton}
        >
          <Link to="/ui/dashboard/student">
            <Button
              size="large"
              fullWidth
              variant="contained"
              color="primary"
              startIcon={<BackArrow />}
            >
              Back to Dashboard
            </Button>
          </Link>

        </Grid>
      </Grid>
      <div className={classes.div}>
        <ComplaintDetails complaintData={complaint} />
      </div>
      {editComplaint && ( <div>
        <br></br><br/>
      <Grid item md={5} xs={12}>
        <FormControl className={classes.formControl}>
          <TextField
            className={classes.style}
            fullWidth
            multiline
            rows={4}
            rowsMax={4}
            variant="outlined"
            label="Comment.."
            size="small"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />
        </FormControl>
      </Grid>
      <Grid container className={classes.marginTop} spacing={1}>
        <Grid item md={4} xs={8}>
          <Button
            className={[classes.button, classes.acceptBtn].join(' ')}
            size="large"
            variant="contained"
            onClick={ackHandler}
            color="primary"
          >
           Acknowledge the work
          </Button>
        </Grid>
        </Grid>
      </div>
      )}
    </>
  );
};

export default StudentView;
