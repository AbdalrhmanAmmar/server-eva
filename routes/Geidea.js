import express from "express";
const router = express();


router.post('/api/payment/callback', async (req, res) => {
  const { safetyRequestId } = req.query;
  const { paymentStatus, paymentReferenceNumber } = req.body;

  if (paymentStatus === 'Paid') {
    await ServiceFormModel.findByIdAndUpdate(safetyRequestId, {
      status: 'paid',
      paymentDetails: req.body
    });
  } else {
    await ServiceFormModel.findByIdAndUpdate(safetyRequestId, {
      status: 'rejected',
      paymentDetails: req.body
    });
  }

  res.sendStatus(200);
});


export default router;