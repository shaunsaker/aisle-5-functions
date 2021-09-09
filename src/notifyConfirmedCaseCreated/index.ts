import * as functions from "firebase-functions";

const notifyConfirmedCaseCreated = functions.firestore
  .document("confirmedCases/{confirmedCaseId}")
  .onCreate(async (snapshot, context) => {});

export { notifyConfirmedCaseCreated };
