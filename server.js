import "dotenv/config";
import express from "express";
// import { fileURLToPath } from "url";
// import { dirname } from "path";
import bodyParser from "body-parser";
import cors from "cors";

import { Checkout } from "checkout-sdk-node";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

app.use(express.static("./"));
app.use(bodyParser.json());
app.use(cors());

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

const cko = new Checkout(`${process.env.CKO_SECRET_KEY}`);

app.get("/", (req, res) => {
  res.send("Server is runing ...");
});

// ## POST to proccess the payment with 3Ds
app.post("/request_payment", async (req, res, next) => {
  const data = req.body;

  // console.log(data);

  const transaction = await cko.payments.request({
    source: {
      type: "token",
      token: data.token,
    },
    amount: data.total_amount,
    currency: "USD",
    "3ds": {
      enabled: true,
    },
    success_url:
      "https://checkout-test3ds.netlify.app/pages/payment_success.html",
    failure_url: `https://checkout-test3ds.netlify.app/pages/payment_failed.html`,
  });

  res.status(200).json(transaction);
});

//## GET to retrive the payment details with cko_id
app.get("/payments/:id", async (req, res) => {
  const { id } = req.params;

  const payment = await cko.payments.get(`${id}`);
  res.status(200).json(payment);
});
