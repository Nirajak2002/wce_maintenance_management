import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import axiosInstance from "../../helpers/axiosInstance";
import { useHistory, useParams, Link } from "react-router-dom";
import {
  FormLabel,
  FormControl,
  FormGroup,
  Checkbox,
  Grid,
  Button,
  Radio,
  RadioGroup,
  TextField,
} from "@material-ui/core/";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import OrderedLabourForm from "./LabourOrder";
const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  formControl: {
    margin: theme.spacing(3),
  },
  button: {
    borderRadius: 0,
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
}));

export default function CommitteeSelect({ submitHandler, rejectHandler }) {
  const classes = useStyles();
  const { complaintId } = useParams();
  const initialState = {
    Civil: false,
    Electrical: false,
    Mechanical: false,
    director: false,
  };

  const [committee, setCommittee] = useState(initialState);
  const [value, setValue] = useState("");
  const [orderedLabours, setOrderedLabours] = useState([]);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  useEffect(() => {
    (async () => {
      try {
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
        console.log(labour);
        setOrderedLabours(labour);
      } catch (error) {
        try {
          setMessage(error.response.data.error);
          setMessageType("error");
          setOpen(true);
        } catch (error) {
          setMessageType("error");
          setOpen(true);
        }
      }
    })();
  }, []);

  const handleChange = (event) => {
    setValue(event.target.value);
    if (event.target.value.startsWith("director")) {
      console.log("if true");
      setCommittee({ ...initialState, director: true });
    } else {
      setCommittee({ ...initialState, [event.target.value]: true });
    }
  };
  const error = value.length === 0;

  return (
    <React.Fragment>
      <FormControl component="fieldset" className={classes.formControl}>
        <FormLabel component="legend">Select Committee</FormLabel>
        <RadioGroup
          aria-label="committee"
          name="committee"
          value={value}
          onChange={handleChange}
        >
          <FormControlLabel value="Civil" control={<Radio />} label="Civil" />
          <FormControlLabel
            value="Electrical"
            control={<Radio />}
            label="Electrical"
          />
          <FormControlLabel
            value="Mechanical"
            control={<Radio />}
            label="Mechanical"
          />
          <FormControlLabel
            value="director-Quotation"
            control={<Radio />}
            label="Director (Quotation)"
          />
          <FormControlLabel
            value="director-Tender"
            control={<Radio />}
            label="Director (Tender)"
          />
          <FormControlLabel
            value="director-Labour"
            control={<Radio />}
            label="Admin (Labour)"
          />
        </RadioGroup>
        {value === "director-Labour" ? (
          <Grid item xs={12} md={12}>
            <FormControl className={classes.formControl}>
              <OrderedLabourForm
                complaintId={complaintId}
                orderedLabours={orderedLabours}
                setOrderedLabours={setOrderedLabours}
              />
            </FormControl>
          </Grid>
        ) : (
          <Grid item xs={6} md={3} style={{ marginBottom: "69px" }}></Grid>
        )}
        <FormHelperText error={error}>
          {error ? "Select one" : "  "}
        </FormHelperText>
      </FormControl>

      <Grid container className={classes.marginTop} spacing={1}>
        <Grid item md={4} xs={8}>
          <Button
            className={[classes.button, classes.rejectBtn].join(" ")}
            size="large"
            variant="contained"
            onClick={rejectHandler}
          >
            Reject Request
          </Button>
        </Grid>
        <Grid item md={4} xs={4}>
          <Button
            className={[classes.button, classes.acceptBtn].join(" ")}
            type="submit"
            size="large"
            variant="contained"
            onClick={() => {
              if (!error) submitHandler(committee);
            }}
          >
            Submit
          </Button>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
