import React, { useState, useEffect } from 'react';
import { useHistory, useParams, Link } from 'react-router-dom';
import { Button, Grid, makeStyles, Typography,FormControl,
  TextField, } from '@material-ui/core';
import BackArrow from '@material-ui/icons/KeyboardBackspace';

import axiosInstance from '../helpers/axiosInstance';
import ComplaintDetails from './components/ComplaintDetails';
import RejectReasonForm from './components/RejectReasonForm';
import Loader from '../helpers/components/Loader';
import Notification from '../helpers/components/Notification';
import GetWindowWidth from '../helpers/GetWindowWidth';
import CommiteeSelect from '../forms/components/CommitteeSelect';

const useStyles = makeStyles((theme) => ({
  button: {
    borderRadius: 0,
    width: '60%',
  },
  acceptBtn: {
    backgroundColor: 'green',
    color: 'white',
    '&:hover': {
      backgroundColor: '#006400',
    },
  },
  rejectBtn: {
    backgroundColor: 'red',
    color: 'white',
    '&:hover': {
      backgroundColor: '#CD0000',
    },
  },
  div: {
    marginTop: '20px',
    padding: '10px',
  },
}));

export default function AdminView(props) {
  const classes = useStyles();
  const history = useHistory();
  const { complaintId } = useParams();
  const { width } = GetWindowWidth();

  const [complaint, setComplaint] = useState(null);
  const [nextForm, setNextForm] = useState(null);
  const [buttonVisibility, setButtonVisibility] = useState(true);
  const [editComplaint, setEditComplaint] = useState(true);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [progressWork, setEditprogressWork] = useState(false);
  const [comment, setComment] = useState('');
  const [buttonText,setbuttonText]=useState('');

  useEffect(() => {
    (async () => {
      console.log(complaintId);
      try {
        if (!complaintId) {
          history.push('/ui/dashboard/admin');
          return;
        }
        const result = await axiosInstance.get(
          `/api/complaint/details/${complaintId}`
        );
        if (
          result.data.complaint.rejected ||
          result.data.complaint.stage >= 3
        ) {
          setEditComplaint(false);
        }
  
        setComplaint(result.data.complaint);
        if(result.data.complaint.stage==6 && result.data.complaint.grantAccessTo[0].director.isGranted)
       {
        setbuttonText('Work in Progress');
         setEditprogressWork(true);
       }
       if(result.data.complaint.stage==7 && result.data.complaint.grantAccessTo[0].director.isGranted)
       {
           setbuttonText('Work done');setEditprogressWork(true);
         }
      } catch (error) {
        try {
          if (error.response.status === 403) history.push('/ui/login');
          setMessage(error.response.data.error);
          setMessageType('error');
          setOpen(true);
        } catch (error) {
          history.push('/ui/dashboard/admin');
          setMessageType('error');
          setOpen(true);
        }
      }
    })();
  }, [ history, props]);

  const acceptHandler = () => {
    setNextForm('CommiteeForm');
    setButtonVisibility(false);
  };

  const rejectHandler = () => {
    setNextForm('RejectReasonForm');
    setButtonVisibility(false);
  };

  const formButtons = () => {
    return (
      <Grid container spacing={1} style={{ marginTop: '15px' }}>
        <Notification
          open={open}
          setOpen={setOpen}
          message={message}
          type={messageType}
        />
        <Grid item md={4} xs={8}>
          <Button
            className={[classes.button, classes.rejectBtn].join(' ')}
            type="submit"
            size="large"
            variant="contained"
            onClick={rejectHandler}
            fullWidth
          >
            Reject Request
          </Button>
        </Grid>
        <Grid item md={4} xs={4}>
          <Button
            className={[classes.button, classes.acceptBtn].join(' ')}
            type="submit"
            size="large"
            variant="contained"
            onClick={acceptHandler}
            fullWidth
          >
            Accept Request
          </Button>
        </Grid>
      </Grid>
    );
  };

  const handleGrantAccessTo = async (data) => {
    console.log("grant access");
  
    try {
      console.log(data);
      await axiosInstance.post(`/api/complaint/accept/${complaintId}`, data);
      history.push('/ui/dashboard/admin');
    } catch (error) {
      try {
        setMessage(error.response.data.error);
        setMessageType('error');
        setOpen(true);
      } catch (error) {
        setMessage('Database Error..Try after Some time');
        setMessageType('error');
        setOpen(true);
      }
    }
  };

  const DisplayNextForm = () => {
    return (
      <>
        {nextForm === 'CommiteeForm' && (
          <CommiteeSelect
            rejectHandler={rejectHandler}
            submitHandler={handleGrantAccessTo}
          />
        )}
        {nextForm === 'RejectReasonForm' && (
          <RejectReasonForm
            type="admin"
            complaintId={complaintId}
            acceptHandler={acceptHandler}
          />
        )}
      </>
    );
  };
  const progressHandler=async ()=>{
    setButtonVisibility(false);
    try {
      await axiosInstance.post(`/api/complaint/accept/${complaintId}`);
      history.push("/ui/dashboard/admin");
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
        history.push("/ui/dashboard/admin");
      }
    }
  }

  if (!complaint) return <Loader />;

  return (
    <React.Fragment>
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
          <Link to="/ui/dashboard/admin">
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
      {editComplaint && (
        <div className={classes.div}>
          {buttonVisibility && formButtons()}
          <DisplayNextForm />{' '}
        </div>
      )}
       {progressWork && ( <div>
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
          <br/><br/>
        </FormControl>
      </Grid>
      <Grid container className={classes.marginTop} spacing={1}>
        <Grid item md={4} xs={8}>
          <Button
            className={[classes.button, classes.acceptBtn].join(' ')}
            size="large"
            variant="contained"
            onClick={progressHandler}
            color="primary"
          >
         {buttonText}
          </Button>
        </Grid>
        </Grid>
      </div>
      )}

    </React.Fragment>
  );
}
