const router = require("express").Router();

const { verify, verifyAdmin } = require("../verifyAuthToken");
const {
  validateCreateSchema,
  validateAcceptSchema,
  validateRejectSchema,
} = require("./validate");
const Complaint = require("./model");
const User = require("../login/model");
// const sendMail = require('../mail');
const Material = require("../material/model");
const Store = require("../store/model");
const { generatePdf, removePdf } = require("../pdf");
const { userRole, validUserRoles } = require("../utils/userRole");
// let currId=10;

// const delteMaterialAndUpdateStore = (complaintId) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const { availableInStore } = await Material.findOne(
//         { complaintId },
//         { availableInStore: 1 }
//       );

//       availableInStore.forEach(
//         async (material) =>
//           await Store.updateOne(
//             { _id: material.materialId },
//             { $inc: { quantity: material.quantity } }
//           )
//       );

//       await Material.deleteOne({ complaintId });

//       resolve(availableInStore);
//     } catch (error) {
//       reject(error);
//     }
//   });
// };

router.get("/:id", verify, async (req, res) => {
  try {
    console.log(req.body);
    if (!validUserRoles(req.params.id))
      return res.status(400).json({
        success: 0,
        error: "Invalid Request",
      });
    console.log(req.body);
    const { department, role } = await User.findOne({
      _id: req.user._id,
    }).select({
      _id: 0,
      department: 1,
      role: 1,
    });

    if (req.params.id !== userRole(role))
      return res.status(403).json({
        success: 0,
        error: "Unauthorized",
      });
    console.log(req.body);
    let query;
    switch (req.params.id) {
      case "student":
        query = { userId: req.user._id };
        break;
      case "hod":
        query = { department };
        break;
      case "admin":
        query = { stage: { $gte: 2 } };
        break;
      case "committee":
        query = {
          stage: { $gte: 3 },
          [`grantAccessTo.${department}.isGranted`]: true,
        };
        break;
      case 'director':
        query = { stage: { $gte: 4 } };
        break;
        case 'store':
          query = {stage :{$gte:5},
          status :['Forwarded to store','Material allocated'],
         
        };
    }

    const result = await Complaint.find(query)
      .select({
        department: 1,
        date: 1,
        workType: 1,
        status: 1,
        compId: 1,
      })
      .sort({ date: -1 });

    return res.status(200).json({
      success: 1,
      complaints: result,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: 0,
      error: "Unable to fetch data",
      errorReturned: error,
    });
  }
});

router.get("/getMaterial/:id", verifyAdmin, async (req, res) => {
  try {
    if (!req.params.id)
      return res.status(400).json({
        success: 0,
        error: "Complaint id not provided",
      });

    const existingMaterials = await Material.findOne(
      { complaintId: req.params.id },
      { availableInStore: 1, orderedMaterial: 1 }
    ).populate({
      path: "availableInStore.materialId",
      model: "Store",
      select: { material: 1, cost: 1 },
    });
    console.log(existingMaterials);
    return res.status(200).json({
      success: 1,
      availableInStore: existingMaterials
        ? existingMaterials.availableInStore
        : [],
      orderedMaterial: existingMaterials
        ? existingMaterials.orderedMaterial
        : [],
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: 0,
      error: "Could not find data",
    });
  }
});

