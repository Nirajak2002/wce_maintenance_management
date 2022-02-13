import React, { useState, useEffect } from "react";
import { useHistory, useParams, Link } from "react-router-dom";
import { Button, Grid, makeStyles, Typography,FormControl,TextField } from "@material-ui/core";
import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@material-ui/core";
import BackArrow from "@material-ui/icons/KeyboardBackspace";

import axiosInstance from "../helpers/axiosInstance";
import ComplaintDetails from "./components/ComplaintDetails";
import RejectReasonForm from "./components/RejectReasonForm";
import Loader from "../helpers/components/Loader";
import Notification from "../helpers/components/Notification";
import GetWindowWidth from "../helpers/GetWindowWidth";
import CommiteeSelect from "../forms/components/CommitteeSelect";

const useStyles = makeStyles((theme) => ({
  button: {
    borderRadius: 0,
    width: "60%",
  },
  acceptBtn: {
    backgroundColor: "green",
    color: "white",
    "&:hover": {
      backgroundColor: "#006400",
    },
  },
  rejectBtn: {
    backgroundColor: "red",
    color: "white",
    "&:hover": {
      backgroundColor: "#CD0000",
    },
  },
  div: {
    marginTop: "20px",
    padding: "10px",
  },
  costText: {
    marginTop: "10px",
    marginRight: "30px",
  },
  costText_total: {
    fontSize: "18px",
    marginTop: "10px",
    marginRight: "30px",
    fontWeight: "bold",
  },
}));

