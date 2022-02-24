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
  const [actualCostArray,setActualCostArray]=useState([]);
  const [value, setValue] = useState("");

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
    // setButtonVisibility(false);
    e.preventDefault();
    console.log('allocate');
    var queryData,queryData2;
    if(OrderedMaterial.length){
    var newArray = Object.values(actualCostArray.reduce((acc,cur)=>Object.assign(acc,{[cur.material]:cur}),{}));
newArray.sort(function(a,b){
  return a.index-b.index;
})
    var actualCostArrayObj=[];
    for(let i=0;i<newArray.length;i++)
    {
      actualCostArrayObj.push(newArray[i].actual);
    }
   queryData={
 actualCostArrayObj,complaintId
   };
  }
   
    const actual=e.target[0].value;
     const actualMaterialCost= parseInt(actual,10);
      queryData2={
       actualMaterialCost,
      };
    try{
      if(OrderedMaterial.length)
      await axiosInstance.put(`/api/material/actualcost/${complaintId}/`,queryData);
      await axiosInstance.post(`/api/complaint/accept/${complaintId}/`,queryData2);
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
        <Grid item md={12} xs={12}>
        <FormControl className={classes.formControl}>
          <TextField
          type= "number"
          name="actual"
            className={classes.style}
            fullWidth
            label="Actual material cost"
            size="small"
            aria-readonly={true}
            value={totalOrderedActual()+totalCostStorematerial()}
            // onChange={(event) =>{setactualCost(event.target.value);
            // console.log(actualCost);
            // setButtonVisibility(true);}}
          />
          <br/><br/>
        </FormControl>
      </Grid>
  
        <Grid item md={12} xs={12}>
          <Button
            className={[classes.button, classes.acceptBtn].join(" ")}
            type="submit"
           style={{width:'100%'}}
            size="large"
            variant="contained"
            //  onClick={allocateHandler}
            fullWidth
          >
            Allocate Material
          </Button>
        </Grid>
    </form>
      </Grid>
    );
  };
  const handleChange = (event,item,index) => {
    setValue(event.target.value);
    setActualCostArray(actualCostArray => [...actualCostArray,{material:item.material,actual:event.target.valueAsNumber,units:item.units,index:index}]) 
  };

  function displayOrder(index, item) {
    console.log("display called");
    console.log(index);
    return (
      <TableContainer component={Paper} elevation={3}>
      <TableRow key={index}>
        <TableCell align="left" width="30%">
          {item.material}
        </TableCell>
        <TableCell align="left" width="40%">
        <FormControl className={classes.formControl}>
          <TextField
            className={classes.numberInput}
            type="number"
            name={item.material}
            fullWidth
            required
            autoFocus
            InputLabelProps={{ shrink: true }}
            inputProps={{ 'data-testid': 'lAmount' }}
            label="Actual Cost"
            size="small"
            onChange={(event)=>handleChange(event,item,index)}
          />
        </FormControl>
        </TableCell>
        <TableCell align="right" width="20%">
          {item.units}
        </TableCell>
      </TableRow>
    </TableContainer>
    );
  }

  const ordered = () => {
    return (
      <>
        <br></br>
        <br></br>
        <Grid item xs={12} md={12}>
          <Typography variant="h5" align="center">
           Fill the Actual Cost 
          </Typography>
        </Grid>
        <Grid container alignItems="center" justifyContent="center">
          <Grid item md={6} xs={12}>
            <Table aria-label="simple table">
              <Paper elevation={2}>
                <TableHead>
                  <TableRow>
                    <TableCell align="left" width="40%">
                     Material
                    </TableCell>
                    <TableCell align="left" width="50%">
                     Actual unit cost
                    </TableCell>
                    <TableCell
                      align="left"
                      component="th"
                      scope="row"
                      width="40%"
                    >
                     Units
                    </TableCell>
                  </TableRow>
                </TableHead>
              </Paper>
              <TableBody>
                {OrderedMaterial.map((item, index) => (
                  <React.Fragment key={index}>
                    {displayOrder(index, item)}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </Grid>
        </Grid>
      </>
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
  function totalOrderedActual() {
    let total = 0;
    Object.values(actualCostArray.reduce((acc,cur)=>Object.assign(acc,{[cur.material]:cur}),{})).forEach((item) => {
      total += item.actual * item.units;
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
           {OrderedMaterial.length !== 0 ? ordered() : null}
           { formButtons()}
        </div>
      )}
       {/* <div className={classes.div}>
           {OrderedMaterial.length !== 0 ? ordered() : null}
           { formButtons()}
        </div> */}
    </React.Fragment>
  );
}