router.post("/", verify, validateCreateSchema, async (req, res) => {
  try {
    const d = new Date();
    let year = d.getFullYear();

    // const ld= new Date();
    // const lld= new Date(ld);

    // lld.setDate(lld.getDate()-365);

    // let ly= lld.getFullYear();
    // .body.userId req= req.user._id;
    req.body.userId = req.user._id;
    // if(req.body.department=="Electronics"){
    //   const dep="elec";
    // }
    // console.log(year+dep+req.user._id);

    // const docs = await Complaint.find({ department: req.body.department, date: { $gte: new Date(Date.now() - 31556926000) } });
    const docs = await Complaint.find({ department: req.body.department });
    var dateCounter = 0;
    for (var key in docs) {
      if (docs.hasOwnProperty(key))
        // console.log(docs[key].date);
        var yeeeaar = docs[key].date;
      let yeartext = yeeeaar.toString();
      let finyear = yeartext.slice(11, 15);
      console.log(finyear);

      if (finyear == year) {
        dateCounter++;
      }
    }

    console.log(dateCounter);

    console.log(docs);
    console.log(docs.length);
    // var len = docs.length + 1 + "";
    var len = dateCounter + 1 + "";
    var str1 = len.padStart(5, "0");

    var compnewId = year + req.body.department + str1;
    // currId++;
    // var compId="";

    console.log(req.body);
    switch (req.body.department) {
      case "Computer Science and Engineering":
        var compnewId = year + "CSE" + str1;
        break;
      case "Information Technology":
        var compnewId = year + "IT" + str1;
        break;
      case "Electrical":
        var compnewId = year + "ELEC" + str1;
        break;
      case "Electronics":
        var compnewId = year + "ELN" + str1;
        break;
      case "Civil":
        var compnewId = year + "CIV" + str1;
        break;
      case "Mechanical":
        var compnewId = year + "MECH" + str1;
        break;
    }

    req.body.compId = compnewId;

    const { email } = await User.findOne({ _id: req.user._id }).select({
      email: 1,
    });

    const newComplaint = new Complaint(req.body);
    const result = await newComplaint.save();

    // await sendMail(email, 'Complaint Received successfully...');

    return res.status(200).json({
      success: 1,
      result,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: 0,
      error: "Unable to Create Complaint",
    });
  }
});

router.get("/details/:id", verify, async (req, res) => {
  try {
    console.log(req.body);
    if (!req.params.id)
      return res.status(400).json({
        success: 0,
        error: "Complaint id not provided",
      });
    console.log(req.body);

    const complaint = await Complaint.findOne({ compId: req.params.id })
      .populate("userId", "email")
      .exec();

    if (!complaint)
      return res.status(400).json({
        success: 0,
        error: "Could not find requested complaint",
      });

    return res.status(200).json({
      success: 1,
      complaint,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: 0,
      error: "Unable to find details",
    });
  }
});