export default function DirectorView(props) {
  
  const classes = useStyles();
  const history = useHistory();
  const { complaintId } = useParams();
  const { width } = GetWindowWidth();

  const [complaint, setComplaint] = useState(null);
  const [nextForm, setNextForm] = useState(null);
  const [buttonVisibility, setButtonVisibility] = useState(false);
  const [editComplaint, setEditComplaint] = useState(true);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [StoreMaterial, setStoreMaterial] = useState(null);
  const [OrderedMaterial, setOrderedMaterial] = useState(null);
  const[OrderedLabours,setOrderedLabours]=useState(null);

  useEffect(() => {
    (async () => {
      console.log(complaintId);
      try {
        if (!complaintId) {
          history.push("/ui/dashboard/director");
          return;
        }
        const result = await axiosInstance.get(
          `/api/complaint/details/${complaintId}`
        );
        if (
          result.data.complaint.rejected ||
          result.data.complaint.stage >= 6
        ) {
          setEditComplaint(false);
        }
        const result2 = await axiosInstance.get(
          `/api/complaint/getMaterial/${complaintId}`
        );
        const existing = result2.data.availableInStore.map((doc) => {
          return {
            _id: doc.materialId._id,
            material: doc.materialId.material,
            approxCost: doc.materialId.cost,
            units: doc.quantity,
            addedBy: doc.addedBy,
          };
        });

        const ordered = result2.data.orderedMaterial.map((doc) => {
          return {
            _id: doc._id,
            material: doc.material,
            approxCost: doc.approxCost,
            units: doc.quantity,
            addedBy: doc.addedBy,
          };
        });
        const resultLabour = await axiosInstance.get(
          `/api/labour/${complaintId}`
        );
        const labour = resultLabour.data.labourOrder.map((doc) => ({
          _id: doc._id,
          lType: doc.lType,
          lCharges: doc.lCharges,
          lCount: doc.lCount,
          lAmount: doc.lAmount,
          addedBy: doc.addedBy,
        }));
        setStoreMaterial(existing);
        setOrderedMaterial(ordered);
        setOrderedLabours(labour);
        setComplaint(result.data.complaint);
      } catch (error) {
        try {
          if (error.response.status === 403) history.push("/ui/login");
          setMessage(error.response.data.error);
          setMessageType("error");
          setOpen(true);
        } catch (error) {
          history.push("/ui/dashboard/director");
          setMessageType("error");
          setOpen(true);
        }
      }
    })();
  }, [complaintId, history, props]);

  const allocateHandler= async (e)=>{
    // console.log('allocate');
    // setButtonVisibility(false);
    const actual=e.target[0].value;
     const actualMaterialCost= parseInt(actual,10);
      const queryData={
       actualMaterialCost,
      };
      console.log(queryData);
      try{
      await axiosInstance.post(`/api/complaint/accept/${complaintId}/`,queryData);
      history.push("/ui/store");
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
        history.push("/ui/store");
      }
    }
  }
  const formButtons = () => {
    
    return (
      <Grid container spacing={1} style={{ marginTop: "15px" }}>
        <Notification
          open={open}
          setOpen={setOpen}
          message={message}
          type={messageType}
        />
        <form onSubmit={allocateHandler}>
        <Grid item md={2} xs={12}>
        <FormControl className={classes.formControl}>
          <TextField
          type= "number"
          name="actual"
            className={classes.style}
            fullWidth
            label="Actual material cost"
            size="small"
            aria-readonly={true}
            value={totalCostOrdered()+totalCostStorematerial()}
            // onChange={(event) =>{setactualCost(event.target.value);
            // console.log(actualCost);
            // setButtonVisibility(true);}}
          />
          <br/><br/>
        </FormControl>
      </Grid>
  
        <Grid item md={5} xs={8}>
          <Button
            className={[classes.button, classes.acceptBtn].join(" ")}
            type="submit"
            size="large"
            variant="contained"
            // onClick={allocateHandler}
            fullWidth
          >
            Allocate Material
          </Button>
        </Grid>
    </form>
      </Grid>
    );
  };
  const material = () => {
    console.log(StoreMaterial);
    return (
      <div>
        <br></br>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Typography variant="h5" align="center">
              Material Required
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" align="center">
              Material available
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" align="center">
              Material to be ordered
            </Typography>
          </Grid>
          <Grid item md={6} xs={12}>
            <Table aria-label="simple table">
              <Paper elevation={2}>
                <TableHead>
                  <TableRow>
                    <TableCell align="left" width="40%">
                      Material
                    </TableCell>
                    <TableCell align="left" width="40%">
                      Unit cost
                    </TableCell>
                    <TableCell
                      align="left"
                      component="th"
                      scope="row"
                      width="200px"
                    >
                      Units
                    </TableCell>
                  </TableRow>
                </TableHead>
              </Paper>
              <TableBody>
                {StoreMaterial.map((item, index) => (
                  <React.Fragment key={index}>
                    {displayInfo(index, item)}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
            <Grid item xs={12}>
              <Typography
                align="right"
                variant="subtitle1"
                className={classes.costText}
              >
                Total Cost : {totalCostStorematerial()}
              </Typography>
            </Grid>
          </Grid>
          <Grid item md={6} xs={12}>
            <Table aria-label="simple table">
              <Paper elevation={2}>
                <TableHead>
                  <TableRow>
                    <TableCell align="left" width="40%">
                      Material
                    </TableCell>
                    <TableCell align="left" width="40%">
                      Unit Cost
                    </TableCell>
                    <TableCell
                      align="left"
                      component="th"
                      scope="row"
                      width="200px"
                    >
                      Units
                    </TableCell>
                  </TableRow>
                </TableHead>
              </Paper>
              <TableBody>
                {OrderedMaterial.map((item, index) => (
                  <React.Fragment key={index}>
                    {displayInfo(index, item)}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
            <Grid item xs={12}>
              <Typography
                align="right"
                variant="subtitle1"
                className={classes.costText}
              >
                Total Cost : {totalCostOrdered()}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid></Grid>
      </div>
    );
  };
  function totalCostOrdered() {
    let total = 0;
    OrderedMaterial.forEach((item) => {
      total += item.approxCost * item.units;
    });
    return total;
  }
  function totalCostStorematerial() {
    let total = 0;
    StoreMaterial.forEach((item) => {
      total += item.approxCost * item.units;
    });
    return total;
  }
  
  function displayInfo(index, item) {
    console.log("display called");
    return (
      <TableContainer component={Paper} elevation={3}>
        <TableRow key={index}>
          <TableCell align="left" width="40%">
            {item.material}
          </TableCell>
          <TableCell align="left" width="40%">
            {item.approxCost}
          </TableCell>
          <TableCell align="left" width="200px">
            {item.units}
          </TableCell>
        </TableRow>
      </TableContainer>
    );
  }

  if (!complaint) return <Loader />;

  return (
    <React.Fragment>
      <Grid container spacing={6}>
        <Grid item xs={12} md={9}>
          <Typography variant="h4">Request Details</Typography>
        </Grid>
        <Grid
          item
          xs={5}
          md={3}
          align={width > 960 ? "right" : "left"}
          className={classes.backButton}
        >
          <Link to="/ui/store">
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
      {StoreMaterial.length !== 0 || OrderedMaterial.length !== 0
        ? material()
        : null}
      <Typography
        align="center"
        variant="subtitle1"
        className={classes.costText_total}
      >
        Total Estimated cost :{" "}
        {totalCostOrdered() + totalCostStorematerial()}
        

      </Typography>
      {editComplaint && (
        <div className={classes.div}>
          { formButtons()}
        </div>
      )}
     
    </React.Fragment>
  );
}