router.post("/accept/:id", verify, validateAcceptSchema, async (req, res) => {
  try {
    // console.log(req.body);
    if (!req.params.id)
      return res.status(400).json({
        success: 0,
        error: "Complaint id not provided",
      });

    const {
      userId: { email },
      grantAccessTo
    } = await Complaint.findOne({ compId: req.params.id }, { grantAccessTo: 1})
      .populate("userId", "email")
      .exec();
    
      const Stage = await Complaint.findOne({ compId : req.params.id })
      .select({
        stage : 1
      });


    if (req.user.userType === "hod") {
      await Complaint.updateOne(
        { compId: req.params.id },
        {
          $set: {
            stage: 2,
            sourceOfFund:
              req.body.sourceOfFund === "Other"
                ? req.body.otherSourceOfFund
                : req.body.sourceOfFund,
            status: "Forwarded to Administrative Officer",
          },
        }
      );
    }
    if (req.user.userType === "store") {
      console.log(req.body.actualMaterialCost);
      await Complaint.updateOne(
        { compId: req.params.id },
        {
          $set: {
            actualMaterialCost:req.body.actualMaterialCost,
            stage: 6,
            status: 'Material allocated',
          },
        }
      );
    }

    if (req.user.userType === "admin") {

      console.log(Stage);
      
      if(Stage.stage==7){
        await Complaint.updateOne(
          {compId: req.params.id },
          {
            $set: {
              stage: 8,
              status: 'Work done',
              // grantAccessTo: [grantAccessT],
            },
          }
        );
        return res.status(200).json({
          success: 1,
        });
      }

      if(Stage.stage==6){
        await Complaint.updateOne(
          {compId: req.params.id },
          {
            $set: {
              stage: 7,
              status: 'Work in progress',
              // grantAccessTo: [grantAccessT],
            },
          }
        );
        return res.status(200).json({
          success: 1,
        });
      }


      const grantAccessT = grantAccessTo.length
        ? grantAccessTo[0]
        : new Object();
      if (req.body.Civil) grantAccessT.Civil = { isGranted: true };
      if (req.body.Mechanical) grantAccessT.Mechanical = { isGranted: true };
      if (req.body.Electrical) grantAccessT.Electrical = { isGranted: true };
      if(req.body.director)grantAccessT.director={isGranted:true};

      if(req.body.director){
        await Complaint.updateOne(
          {compId: req.params.id },
          {
            $set: {
              stage: 4,
              status: 'Forwarded to director',
              grantAccessTo: [grantAccessT],
            },
          }
        );
      }

      else{
        await Complaint.updateOne(
        { compId: req.params.id },
        {
          $set: {
            stage: 3,
            status: 'Forwarded to Maintanance Commitee',
            grantAccessTo: [grantAccessT],
          },
        }
      );
    }

      // await generatePdf();
      // await sendMail(email, status, true);
      // await removePdf();
    }

    if (req.user.userType === "committee") {
      console.log(Stage);
      
      //forward complaint to administraticve officer
      //change grantAccessto object's isSubmitted field etc.
  
      if(Stage.stage==7){
        await Complaint.updateOne(
          {compId: req.params.id },
          {
            $set: {
              stage: 8,
              status: 'Work done',
              // grantAccessTo: [grantAccessT],
            },
          }
        );
        return res.status(200).json({
          success: 1,
        });
      }

      if(Stage.stage==6){
        await Complaint.updateOne(
          {compId: req.params.id },
          {
            $set: {
              stage: 7,
              status: 'Work in progress',
              // grantAccessTo: [grantAccessT],
            },
          }
        );
        return res.status(200).json({
          success: 1,
        });
      }

      const { department } = await User.findOne({ _id: req.user._id });
      console.log(department);

      const complaint = await Complaint.findOne({
        compId: req.params.id,
        [`grantAccessTo.${department}.isGranted`]: true,
      });

      if (complaint) {
        complaint.grantAccessTo[0][department].isSubmitted = true;

        const obj = complaint.grantAccessTo[0];

        let flg = true;

        if (obj.Civil.isGranted && !obj.Civil.isSubmitted) flg = false;

        if (obj.Electrical.isGranted && !obj.Electrical.isSubmitted)
          flg = false;

        if (obj.Mechanical.isGranted && !obj.Mechanical.isSubmitted)
          flg = false;

        if (flg) {
          complaint.status = "Forwarded to director";
          complaint.stage++;
        }

        await complaint.save();
      }
    }
    if(req.user.userType === 'director'){
      console.log(grantAccessTo[0].director.isGranted);
      if(grantAccessTo[0].director.isGranted)
      {
        await Complaint.updateOne(
          { compId: req.params.id },
          {
            $set: {
              stage: 6,
              status: 'Accepted by director',
            },
          }
        );
      }
      else{
      await Complaint.updateOne(
        { compId: req.params.id },
        {
          $set: {
            stage: 5,
            status: 'Forwarded to store',
          },
        }
      );
      }
    }
    if(req.user.userType === 'student'){
      await Complaint.updateOne(
        { compId: req.params.id },
        {
          $set: {
            stage: 9,
            status: 'Acknowledged by user',
          },
        }
      );
    }

    return res.status(200).json({
      success: 1,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: 0,
      error: "Could not complate operation",
    });
  }
});

router.post("/reject/:id", verify, validateRejectSchema, async (req, res) => {
  try {
    if (!req.params.id)
      return res.status(400).json({
        success: 0,
        error: "Complaint id not provided",
      });

    const {
      userId: { email },
    } = await Complaint.findOne({ compId: req.params.id }) //*
      .populate("userId", "email")
      .exec();

    req.body.rejected = true;

    req.body.status = `Rejected by ${req.user.userType}`;

    await Complaint.updateOne(
      { compId: req.params.id }, //*
      {
        $set: req.body,
      }
    );

    // await sendMail(
    //   email,
    //   `${req.body.status} \n Reason: ${req.body.reasonForRejection}`
    // );

    // if (req.user.userType === "admin")
    //   await delteMaterialAndUpdateStore(req.params.id);

    return res.status(200).json({
      success: 1,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: 0,
      error: "Could not complate operation",
    });
  }
});

module.exports = router;
